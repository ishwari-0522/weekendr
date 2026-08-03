import math
import re
from app.utils.logging import validation_logger

class PlaceValidator:
    """
    Validates place records, calculates internal Data Quality Scores,
    and performs coordinate and name-similarity duplicate checks.
    """
    def __init__(self, min_quality_score=40, duplicate_distance_meters=50, duplicate_name_threshold=0.6):
        self.min_quality_score = min_quality_score
        self.duplicate_distance_meters = duplicate_distance_meters
        self.duplicate_name_threshold = duplicate_name_threshold

    def calculate_quality_score(self, place_data):
        """
        Calculates a Data Quality Score between 0 and 100 based on field completeness.
        """
        score = 0
        
        # 1. Has opening hours (+20)
        if place_data.get("opening_hours"):
            score += 20
            
        # 2. Has website (+15)
        if place_data.get("website"):
            score += 15
            
        # 3. Has phone number (+15)
        if place_data.get("phone"):
            score += 15
            
        # 4. Has photos (+15)
        if place_data.get("images") and len(place_data["images"]) > 0:
            score += 15
            
        # 5. Has rating & review count (+15)
        if place_data.get("rating") is not None and place_data.get("review_count") is not None:
            score += 15
            
        # 6. Has high volume of reviews (+10)
        if (place_data.get("review_count") or 0) > 20:
            score += 10
            
        # 7. Has price level (+10)
        if place_data.get("price_level") is not None:
            score += 10
            
        return score

    def validate_bounds(self, lat, lng):
        """Validates geographic coordinates boundaries."""
        if lat is None or lng is None:
            return False
        try:
            latitude = float(lat)
            longitude = float(lng)
            return (-90.0 <= latitude <= 90.0) and (-180.0 <= longitude <= 180.0)
        except ValueError:
            return False

    def is_valid_place(self, place_data):
        """
        Performs overall checks on clean place details.
        Returns a tuple of (is_valid, reason, quality_score).
        """
        name = place_data.get("name")
        lat = place_data.get("latitude")
        lng = place_data.get("longitude")
        status = place_data.get("business_status")
        
        # 1. Core checks
        if not name or len(str(name).strip()) < 2:
            return False, "Name is missing or too short", 0
            
        if not self.validate_bounds(lat, lng):
            return False, f"Invalid geographic coordinates ({lat}, {lng})", 0
            
        # 2. Status check
        if status and status != "OPERATIONAL":
            return False, f"Business is non-operational ({status})", 0
            
        # 3. Quality score check
        quality_score = self.calculate_quality_score(place_data)
        if quality_score < self.min_quality_score:
            return False, f"Data Quality Score ({quality_score}) falls below threshold ({self.min_quality_score})", quality_score
            
        return True, "Valid", quality_score

    def get_token_similarity(self, name1, name2):
        """
        Calculates Jaccard token similarity between two names.
        """
        def get_tokens(s):
            return set(re.findall(r'\w+', str(s).lower()))
            
        t1 = get_tokens(name1)
        t2 = get_tokens(name2)
        
        if not t1 or not t2:
            return 0.0
            
        intersection = t1.intersection(t2)
        union = t1.union(t2)
        
        return len(intersection) / len(union)

    def calculate_distance_meters(self, lat1, lng1, lat2, lng2):
        """
        Calculates distance in meters between two lat/lng coordinates
        using flat-earth cosine approximation (accurate enough for short distances).
        """
        try:
            lat1, lng1 = float(lat1), float(lng1)
            lat2, lng2 = float(lat2), float(lng2)
            
            lat_avg = math.radians((lat1 + lat2) / 2.0)
            
            dx = (lng1 - lng2) * math.cos(lat_avg) * 111320.0
            dy = (lat1 - lat2) * 110540.0
            
            return math.sqrt(dx * dx + dy * dy)
        except Exception:
            return float('inf')

    def check_potential_duplicate(self, new_place_data, existing_places):
        """
        Compares a candidate place against a list of existing database places
        using coordinates distance and token name similarity.
        Returns (is_duplicate, duplicate_place_id_or_none).
        """
        new_name = new_place_data.get("name")
        new_lat = new_place_data.get("latitude")
        new_lng = new_place_data.get("longitude")
        
        for exp in existing_places:
            dist = self.calculate_distance_meters(new_lat, new_lng, exp.latitude, exp.longitude)
            
            # If coordinates are very close
            if dist <= self.duplicate_distance_meters:
                similarity = self.get_token_similarity(new_name, exp.name)
                
                if similarity >= self.duplicate_name_threshold:
                    validation_logger.warning(
                        "Potential duplicate detected: '%s' is close to existing '%s' (Dist: %.1fm, Name Sim: %.2f)",
                        new_name, exp.name, dist, similarity
                    )
                    return True, exp.id
                    
        return False, None
