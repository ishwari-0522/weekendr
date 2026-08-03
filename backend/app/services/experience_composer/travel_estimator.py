import math

class TravelEstimator:
    """
    Estimates travel distance and times between coordinates.
    Prepares interfaces for future Google Directions API, weather, and traffic checks.
    """
    def __init__(self, traffic_multiplier=1.0):
        self.traffic_multiplier = traffic_multiplier

    def calculate_distance_meters(self, lat1, lng1, lat2, lng2):
        """Calculates geographic distance in meters using flat-earth cosine approximation."""
        try:
            lat1, lng1 = float(lat1), float(lng1)
            lat2, lng2 = float(lat2), float(lng2)
            
            lat_avg = math.radians((lat1 + lat2) / 2.0)
            dx = (lng1 - lng2) * math.cos(lat_avg) * 111320.0
            dy = (lat1 - lat2) * 110540.0
            
            return math.sqrt(dx * dx + dy * dy)
        except Exception:
            return 0.0

    def estimate_transit(self, origin_place, dest_place, preference_mode=None):
        """
        Estimates travel details.
        Returns a dict containing: mode, duration_mins, and distance_meters.
        """
        lat1, lng1 = origin_place.get("latitude"), origin_place.get("longitude")
        lat2, lng2 = dest_place.get("latitude"), dest_place.get("longitude")
        
        distance = self.calculate_distance_meters(lat1, lng1, lat2, lng2)
        
        # Determine mode
        # Under 500m -> Walk
        # Else -> Drive / Ride Share
        if distance < 500.0:
            mode = "Walk"
            speed_mps = 1.38 # 5 km/h
        else:
            mode = preference_mode or "Drive"
            speed_mps = 5.56 # 20 km/h in city traffic
            
        # Calculate transit duration
        duration_seconds = distance / speed_mps
        duration_mins = max(2, math.ceil(duration_seconds / 60.0))
        
        # Apply traffic factor adjustment
        duration_mins = math.ceil(duration_mins * self.traffic_multiplier)
        
        return {
            "mode": mode,
            "distance_meters": round(distance, 1),
            "duration_mins": duration_mins,
            "metadata": {
                "traffic_delay_applied": self.traffic_multiplier > 1.0,
                "google_directions_api": "placeholder_interface_ready"
            }
        }
class GoogleDirectionsServiceWrapper:
    """
    Placeholder service to call Google Directions API later without modifying TravelEstimator logic.
    """
    pass
