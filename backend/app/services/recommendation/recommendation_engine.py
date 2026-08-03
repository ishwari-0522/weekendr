import os
from app.services.recommendation.template_loader import TemplateLoader
from app.services.recommendation.budget_allocator import BudgetAllocator
from app.services.recommendation.place_selector import PlaceSelector
from app.services.recommendation.distance_optimizer import DistanceOptimizer
from app.services.recommendation.recommendation_validator import RecommendationValidator
from app.utils.logging import sync_logger, error_logger

class RecommendationEngine:
    """
    Orchestration engine that takes user preferences and constructs a recommended sequence
    of places using deterministic templates, budget weighting, and distance optimization.
    """
    def __init__(self, template_path=None):
        self.template_loader = TemplateLoader(template_path)
        self.budget_allocator = BudgetAllocator()
        self.place_selector = PlaceSelector()
        self.distance_optimizer = DistanceOptimizer()
        self.validator = RecommendationValidator()

    def get_recommendations(self, city, area=None, budget=None, duration=None, group_type=None, template_name=None, preferences=None):
        """
        Main entry point for generating structured place recommendations.
        """
        sync_logger.info("Recommendation request received: City: %s, Area: %s, Template: %s, Budget: %s", 
                         city, area, template_name, budget)
                         
        # 1. Resolve experience template config
        template_config = self.template_loader.get_template(template_name)
        if not template_config:
            error_logger.error("Template '%s' is not defined in configurations.", template_name)
            return {"error": f"Template '{template_name}' not found."}
            
        sequence = template_config.get("sequence", [])
        durations = template_config.get("durations", {})
        
        # 2. Allocate budget across categories
        allocated_budgets = {}
        if budget:
            allocated_budgets = self.budget_allocator.allocate_budget(budget, template_config)
            
        # 3. Retrieve candidates lists for each category step
        # Consolidate user preferences and group types as tags
        query_preferences = list(preferences) if preferences else []
        if group_type:
            # Map group type (Friends, Couple, Solo, Family) to tags
            # e.g., Couple -> Date Night, Family -> Family Friendly, Friends -> Student Friendly
            if group_type.lower() == "couple":
                query_preferences.append("Date Night")
            elif group_type.lower() == "family":
                query_preferences.append("Family Friendly")
            elif group_type.lower() == "friends":
                query_preferences.append("Student Friendly")
                
        candidates_per_step = []
        for category in sequence:
            allocated_amount = allocated_budgets.get(category)
            candidates = self.place_selector.select_candidates(
                city_name=city,
                area_name=area,
                category_name=category,
                allocated_budget=allocated_amount,
                preferences=query_preferences
            )
            
            # If area is specified and no candidates are found, fall back to city-wide search
            if not candidates and area:
                sync_logger.warning("No candidates in area '%s' for '%s'. Falling back to City wide search.", area, category)
                candidates = self.place_selector.select_candidates(
                    city_name=city,
                    area_name=None, # City wide
                    category_name=category,
                    allocated_budget=allocated_amount,
                    preferences=query_preferences
                )
                
            candidates_per_step.append(candidates)
            
        # Verify we have candidates for all required steps
        for idx, candidates in enumerate(candidates_per_step):
            if not candidates:
                category_name = sequence[idx]
                error_logger.warning("No candidate places found in database for category: '%s'", category_name)
                return {"error": f"Insufficient database records for category: '{category_name}'."}

        # 4. Route Optimization (minimizing travel distance)
        optimized_route = self.distance_optimizer.find_optimized_route(candidates_per_step)
        
        # 5. Validation Check
        is_valid, reason = self.validator.validate_recommendation(optimized_route, budget, duration)
        if not is_valid:
            error_logger.warning("Route validation failed: %s", reason)
            # Proceed anyway but log a warning, or return error if invalid
            
        # 6. Calculate total output metrics
        estimated_budget = 0.0
        estimated_duration = 0
        price_map = {0: 100.0, 1: 200.0, 2: 500.0, 3: 1000.0, 4: 2000.0}
        
        recommended_places_json = []
        route_lat_lngs = []
        
        for idx, place in enumerate(optimized_route):
            category = sequence[idx]
            
            # Estimate cost
            cost = 300.0
            rating = 0.0
            reviews = 0
            google_place_id = None
            google_maps_url = None
            phone = None
            website = None
            price_level = None
            
            if place.average_cost:
                cost = float(place.average_cost)
            elif place.google_detail:
                google_detail = place.google_detail
                cost = price_map.get(google_detail.price_level, 400.0)
                google_place_id = google_detail.google_place_id
                google_maps_url = google_detail.google_maps_url
                rating = google_detail.rating or 0.0
                reviews = google_detail.review_count or 0
                phone = google_detail.phone
                website = google_detail.website
                price_level = google_detail.price_level
                
            estimated_budget += cost
            
            # Duration allocation
            stop_duration = durations.get(category, 60)
            estimated_duration += stop_duration
            
            # Image URL fallback
            image_url = None
            if place.images and len(place.images) > 0:
                image_url = place.images[0].image_url
                
            recommended_places_json.append({
                "sequence": idx + 1,
                "place_id": place.id,
                "name": place.name,
                "category": category,
                "area": place.area.name,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "google_place_id": google_place_id,
                "google_maps_url": google_maps_url,
                "website": website,
                "phone": phone,
                "price_level": price_level,
                "estimated_cost": cost,
                "duration_mins": stop_duration,
                "rating": rating,
                "review_count": reviews,
                "image_url": image_url
            })
            
            route_lat_lngs.append((place.latitude, place.longitude))
            
        # Calculate transit distance
        total_transit_distance = 0.0
        for i in range(len(route_lat_lngs) - 1):
            p1 = route_lat_lngs[i]
            p2 = route_lat_lngs[i+1]
            total_transit_distance += self.distance_optimizer.calculate_distance_meters(p1[0], p1[1], p2[0], p2[1])
            
        # Construct structured reasoning stats
        avg_rating = sum(p["rating"] for p in recommended_places_json) / len(recommended_places_json)
        
        reasoning = {
            "target_area": area or "City-wide",
            "categories_matched": len(recommended_places_json),
            "average_google_rating": round(avg_rating, 2),
            "total_transit_distance_meters": round(total_transit_distance, 1),
            "applied_group_tags": query_preferences,
            "budget_status": "within_limits" if not budget or estimated_budget <= float(budget) else "above_limits"
        }
        
        output = {
            "experience_template": template_name,
            "estimated_budget": round(estimated_budget, 2),
            "estimated_duration": estimated_duration,
            "recommended_places": recommended_places_json,
            "reasoning": reasoning
        }
        
        sync_logger.info("Recommendation generated successfully. Places count: %d, Estimated Budget: ₹%.2f", 
                         len(recommended_places_json), estimated_budget)
        return output
