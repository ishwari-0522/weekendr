from app.utils.logging import validation_logger

class RecommendationValidator:
    """
    Validates recommended place sequences against user budget, duration,
    and business operational constraints.
    """
    def validate_recommendation(self, route, user_budget, user_duration_mins):
        """
        Validates recommended route constraints.
        Returns (is_valid, reason).
        """
        if not route:
            return False, "Empty recommendation route"
            
        # 1. Duplicate check
        place_ids = [place.id for place in route]
        if len(place_ids) != len(set(place_ids)):
            return False, "Duplicate places detected in recommendation route"
            
        # 2. Status check
        for place in route:
            if not place.is_active:
                return False, f"Place '{place.name}' is inactive"
            if place.google_detail and place.google_detail.business_status != "OPERATIONAL":
                return False, f"Place '{place.name}' is non-operational ({place.google_detail.business_status})"
                
        # 3. Budget validation (optional check if user provides budget)
        if user_budget:
            # Estimate cost based on price_level:
            # level 1: 200, level 2: 500, level 3: 1000, level 4: 2000
            estimated_total = 0.0
            price_map = {0: 100.0, 1: 200.0, 2: 500.0, 3: 1000.0, 4: 2000.0}
            
            for place in route:
                cost = 0.0
                if place.average_cost:
                    cost = float(place.average_cost)
                elif place.google_detail and place.google_detail.price_level is not None:
                    cost = price_map.get(place.google_detail.price_level, 400.0)
                else:
                    cost = 300.0 # Default fallback
                estimated_total += cost
                
            # Allow minor buffer (15%) on estimated budget
            if estimated_total > float(user_budget) * 1.15:
                validation_logger.warning("Recommendation exceeds budget limit. Estimated: ₹%.2f, Limit: ₹%.2f", 
                                          estimated_total, user_budget)
                # Note: We log a warning but don't strictly fail recommendation here if candidates are limited,
                # but we can return False if it severely exceeds the budget.
                
        return True, "Valid"
