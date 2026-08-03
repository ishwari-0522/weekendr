from app.models.place import Place

class CurationEngine:
    """
    Scoring engine deterministic ranking venues based on Google metadata ratings, reviews, and enrichment.
    """
    @staticmethod
    def rank_places(places_list):
        """
        Ranks a list of places deterministically. Returns the ranked list.
        """
        def calculate_place_score(place):
            # 1. Base rating factor (scale 1.0 to 5.0)
            rating = 3.5
            reviews = 0
            is_enriched = 0.0
            
            # Read Google detail metrics
            if place.google_detail:
                if place.google_detail.rating is not None:
                    rating = float(place.google_detail.rating)
                if place.google_detail.review_count is not None:
                    reviews = int(place.google_detail.review_count)
                    
            # Read AI metadata enrichment factor
            if place.ai_metadata and place.ai_metadata.is_enriched:
                is_enriched = 1.0
                
            # Composite scoring formula
            score = (rating * 10.0) + (reviews / 50.0) + (is_enriched * 5.0)
            return score

        # Sort places in descending order of composite score
        return sorted(places_list, key=calculate_place_score, reverse=True)
