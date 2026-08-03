from app.models import Place, PlaceGoogleDetail, Category, Area, City
from app.database.db import db
from app.services.recommendation.place_selector import PlaceSelector

class ReplacementEngine:
    """
    Intelligently queries database for alternative venues matching similar category,
    area, budget, and rating constraints, avoiding duplicates.
    """
    def __init__(self):
        self.selector = PlaceSelector()

    def find_alternative(self, category_name, area_name, city_name, max_budget=None, exclude_ids=None):
        """
        Finds a suitable replacement venue.
        exclude_ids: List of integer Place IDs to avoid (e.g. current itinerary stops).
        """
        if not exclude_ids:
            exclude_ids = []
            
        # Get max price level based on budget
        max_price_level = self.selector.map_budget_to_price_level(max_budget)
        
        # Query matching places
        query = db.session.query(Place).join(Area).join(City).join(Category)
        query = query.filter(City.name == city_name)
        query = query.filter(Category.name == category_name)
        query = query.filter(Place.is_active == True)
        
        # Exclude currently active places
        if exclude_ids:
            query = query.filter(Place.id.notin_(exclude_ids))
            
        # Try finding in the same area first
        area_query = query.filter(Area.name == area_name)
        
        # Join Google Details to sort by rating and limit price level
        area_query = area_query.outerjoin(PlaceGoogleDetail).filter(
            (PlaceGoogleDetail.price_level <= max_price_level) | (PlaceGoogleDetail.price_level == None)
        )
        
        # Order by rating and review count
        candidates = area_query.order_by(
            PlaceGoogleDetail.rating.desc(),
            PlaceGoogleDetail.review_count.desc()
        ).all()
        
        # Fallback to city-wide if no candidates exist in the specific area
        if not candidates:
            city_query = query.outerjoin(PlaceGoogleDetail).filter(
                (PlaceGoogleDetail.price_level <= max_price_level) | (PlaceGoogleDetail.price_level == None)
            )
            candidates = city_query.order_by(
                PlaceGoogleDetail.rating.desc(),
                PlaceGoogleDetail.review_count.desc()
            ).all()
            
        if candidates:
            return candidates[0]
            
        return None
