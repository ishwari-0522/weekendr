import os
import requests
from app.utils.logging import api_logger, error_logger

class GeocodingService:
    """
    Service for querying Google Geocoding API.
    Resolves coordinates to areas/cities and vice versa.
    """
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get('GOOGLE_MAPS_API_KEY')
        self.base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        
    def get_city_coordinates(self, city_name):
        """
        Geocodes a city name to its central latitude and longitude.
        """
        if not self.api_key:
            error_logger.error("Google Maps API Key is missing.")
            return None
            
        params = {
            "address": city_name,
            "key": self.api_key
        }
        
        try:
            api_logger.debug("Calling Geocoding API for city: %s", city_name)
            response = requests.get(self.base_url, params=params, timeout=10)
            response_data = response.json()
            
            if response_data.get("status") == "OK" and response_data.get("results"):
                location = response_data["results"][0]["geometry"]["location"]
                api_logger.info("Successfully geocoded city %s to (%s, %s)", city_name, location["lat"], location["lng"])
                return location["lat"], location["lng"]
            else:
                error_logger.warning("Geocoding failed for %s. Status: %s", city_name, response_data.get("status"))
                return None
        except Exception as e:
            error_logger.exception("Exception occurred during geocoding city %s: %s", city_name, str(e))
            return None

    def get_place_area_and_city(self, lat, lng):
        """
        Reverse geocodes coordinates to determine the Area name and City name.
        Uses neighborhood, sublocality, or locality fields from Google response.
        """
        if not self.api_key:
            error_logger.error("Google Maps API Key is missing.")
            return None, None
            
        params = {
            "latlng": f"{lat},{lng}",
            "key": self.api_key
        }
        
        try:
            api_logger.debug("Calling Reverse Geocoding API for lat/lng: (%s, %s)", lat, lng)
            response = requests.get(self.base_url, params=params, timeout=10)
            response_data = response.json()
            
            if response_data.get("status") != "OK" or not response_data.get("results"):
                error_logger.warning("Reverse Geocoding failed for (%s, %s). Status: %s", lat, lng, response_data.get("status"))
                return None, None
            
            # Walk through address components to find city and area
            area = None
            city = None
            
            # Check results
            for result in response_data["results"]:
                components = result.get("address_components", [])
                
                # Check for neighborhood, sublocality, locality
                for comp in components:
                    types = comp.get("types", [])
                    
                    # Area detection order: neighborhood -> sublocality_level_1 -> sublocality
                    if not area:
                        if "neighborhood" in types:
                            area = comp["long_name"]
                        elif "sublocality_level_1" in types:
                            area = comp["long_name"]
                        elif "sublocality" in types:
                            area = comp["long_name"]
                            
                    # City detection order: locality -> administrative_area_level_2
                    if not city:
                        if "locality" in types:
                            city = comp["long_name"]
                        elif "administrative_area_level_2" in types:
                            city = comp["long_name"]
                            
                # Break early if both resolved
                if area and city:
                    break
                    
            # Fallback if no specific neighborhood/sublocality is found
            if not area and response_data["results"]:
                # Try to use sublocality_level_2 or similar if possible
                for comp in response_data["results"][0].get("address_components", []):
                    types = comp.get("types", [])
                    if "sublocality_level_2" in types or "political" in types:
                        area = comp["long_name"]
                        break
                # Default fallback
                if not area:
                    area = "Unknown Area"
                    
            api_logger.info("Reverse Geocode (%s, %s) -> Area: %s, City: %s", lat, lng, area, city)
            return area, city
        except Exception as e:
            error_logger.exception("Exception occurred during reverse geocoding (%s, %s): %s", lat, lng, str(e))
            return None, None
