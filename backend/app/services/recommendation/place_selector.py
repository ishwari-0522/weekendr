from app.models import Place, PlaceGoogleDetail, City, Area, Category, Tag
from app.database.db import db
from app.utils.logging import sync_logger

class PlaceSelector:
    """
    Selects candidate places from the database based on city, area, category,
    budget constraints, and preference tags.
    """
    def map_budget_to_price_level(self, allocated_budget):
        """Maps an allocated budget threshold to a maximum Google price_level."""
        if not allocated_budget:
            return 4 # No limit
            
        # Heuristics:
        # Budget <= 250: max price level 1 (Budget)
        # Budget <= 700: max price level 2 (Moderate)
        # Budget <= 1500: max price level 3 (Expensive)
        # Else: price level 4 (Luxury)
        if allocated_budget <= 250:
            return 1
        elif allocated_budget <= 700:
            return 2
        elif allocated_budget <= 1500:
            return 3
        return 4

    def select_candidates(self, city_name, area_name, category_name, allocated_budget=None, preferences=None):
        """
        Queries the database for matching active places.
        Filters by location, category, and budget.
        Ranks by tag similarity and rating.
        """
        query = db.session.query(Place).join(Area).join(City).join(Category)
        
        # 1. Core location and category filters
        query = query.filter(City.name == city_name)
        
        if area_name:
            query = query.filter(Area.name == area_name)
            
        query = query.filter(Category.name == category_name)
        query = query.filter(Place.is_active == True)
        
        # 2. Budget filter (joins PlaceGoogleDetail)
        if allocated_budget is not None:
            max_price_level = self.map_budget_to_price_level(allocated_budget)
            query = query.join(PlaceGoogleDetail).filter(
                (PlaceGoogleDetail.price_level <= max_price_level) | (PlaceGoogleDetail.price_level == None)
            )
            
        candidates = query.all()
        
        # 3. Post-query scoring based on preferences and Google ratings
        scored_candidates = []
        preferences_set = set(preferences) if preferences else set()
        
        for place in candidates:
            score = 0
            
            # Google rating factor
            rating = 0.0
            reviews = 0
            if place.google_detail:
                rating = place.google_detail.rating or 0.0
                reviews = place.google_detail.review_count or 0
                
            # Score +10 for each matching tag
            matching_tags_count = 0
            if preferences_set:
                place_tags = {tag.name for tag in place.tags}
                matching_tags_count = len(place_tags.intersection(preferences_set))
                score += matching_tags_count * 10
                
            # Rating weight (up to 5 points)
            score += rating
            
            # Review count weight (logarithmic scaling to favor well-reviewed spots)
            if reviews > 0:
                score += min(5.0, round(float(reviews) / 100.0, 2))
                
            scored_candidates.append({
                "place": place,
                "score": score,
                "rating": rating,
                "matching_tags": matching_tags_count
            })
            
        # Sort by total score descending
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        
        results = [item["place"] for item in scored_candidates]
        sync_logger.debug("Selected %d candidates for Category: %s (Budget: %s)", len(results), category_name, allocated_budget)
        return results
