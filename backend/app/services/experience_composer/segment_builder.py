class SegmentBuilder:
    """Constructs structured timeline segment JSON blocks for activities and travel."""
    def build_activity_segment(self, place_data, arrival_time, departure_time, duration_mins, estimated_cost):
        """Constructs an activity timeline segment."""
        return {
            "type": "activity",
            "place_id": place_data.get("place_id"),
            "name": place_data.get("name"),
            "category": place_data.get("category"),
            "area": place_data.get("area"),
            "latitude": place_data.get("latitude"),
            "longitude": place_data.get("longitude"),
            "arrival_time": arrival_time,
            "departure_time": departure_time,
            "duration_mins": duration_mins,
            "estimated_cost": float(estimated_cost),
            "image_url": place_data.get("image_url")
        }

    def build_travel_segment(self, origin_name, dest_name, start_time, end_time, duration_mins, distance_meters, mode):
        """Constructs a travel transit segment."""
        return {
            "type": "travel",
            "mode": mode,
            "origin": origin_name,
            "destination": dest_name,
            "start_time": start_time,
            "end_time": end_time,
            "duration_mins": duration_mins,
            "distance_meters": float(distance_meters)
        }
