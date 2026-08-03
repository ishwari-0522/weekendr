import os
import json
from app.utils.logging import sync_logger, error_logger

class DurationAllocator:
    """Loads default visit durations for categories from composer_durations.json."""
    def __init__(self, duration_path=None):
        if not duration_path:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
            duration_path = os.path.join(base_dir, 'config', 'composer_durations.json')
            
        self.durations = {}
        try:
            if os.path.exists(duration_path):
                with open(duration_path, 'r', encoding='utf-8') as f:
                    self.durations = json.load(f).get("durations", {})
                sync_logger.info("Category durations config loaded. Count: %d", len(self.durations))
            else:
                error_logger.error("Category durations config not found at %s", duration_path)
        except Exception as e:
            error_logger.error("Failed loading category durations config: %s", str(e))

    def get_duration(self, category_name):
        """Returns default duration in minutes for a WEEKENDR category."""
        return self.durations.get(category_name, 60) # Fallback to 60 mins
