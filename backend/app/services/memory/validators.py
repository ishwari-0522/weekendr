import re
from datetime import datetime

DATE_REGEX = re.compile(r'^\d{4}-\d{2}-\d{2}$')

class MemoryValidator:
    """
    Validation logic checking titles, ratings scale limits, and ISO dates formats.
    """
    @staticmethod
    def validate_memory_payload(data):
        """
        Validates create/update payloads. Returns (is_valid, errors).
        """
        errors = {}
        title = data.get("title", "")
        rating = data.get("rating")
        planned_date = data.get("planned_date")
        
        # Validate title (required only on create, optional on update)
        if "title" in data:
            if not isinstance(title, str) or not title.strip():
                errors["title"] = "Title must be a non-empty string."
            elif len(title) > 150:
                errors["title"] = "Title cannot exceed 150 characters."
                
        # Validate rating
        if rating is not None:
            try:
                rating_int = int(rating)
                if rating_int < 1 or rating_int > 5:
                    errors["rating"] = "Rating must be an integer between 1 and 5."
            except (ValueError, TypeError):
                errors["rating"] = "Rating must be an integer between 1 and 5."
                
        # Validate date format (YYYY-MM-DD)
        if planned_date:
            if not isinstance(planned_date, str) or not DATE_REGEX.match(planned_date):
                errors["planned_date"] = "Planned date must be in YYYY-MM-DD format."
            else:
                try:
                    datetime.strptime(planned_date, "%Y-%m-%d")
                except ValueError:
                    errors["planned_date"] = "Invalid calendar date."
                    
        return len(errors) == 0, errors
