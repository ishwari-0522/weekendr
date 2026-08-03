import os
import json
from app.models import City, Area, Category
from app.services.recommendation.template_loader import TemplateLoader

class PlannerValidator:
    """
    Validates user input arguments for generation and editing requests.
    Checks budget, duration, city, area, and experience template constraints.
    """
    def __init__(self):
        self.template_loader = TemplateLoader()

    def validate_generate_request(self, data):
        """
        Validates `/api/planner/generate` request parameters.
        Returns a tuple of (is_valid, errors_list, cleaned_data).
        """
        errors = []
        cleaned = {}
        
        # 1. City (Mandatory)
        city = data.get("city")
        if not city:
            errors.append({"field": "city", "message": "City parameter is required"})
        else:
            cleaned["city"] = str(city).strip()
            
        # 2. Area (Optional)
        area = data.get("area")
        if area:
            cleaned["area"] = str(area).strip()
            
        # 3. Experience Template (Mandatory)
        template_name = data.get("experience_template")
        if not template_name:
            errors.append({"field": "experience_template", "message": "Experience template is required"})
        else:
            # Check if template is registered in templates config
            template_config = self.template_loader.get_template(template_name)
            if not template_config:
                errors.append({"field": "experience_template", "message": f"Template '{template_name}' is invalid"})
            else:
                cleaned["experience_template"] = template_name
                
        # 4. Budget (Optional, must be positive numeric)
        budget = data.get("budget")
        if budget is not None:
            try:
                val = float(budget)
                if val <= 0:
                    errors.append({"field": "budget", "message": "Budget must be a positive number"})
                else:
                    cleaned["budget"] = val
            except (ValueError, TypeError):
                errors.append({"field": "budget", "message": "Budget must be a valid numeric value"})
                
        # 5. Duration (Optional, must be positive integer)
        duration = data.get("duration")
        if duration is not None:
            try:
                val = int(duration)
                if val <= 0:
                    errors.append({"field": "duration", "message": "Duration must be a positive integer in minutes"})
                else:
                    cleaned["duration"] = val
            except (ValueError, TypeError):
                errors.append({"field": "duration", "message": "Duration must be a valid integer value"})
                
        # 6. Group and Preferences
        cleaned["group"] = data.get("group")
        cleaned["preferences"] = data.get("preferences", [])
        if not isinstance(cleaned["preferences"], list):
            errors.append({"field": "preferences", "message": "Preferences must be an array of strings"})
            
        return len(errors) == 0, errors, cleaned

    def validate_edit_request(self, data):
        """
        Validates `/api/planner/edit` request parameters.
        """
        errors = []
        cleaned = {}
        
        # 1. Current Places (Mandatory array of dicts)
        current_places = data.get("current_places")
        if not current_places or not isinstance(current_places, list):
            errors.append({"field": "current_places", "message": "current_places list is required"})
        else:
            cleaned["current_places"] = current_places
            
        # 2. Action (Mandatory dict)
        action = data.get("action")
        if not action or not isinstance(action, dict):
            errors.append({"field": "action", "message": "action dictionary is required"})
        else:
            action_type = action.get("type")
            if action_type not in ["replace", "remove", "add", "change_budget", "change_duration"]:
                errors.append({"field": "action.type", "message": f"Action type '{action_type}' is invalid"})
            else:
                cleaned["action"] = action
                
        # 3. Budget and Duration (Optional check)
        budget = data.get("budget")
        if budget is not None:
            try:
                cleaned["budget"] = float(budget)
            except ValueError:
                errors.append({"field": "budget", "message": "Budget must be numeric"})
                
        duration = data.get("duration")
        if duration is not None:
            try:
                cleaned["duration"] = int(duration)
            except ValueError:
                errors.append({"field": "duration", "message": "Duration must be an integer"})
                
        cleaned["template_name"] = data.get("template_name", "Coffee & Conversations")
        
        return len(errors) == 0, errors, cleaned
