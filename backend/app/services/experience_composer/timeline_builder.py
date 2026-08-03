import math
from app.utils.logging import sync_logger

class TimelineBuilder:
    """
    Assembles activity and travel segments into a unified chronological sequence.
    Handles start/end times and constraints duration mapping.
    """
    def __init__(self, segment_builder, travel_estimator, duration_allocator):
        self.segment_builder = segment_builder
        self.travel_estimator = travel_estimator
        self.duration_allocator = duration_allocator

    def _time_str_to_minutes(self, time_str):
        """Converts 'HH:MM' string to minutes from midnight."""
        try:
            parts = time_str.split(':')
            return int(parts[0]) * 60 + int(parts[1])
        except Exception:
            return 1020 # Default to 17:00 (5 PM)

    def _minutes_to_time_str(self, minutes):
        """Converts minutes from midnight to 'HH:MM' string."""
        hours = (minutes // 60) % 24
        mins = minutes % 60
        return f"{hours:02d}:{mins:02d}"

    def build_timeline(self, places_list, start_time_str="17:00", user_duration_mins=None):
        """
        Builds the complete activity-transit timeline.
        Scales activity durations down if they exceed the user_duration_mins limit.
        """
        if not places_list:
            return {
                "start_time": start_time_str,
                "end_time": start_time_str,
                "segments": [],
                "total_duration": 0,
                "total_distance_meters": 0.0
            }

        start_mins = self._time_str_to_minutes(start_time_str)
        
        # 1. First Pass: Compute standard durations and travel times
        durations = []
        travel_estimates = [] # Index i contains travel from place i-1 to i
        
        for idx, place in enumerate(places_list):
            # Resolve visit duration from config
            dur = self.duration_allocator.get_duration(place.get("category"))
            durations.append(dur)
            
            # Travel estimate
            if idx > 0:
                transit = self.travel_estimator.estimate_transit(places_list[idx-1], place)
                travel_estimates.append(transit)
            else:
                travel_estimates.append({"mode": None, "distance_meters": 0.0, "duration_mins": 0})
                
        total_transit_mins = sum(t["duration_mins"] for t in travel_estimates)
        total_activity_mins = sum(durations)
        total_needed_mins = total_transit_mins + total_activity_mins
        
        # 2. Scale activities down if total exceeds user duration limit
        # Do not scale travel times since travel is fixed
        if user_duration_mins and total_needed_mins > user_duration_mins:
            available_activity_mins = user_duration_mins - total_transit_mins
            
            if available_activity_mins < 15 * len(places_list):
                # Critical fallback: if travel is too long, give each activity at least 15 minutes
                available_activity_mins = 15 * len(places_list)
                
            scale_factor = float(available_activity_mins) / float(total_activity_mins)
            
            # Scale each activity and round
            for i in range(len(durations)):
                durations[i] = max(15, math.floor(durations[i] * scale_factor))
                
            sync_logger.info("Scaled activity durations down. Factor: %.2f. New total activity mins: %d", 
                             scale_factor, sum(durations))

        # 3. Second Pass: Build segments with correct timestamps
        segments = []
        current_mins = start_mins
        total_distance = 0.0
        
        for idx, place in enumerate(places_list):
            # Insert travel segment
            if idx > 0:
                transit = travel_estimates[idx]
                transit_dur = transit["duration_mins"]
                distance = transit["distance_meters"]
                mode = transit["mode"]
                
                total_distance += distance
                
                arr_time_str = self._minutes_to_time_str(current_mins)
                dep_time_str = self._minutes_to_time_str(current_mins + transit_dur)
                
                travel_segment = self.segment_builder.build_travel_segment(
                    origin_name=places_list[idx-1]["name"],
                    dest_name=place["name"],
                    start_time=arr_time_str,
                    end_time=dep_time_str,
                    duration_mins=transit_dur,
                    distance_meters=distance,
                    mode=mode
                )
                segments.append(travel_segment)
                current_mins += transit_dur
                
            # Insert activity segment
            act_dur = durations[idx]
            arr_time_str = self._minutes_to_time_str(current_mins)
            dep_time_str = self._minutes_to_time_str(current_mins + act_dur)
            
            activity_segment = self.segment_builder.build_activity_segment(
                place_data=place,
                arrival_time=arr_time_str,
                departure_time=dep_time_str,
                duration_mins=act_dur,
                estimated_cost=place.get("estimated_cost", 300.0)
            )
            segments.append(activity_segment)
            current_mins += act_dur
            
        total_duration = current_mins - start_mins
        
        return {
            "start_time": start_time_str,
            "end_time": self._minutes_to_time_str(current_mins),
            "segments": segments,
            "total_duration": total_duration,
            "total_distance_meters": round(total_distance, 1)
        }
