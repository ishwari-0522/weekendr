# -*- coding: utf-8 -*-

"""
WEEKENDR AI Storytelling Engine orchestrating templates, formats and validations pipelines.
"""

from .story_builder import build_story_json
from .story_formatter import format_story
from .story_validator import validate_story

def generate_story(itinerary, params):
    """
    Primary storytelling entrypoint. Returns structured story payload matching the itinerary details.
    """
    try:
        # 1. Build initial story representation
        raw_story = build_story_json(itinerary, params)
        
        # 2. Format schema keys and values
        formatted_story = format_story(raw_story)
        
        # 3. Clean restricted words and check places references alignment
        valid_story = validate_story(formatted_story, itinerary)
        
        return valid_story
    except Exception as e:
        # Fallback to default safe templates structure to avoid blocking generation
        return {
            "title": "Your Curated Outing",
            "intro": "We designed a balanced outing around your favorite local neighborhood stops to keep your day relaxed and easy.",
            "highlights": [
                "Cozy local atmospheres",
                "Short walks and convenient paths",
                "Curated neighborhood spots",
                "Paced to let you take your time"
            ],
            "ending": "Enjoy your day. The best moments are always shared."
        }
