class LiveDayValidator:
     """
     Validation utilities for Live Day session starts and stops actions.
     """
     @staticmethod
     def validate_start_payload(data):
         """Validates register start body. Returns (is_valid, error)."""
         memory_id = data.get("memory_id")
         if not memory_id:
             return False, "Memory ID parameter is required."
         try:
             int(memory_id)
         except (ValueError, TypeError):
             return False, "Memory ID must be a valid integer."
         return True, None
