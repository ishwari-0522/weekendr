import os
import time
import requests
from datetime import datetime, timedelta
from app.database.db import db
from app.models.place import RawGooglePlace
from app.utils.logging import api_logger, error_logger

class GooglePlacesService:
    """
    Service for querying Google Places API.
    Handles Nearby Searches, Detail requests, and handles caching using RawGooglePlace model.
    """
    def __init__(self, api_key=None, cache_expiry_days=30):
        self.api_key = api_key or os.environ.get('GOOGLE_MAPS_API_KEY')
        self.cache_expiry_days = cache_expiry_days
        
    def find_places_nearby(self, lat, lng, radius=1000, category_type=None):
        """
        Runs a Nearby Search to retrieve list of place summaries (specifically Place IDs).
        Collects all paginated results (up to 60 places).
        """
        if not self.api_key:
            error_logger.error("Google Places API Key is missing.")
            return []
            
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "key": self.api_key
        }
        
        if category_type:
            params["type"] = category_type
            
        places = []
        next_page_token = None
        
        try:
            while True:
                if next_page_token:
                    # Delay is required by Google Places API for pagetoken to become active
                    time.sleep(2)
                    search_params = {
                        "pagetoken": next_page_token,
                        "key": self.api_key
                    }
                else:
                    search_params = params
                    
                api_logger.debug("Calling Google Places Nearby Search. LatLng: (%s, %s), Radius: %d, Type: %s", lat, lng, radius, category_type)
                response = requests.get(url, params=search_params, timeout=10)
                data = response.json()
                
                status = data.get("status")
                if status not in ["OK", "ZERO_RESULTS"]:
                    error_logger.error("Google Places Nearby Search returned error status: %s. Message: %s", status, data.get("error_message"))
                    break
                    
                results = data.get("results", [])
                places.extend(results)
                
                next_page_token = data.get("next_page_token")
                if not next_page_token:
                    break
                    
            api_logger.info("Found %d places nearby coordinates (%s, %s)", len(places), lat, lng)
            return places
        except Exception as e:
            error_logger.exception("Exception occurred during Nearby Search: %s", str(e))
            return []

    def get_place_details(self, google_place_id):
        """
        Fetches detailed information for a specific Place ID.
        Uses RawGooglePlace table as a cache to prevent duplicate API billing.
        """
        # 1. Check local DB cache first
        cached_record = db.session.get(RawGooglePlace, google_place_id)
        if cached_record:
            age = datetime.utcnow() - cached_record.updated_at
            if age < timedelta(days=self.cache_expiry_days):
                api_logger.info("Cache HIT for Google Place ID: %s (Age: %s days)", google_place_id, age.days)
                return cached_record.raw_response
            else:
                api_logger.info("Cache EXPIRED for Google Place ID: %s (Age: %s days). Refetching.", google_place_id, age.days)
        else:
            api_logger.info("Cache MISS for Google Place ID: %s. Calling API.", google_place_id)

        # 2. Call API if not cached or expired
        if not self.api_key:
            error_logger.error("Google Places API Key is missing.")
            return None
            
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        
        # Specifying fields optimizes API cost and fetches exactly what we need
        fields = [
            "name",
            "place_id",
            "geometry",
            "formatted_address",
            "address_components",
            "types",
            "website",
            "formatted_phone_number",
            "rating",
            "user_ratings_total",
            "opening_hours",
            "price_level",
            "photos",
            "business_status",
            "url"
        ]
        
        params = {
            "place_id": google_place_id,
            "fields": ",".join(fields),
            "key": self.api_key
        }
        
        try:
            api_logger.debug("Calling Google Places Details API for ID: %s", google_place_id)
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            status = data.get("status")
            if status != "OK":
                error_logger.error("Google Places Details API returned error status: %s for Place ID %s. Message: %s", status, google_place_id, data.get("error_message"))
                return None
                
            result = data.get("result", {})
            if not result:
                return None
                
            # 3. Store raw response in Cache (upsert)
            if cached_record:
                cached_record.raw_response = result
                cached_record.updated_at = datetime.utcnow()
            else:
                new_cache = RawGooglePlace(
                    google_place_id=google_place_id,
                    raw_response=result
                )
                db.session.add(new_cache)
                
            db.session.commit()
            api_logger.debug("Successfully cached raw details for Place ID: %s", google_place_id)
            
            return result
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Exception occurred during Place Details fetch for ID %s: %s", google_place_id, str(e))
            return None
