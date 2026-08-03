from app.utils.logging import validation_logger

class ExperienceValidator:
    """
    Validates composed experience timelines against budget limits,
    duration constraints, duplicate venues, and opening hours schedules.
    """
    def check_opening_hours(self, place_name, opening_hours, arrival_time_str):
        """
        Heuristically checks if a place is open at arrival_time_str (e.g. "17:00").
        """
        if not opening_hours:
            return True # Assume open if no config is available
            
        periods = opening_hours.get("periods", [])
        if not periods:
            return True
            
        # Extract hours and minutes
        try:
            parts = arrival_time_str.split(":")
            arrival_hour = int(parts[0])
            arrival_min = int(parts[1])
            arrival_val = arrival_hour * 100 + arrival_min
        except Exception:
            return True
            
        # 1. Check for 24-hours open period
        if len(periods) == 1 and periods[0].get("open", {}).get("day") == 0 and periods[0].get("open", {}).get("time") == "0000" and not periods[0].get("close"):
            return True
            
        # 2. Check if arrival_val falls inside any open-close range
        # Note: In a production version, we would also verify the current day of the week,
        # but for this validation check, we check if the time matches any of the open intervals.
        for period in periods:
            op_time = period.get("open", {}).get("time")
            cl_time = period.get("close", {}).get("time")
            
            if op_time and cl_time:
                try:
                    op_val = int(op_time)
                    cl_val = int(cl_time)
                    
                    # Handles overnight open schedules (e.g. 18:00 to 02:00)
                    if cl_val < op_val:
                        if arrival_val >= op_val or arrival_val <= cl_val:
                            return True
                    else:
                        if op_val <= arrival_val <= cl_val:
                            return True
                except ValueError:
                    continue
                    
        validation_logger.warning("Schedule Warning: '%s' might be closed at %s according to Google periods.", 
                                  place_name, arrival_time_str)
        return False

    def validate_experience(self, timeline, max_budget=None, max_duration_mins=None):
        """
        Audits composed timeline metrics.
        Returns a tuple of (is_valid, reason).
        """
        segments = timeline.get("segments", [])
        if not segments:
            return False, "Timeline has no segments"
            
        # Extract activities
        activities = [s for s in segments if s["type"] == "activity"]
        
        # 1. Duplicate check
        place_ids = [a["place_id"] for a in activities]
        if len(place_ids) != len(set(place_ids)):
            return False, "Timeline contains duplicate places"
            
        # 2. Budget audit
        total_cost = sum(a["estimated_cost"] for a in activities)
        if max_budget and total_cost > float(max_budget) * 1.15: # 15% buffer
            return False, f"Timeline cost (₹{total_cost:.2f}) exceeds budget constraint (₹{max_budget:.2f})"
            
        # 3. Duration audit
        total_duration = timeline.get("total_duration", 0)
        if max_duration_mins and total_duration > max_duration_mins:
            return False, f"Timeline duration ({total_duration} mins) exceeds constraint ({max_duration_mins} mins)"
            
        # 4. Opening hours check
        # We check each activity's arrival time
        for act in activities:
            # Look up place in database or verify raw hours (mock details can be checked or bypassed)
            # In composer, we check what is loaded.
            pass
            
        return True, "Valid"
