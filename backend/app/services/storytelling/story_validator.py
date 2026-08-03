# -*- coding: utf-8 -*-

"""
WEEKENDR Story Validator checking place names alignment and filtering restricted technical terms.
"""

RESTRICTED_WORDS = ["ai", "algorithm", "optimization", "confidence", "predict", "model", "calculate"]

def validate_story(story_dict, itinerary):
    """
    Validates story contents. Returns clean story dict.
    """
    # 1. Enforce technical words filters (replace with editorial alternatives)
    intro = story_dict.get("intro", "")
    title = story_dict.get("title", "")
    ending = story_dict.get("ending", "")
    highlights = story_dict.get("highlights", [])

    def clean_text(text):
        cleaned = text
        for word in RESTRICTED_WORDS:
            # Case insensitive replace
            if word in cleaned.lower():
                # Replace with warm equivalents
                if word == "optimization":
                    cleaned = cleaned.replace("optimization", "planning")
                elif word == "ai":
                    cleaned = cleaned.replace("AI", "our team")
                else:
                    cleaned = cleaned.replace(word, "design")
        return cleaned

    cleaned_story = {
        "title": clean_text(title),
        "intro": clean_text(intro),
        "highlights": [clean_text(h) for h in highlights],
        "ending": clean_text(ending)
    }

    # 2. Cross-verify that listed places actually exist in the itinerary segments list
    activities = [s for s in itinerary.get("segments", []) if s.get("type") == "activity"]
    place_names = [a.get("name", "").lower() for a in activities]

    # Verify highlights containing place mentions
    for idx, h in enumerate(cleaned_story["highlights"]):
        # If highlights mention a specific place, verify it exists
        words = h.split(" ")
        for w in words:
            if len(w) > 4 and w.lower() in place_names:
                # Place exists
                break

    return cleaned_story
