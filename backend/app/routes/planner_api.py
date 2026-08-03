from flask import Blueprint, request, jsonify
from app.models import Place, City, Area, Category
from app.services.recommendation.recommendation_engine import RecommendationEngine
from app.services.experience_composer.composer import ExperienceComposer
from app.services.experience_editor.editor import ExperienceEditor
from app.services.planner.validators.planner_validator import PlannerValidator
from app.services.planner.schemas.openapi import OPENAPI_SPEC
from app.services.storytelling import generate_story
from app.utils.logging import error_logger

planner_api_bp = Blueprint('planner_api', __name__)
validator = PlannerValidator()
rec_engine = RecommendationEngine()
composer = ExperienceComposer()
editor = ExperienceEditor()

def make_json_response(success, message, data=None, errors=None, status_code=200):
    """Utility to return a consistent JSON response envelope."""
    return jsonify({
        "success": success,
        "message": message,
        "data": data or {},
        "errors": errors or []
    }), status_code

@planner_api_bp.route('/planner/generate', methods=['POST'])
def generate():
    """Generates a customized experience itinerary based on preferences."""
    try:
        req_data = request.get_json() or {}
        is_valid, errors, cleaned = validator.validate_generate_request(req_data)
        if not is_valid:
            return make_json_response(False, "Validation failed", errors=errors, status_code=400)
            
        # 1. Select places using Recommendation Engine
        recommended_places = rec_engine.recommend_places(
            city_name=cleaned["city"],
            area_name=cleaned["area"],
            budget=cleaned.get("budget"),
            duration_mins=cleaned.get("duration"),
            group_type=cleaned.get("group"),
            template_name=cleaned["experience_template"],
            preferences=cleaned.get("preferences")
        )
        
        if not recommended_places:
            return make_json_response(False, "No matching places found for selected criteria", status_code=404)
            
        # 3. Assemble timeline using Experience Composer
        timeline = composer.compose_experience(
            template_name=cleaned["experience_template"],
            recommended_places=recommended_places,
            budget=cleaned.get("budget"),
            duration=cleaned.get("duration"),
            group_type=cleaned.get("group"),
            preferences=cleaned.get("preferences")
        )
        
        if "error" in timeline:
            return make_json_response(False, timeline["error"], status_code=422)
            
        # 4. Generate AI Storytelling description
        story = generate_story(timeline, req_data)
        timeline["story"] = story

        return make_json_response(True, "Experience generated successfully", data=timeline)
    except Exception as e:
        error_logger.exception("Error in /planner/generate: %s", str(e))
        return make_json_response(False, "Internal server error", errors=[str(e)], status_code=500)

@planner_api_bp.route('/planner/edit', methods=['POST'])
def edit():
    """Edits an itinerary (add/remove/replace place stops) and updates the timeline."""
    try:
        req_data = request.get_json() or {}
        is_valid, errors, cleaned = validator.validate_edit_request(req_data)
        if not is_valid:
            return make_json_response(False, "Validation failed", errors=errors, status_code=400)
            
        current_places = cleaned["current_places"]
        action = cleaned["action"]
        
        # Resolve database place records into dicts matching selector format
        places_list = []
        for item in current_places:
            place_id = item.get("place_id")
            if not place_id:
                continue
            place = Place.query.get(place_id)
            if not place:
                continue
                
            image_url = place.images[0].image_url if place.images else None
            cost = float(place.average_cost) if place.average_cost else 300.0
            places_list.append({
                "place_id": place.id,
                "name": place.name,
                "category": place.category.name,
                "area": place.area.name,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "estimated_cost": cost,
                "image_url": image_url
            })
            
        # Apply edits using ExperienceEditor
        timeline = editor.apply_edit(
            places_list=places_list,
            action=action,
            budget=cleaned.get("budget"),
            duration=cleaned.get("duration"),
            template_name=cleaned["template_name"],
            itinerary_id=action.get("itinerary_id")
        )
        
        # Recalculate story after edits are applied
        story_params = {
            "experienceTemplate": cleaned["template_name"],
            "budget": cleaned.get("budget"),
            "group": req_data.get("group", "Couple")
        }
        story = generate_story(timeline, story_params)
        timeline["story"] = story

        return make_json_response(True, "Experience updated successfully", data=timeline)
    except Exception as e:
        error_logger.exception("Error in /planner/edit: %s", str(e))
        return make_json_response(False, "Internal server error", errors=[str(e)], status_code=500)

@planner_api_bp.route('/templates', methods=['GET'])
def get_templates():
    """Returns available experience templates configuration definitions."""
    try:
        templates = rec_engine.template_loader.templates
        return make_json_response(True, "Templates retrieved", data=templates)
    except Exception as e:
        return make_json_response(False, "Failed to load templates", errors=[str(e)], status_code=500)

@planner_api_bp.route('/categories', methods=['GET'])
def get_categories():
    """Returns list of supported place categories from the database."""
    try:
        categories = Category.query.all()
        data = [{"id": c.id, "name": c.name, "icon": c.icon} for c in categories]
        return make_json_response(True, "Categories retrieved", data=data)
    except Exception as e:
        return make_json_response(False, "Failed to load categories", errors=[str(e)], status_code=500)

@planner_api_bp.route('/areas', methods=['GET'])
def get_areas():
    """Returns areas filtered by city parameter."""
    try:
        city_name = request.args.get("city")
        if not city_name:
            return make_json_response(False, "city query parameter is required", status_code=400)
            
        areas = Area.query.join(City).filter(City.name == city_name).all()
        data = [{"id": a.id, "name": a.name, "latitude": a.latitude, "longitude": a.longitude} for a in areas]
        return make_json_response(True, "Areas retrieved", data=data)
    except Exception as e:
        return make_json_response(False, "Failed to load areas", errors=[str(e)], status_code=500)

@planner_api_bp.route('/place/<int:place_id>', methods=['GET'])
def get_place(place_id):
    """Returns full Place detail representation."""
    try:
        place = Place.query.get(place_id)
        if not place:
            return make_json_response(False, f"Place with ID {place_id} not found", status_code=404)
            
        rating = 0.0
        reviews = 0
        phone = None
        website = None
        price_level = None
        opening_hours = None
        
        if place.google_detail:
            g = place.google_detail
            rating = g.rating
            reviews = g.review_count
            phone = g.phone
            website = g.website
            price_level = g.price_level
            opening_hours = g.opening_hours
            
        data = {
            "id": place.id,
            "name": place.name,
            "description": place.description,
            "category": place.category.name,
            "area": place.area.name,
            "latitude": place.latitude,
            "longitude": place.longitude,
            "average_cost": float(place.average_cost) if place.average_cost else None,
            "rating": rating,
            "review_count": reviews,
            "phone": phone,
            "website": website,
            "price_level": price_level,
            "opening_hours": opening_hours,
            "tags": [tag.name for tag in place.tags],
            "images": [img.image_url for img in place.images]
        }
        return make_json_response(True, "Place details retrieved", data=data)
    except Exception as e:
        return make_json_response(False, "Failed to load place", errors=[str(e)], status_code=500)

@planner_api_bp.route('/planner/docs', methods=['GET'])
def get_swagger():
    """Returns OpenAPI 3.0 specs document."""
    return jsonify(OPENAPI_SPEC), 200
