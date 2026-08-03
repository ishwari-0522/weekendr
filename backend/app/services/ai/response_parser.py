import json
from app.utils.logging import validation_logger

class ResponseParser:
    """Parses, cleans, and structures raw LLM JSON responses."""
    def __init__(self):
        self.supported_fields = {
            "city", "area", "budget", "group_type", "group_size", "duration_mins",
            "time_of_day", "preferred_activities", "food_preferences",
            "accessibility_requirements", "weather_preferences",
            "transportation_preference", "experience_template", "preferences"
        }

    def clean_json_text(self, text):
        """Trims markdown blocks if the LLM wraps code block selectors."""
        trimmed = text.strip()
        if trimmed.startswith("```json"):
            trimmed = trimmed[7:]
        if trimmed.endswith("```"):
            trimmed = trimmed[:-3]
        return trimmed.strip()

    def parse_response(self, raw_response):
        """
        Parses JSON and filters only supported attributes.
        Returns a tuple of (parsed_dict, is_valid, error_reason).
        """
        cleaned_text = self.clean_json_text(raw_response)
        try:
            parsed = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            validation_logger.error("Failed to decode JSON from LLM: %s", str(e))
            return {}, False, f"Invalid JSON format: {str(e)}"
            
        if not isinstance(parsed, dict):
            return {}, False, "Response is not a JSON object"
            
        # Clean and extract only supported keys
        cleaned_result = {}
        for key in self.supported_fields:
            cleaned_result[key] = parsed.get(key, None)
            
        # Apply normalization helpers
        # Translate duration_hours to duration_mins if returned
        if parsed.get("duration_hours") and not cleaned_result["duration_mins"]:
            try:
                cleaned_result["duration_mins"] = int(float(parsed["duration_hours"]) * 60)
            except Exception:
                pass
                
        # Fill missing preferences list
        if cleaned_result["preferences"] is None:
            cleaned_result["preferences"] = []
            
        # Infer city from area if missing
        if not cleaned_result["city"] and cleaned_result["area"]:
            area_lower = cleaned_result["area"].lower()
            if area_lower in ["bandra", "juhu", "bkc", "powai", "colaba", "andheri", "dadar", "chembur", "malad", "borivali", "worli", "khar", "santacruz", "vile parle", "goregaon", "mulund", "ghatkopar", "kurla", "byculla", "tardeo"]:
                cleaned_result["city"] = "Mumbai"
            elif area_lower in ["baner", "koregaon park", "fc road", "hinjewadi", "aundh", "wakad", "kothrud", "hadapsar", "viman nagar", "kharadi", "swargate", "camp", "pimple saudagar", "magarpatta", "erandwane", "bavdhan", "karve nagar", "sinhagad road"]:
                cleaned_result["city"] = "Pune"
                
        return cleaned_result, True, "Valid"
