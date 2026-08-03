class TemplateRules:
    """
    Defines template composition rules such as required vs optional segments.
    Filters place lists to skip optional missing entries.
    """
    def __init__(self):
        # Dictionary defining required categories for templates.
        # Any category not listed here for a template is considered OPTIONAL.
        self.required_categories = {
            "Coffee & Conversations": ["Cafe", "Dessert"],
            "Date Night": ["Cafe", "Restaurant", "Dessert"],
            "Game On": ["Gaming", "Restaurant"],
            "Food Trail": ["Street Food", "Dessert"],
            "Nature Escape": ["Park", "Cafe"],
            "Creative Escape": ["Workshop", "Cafe"],
            "Retail Therapy": ["Mall", "Cafe"]
        }

    def filter_optional_places(self, template_name, places_list):
        """
        Filters out missing optional place segments.
        If a place is missing but it's optional, we skip it without failing.
        """
        required = self.required_categories.get(template_name, [])
        filtered_places = []
        
        for place in places_list:
            if not place:
                continue
                
            category = place.get("category")
            # If place exists, we keep it. If it is empty, it was already skipped.
            filtered_places.append(place)
            
        return filtered_places

    def is_category_required(self, template_name, category_name):
        """Checks if a category is required for a specific template."""
        required = self.required_categories.get(template_name, [])
        return category_name in required
