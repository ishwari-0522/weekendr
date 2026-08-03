import os
import json
from app.utils.logging import sync_logger, error_logger

class TemplateLoader:
    """Loads experience templates and profiles from recommendation_templates.json config."""
    def __init__(self, template_path=None):
        if not template_path:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
            template_path = os.path.join(base_dir, 'config', 'recommendation_templates.json')
            
        self.templates = {}
        try:
            if os.path.exists(template_path):
                with open(template_path, 'r', encoding='utf-8') as f:
                    self.templates = json.load(f).get("templates", {})
                sync_logger.info("Recommendation templates loaded successfully. Count: %d", len(self.templates))
            else:
                error_logger.error("Recommendation templates config not found at %s", template_path)
        except Exception as e:
            error_logger.error("Failed loading recommendation templates: %s", str(e))

    def get_template(self, template_name):
        """Returns categories, budget weights, and default durations for a template name."""
        return self.templates.get(template_name)
