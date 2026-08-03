from app.services.experience_composer.experience_validator import ExperienceValidator
from app.utils.logging import validation_logger

class EditorValidator:
    """Audits edited timeline constraints using composer rule validators."""
    def __init__(self):
        self.base_validator = ExperienceValidator()

    def validate_edit(self, timeline, max_budget=None, max_duration=None):
        """
        Runs validation checks on the updated timeline.
        Returns a tuple of (is_valid, reason).
        """
        is_valid, reason = self.base_validator.validate_experience(
            timeline=timeline,
            max_budget=max_budget,
            max_duration_mins=max_duration
        )
        
        if not is_valid:
            return False, reason
            
        # Additional travel distance checks (e.g. warning if total travel is excessive)
        total_dist = timeline.get("total_distance_meters", 0.0)
        if total_dist > 30000.0: # 30km
            validation_logger.warning("Edit validation: Outing travel distance is very high: %.1f km", total_dist / 1000.0)
            
        return True, "Valid"
