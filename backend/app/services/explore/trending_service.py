from app.models.place import Place
from app.services.explore.curation_engine import CurationEngine

class TrendingService:
    """
    Service filtering trending venues and highly-rated hidden gems.
    """
    @staticmethod
    def get_trending_places(limit=10):
        """Returns trending places ranked by curation engine."""
        places = Place.query.filter_by(is_active=True).all()
        ranked = CurationEngine.rank_places(places)
        return ranked[:limit]

    @staticmethod
    def get_hidden_gems_places(limit=10):
        """
        Returns places with high ratings (>= 4.2) but lower review counts (<= 150)
        ordered deterministically.
        """
        places = Place.query.filter_by(is_active=True).all()
        gems = []
        for p in places:
            rating = 3.5
            reviews = 0
            if p.google_detail:
                if p.google_detail.rating is not None:
                    rating = float(p.google_detail.rating)
                if p.google_detail.review_count is not None:
                    reviews = int(p.google_detail.review_count)
            
            # Hidden gems filter boundaries
            if rating >= 4.2 and reviews <= 150:
                gems.append(p)
                
        ranked = CurationEngine.rank_places(gems)
        return ranked[:limit]
