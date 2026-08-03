from flask import Blueprint, request, jsonify
from app.services.explore import ExploreService, WorldService, TrendingService, SearchService, ExploreValidator

explore_bp = Blueprint('explore', __name__)

def serialize_place(p):
    """Utility helper to serialize place models."""
    rating = 3.5
    reviews = 0
    if p.google_detail:
        rating = float(p.google_detail.rating or 3.5)
        reviews = int(p.google_detail.review_count or 0)
        
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "rating": rating,
        "review_count": reviews,
        "average_cost": float(p.average_cost) if p.average_cost else None,
        "vibe_summary": p.ai_metadata.vibe_summary if p.ai_metadata else "",
        "cover_photo": p.images[0].image_url if p.images else None
    }

@explore_bp.route('/worlds', methods=['GET'])
def get_worlds():
    """Endpoint returning all curated explore worlds."""
    worlds = WorldService.get_all_worlds()
    return jsonify({
        "success": True,
        "message": "Explore worlds loaded.",
        "data": worlds,
        "errors": []
    }), 200

@explore_bp.route('/world/<world_id>', methods=['GET'])
def get_world(world_id):
    """Endpoint returning world details and ranked places."""
    details = ExploreService.get_world_details(world_id)
    if not details:
        return jsonify({
            "success": False,
            "message": f"Curated world '{world_id}' not found.",
            "data": {},
            "errors": ["World not found."]
        }), 404
        
    return jsonify({
        "success": True,
        "message": "World details loaded.",
        "data": details,
        "errors": []
    }), 200

@explore_bp.route('/trending', methods=['GET'])
def get_trending():
    """Endpoint returning top trending places."""
    places = TrendingService.get_trending_places(limit=10)
    data = [serialize_place(p) for p in places]
    return jsonify({
        "success": True,
        "message": "Trending places retrieved.",
        "data": data,
        "errors": []
    }), 200

@explore_bp.route('/hidden-gems', methods=['GET'])
def get_hidden_gems():
    """Endpoint returning top hidden gems."""
    places = TrendingService.get_hidden_gems_places(limit=10)
    data = [serialize_place(p) for p in places]
    return jsonify({
        "success": True,
        "message": "Hidden gems retrieved.",
        "data": data,
        "errors": []
    }), 200

@explore_bp.route('/city/<city_name>', methods=['GET'])
def get_city_places(city_name):
    """Endpoint returning curated places within a city."""
    places = SearchService.search_places(city_name=city_name)
    data = [serialize_place(p) for p in places]
    return jsonify({
        "success": True,
        "message": f"Places for city '{city_name}' retrieved.",
        "data": data,
        "errors": []
    }), 200

@explore_bp.route('/search', methods=['GET'])
def search():
    """Endpoint supporting structured search and filters."""
    # 1. Validate inputs
    is_valid, errors = ExploreValidator.validate_search_params(request.args)
    if not is_valid:
        return jsonify({
            "success": False,
            "message": "Validation failed.",
            "data": {},
            "errors": [errors[k] for k in errors]
        }), 400
        
    city = request.args.get('city')
    area = request.args.get('area')
    category = request.args.get('category')
    budget = request.args.get('budget')
    search_term = request.args.get('search')
    
    # Parse comma-separated tags list
    tags_raw = request.args.get('tags', '')
    tags_list = [t.strip() for t in tags_raw.split(',') if t.strip()] if tags_raw else []
    
    places = SearchService.search_places(
        city_name=city,
        area_name=area,
        category_name=category,
        max_budget=budget,
        tags_list=tags_list,
        search_query=search_term
    )
    
    data = [serialize_place(p) for p in places]
    return jsonify({
        "success": True,
        "message": "Search completed successfully.",
        "data": data,
        "errors": []
    }), 200
