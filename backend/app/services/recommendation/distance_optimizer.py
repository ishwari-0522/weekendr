import math

class DistanceOptimizer:
    """
    Optimizes travel routes between recommended places to ensure a natural geographic flow
    and minimize transit times.
    """
    def calculate_distance_meters(self, lat1, lng1, lat2, lng2):
        """
        Calculates distance in meters between two lat/lng coordinates
        using flat-earth cosine approximation.
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

    def find_optimized_route(self, candidates_per_step):
        """
        Finds a route that minimizes distance between sequential stops.
        candidates_per_step: List of lists of Place objects, e.g. [[Cafe1, Cafe2], [Rest1, Rest2]]
        Returns a list of Place objects representing the optimized sequence.
        """
        if not candidates_per_step:
            return []
            
        route = []
        used_ids = set()
        
        # 1. Start with the highest ranked candidate of the first step
        first_step_candidates = candidates_per_step[0]
        if not first_step_candidates:
            return []
            
        current_place = first_step_candidates[0]
        route.append(current_place)
        used_ids.add(current_place.id)
        
        # 2. Iteratively find the closest place for each subsequent step
        for step_idx in range(1, len(candidates_per_step)):
            candidates = candidates_per_step[step_idx]
            
            closest_place = None
            min_dist = float('inf')
            
            for candidate in candidates:
                if candidate.id in used_ids:
                    continue
                    
                dist = self.calculate_distance_meters(
                    current_place.latitude, current_place.longitude,
                    candidate.latitude, candidate.longitude
                )
                
                # We want to balance rating and distance.
                # If a place is slightly further but much better, we can allow it,
                # but to minimize distance strictly, we look at the closest.
                # Let's select the closest place within the top candidates.
                if dist < min_dist:
                    min_dist = dist
                    closest_place = candidate
                    
            if closest_place:
                route.append(closest_place)
                used_ids.add(closest_place.id)
                current_place = closest_place
            else:
                # Fallback if no unused candidates exist: take the first candidate of this step
                fallback_candidates = [c for c in candidates if c.id not in used_ids]
                if fallback_candidates:
                    fallback_place = fallback_candidates[0]
                    route.append(fallback_place)
                    used_ids.add(fallback_place.id)
                    current_place = fallback_place
                elif candidates:
                    # If absolutely necessary, duplicate (though validator will catch this)
                    route.append(candidates[0])
                    current_place = candidates[0]
                    
        return route
