from app.utils.logging import validation_logger

class ConfidenceChecker:
    """Audits extracted fields, strips hallucinations, and handles fallback defaults."""
    def audit_preferences(self, parsed_data):
        """
        Validates the parsed preferences dict.
        Normalizes types and inserts baseline fallbacks.
        """
        audited = parsed_data.copy()
        
        # 1. City default fallback
        if not audited.get("city"):
            validation_logger.info("Confidence: City was not inferred. Falling back to default: 'Pune'.")
            audited["city"] = "Pune"
            
        # 2. Check and clean budget
        budget = audited.get("budget")
        if budget is not None:
            try:
                budget = float(budget)
                if budget <= 0:
                    audited["budget"] = None
                else:
                    audited["budget"] = budget
            except (ValueError, TypeError):
                audited["budget"] = None
                
        # 3. Check and clean duration
        duration = audited.get("duration_mins")
        if duration is not None:
            try:
                duration = int(duration)
                if duration <= 0:
                    audited["duration_mins"] = None
                else:
                    audited["duration_mins"] = duration
            except (ValueError, TypeError):
                audited["duration_mins"] = None
                
        # 4. Check lists format
        list_fields = ["preferred_activities", "food_preferences", "accessibility_requirements", "weather_preferences", "preferences"]
        for field in list_fields:
            val = audited.get(field)
            if val is None or not isinstance(val, list):
                audited[field] = []
            else:
                # Remove null or empty entries
                audited[field] = [str(x).strip() for x in val if x]
                
        # 5. Template check: must map to registered templates or be None
        valid_templates = {
            "Coffee & Conversations", "Date Night", "Game On", 
            "Food Trail", "Nature Escape", "Creative Escape", "Retail Therapy"
        }
        template = audited.get("experience_template")
        if template and template not in valid_templates:
            validation_logger.info("Confidence: Invalid template '%s' removed.", template)
            audited["experience_template"] = None
            
        return audited
