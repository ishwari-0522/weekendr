# -*- coding: utf-8 -*-

"""
WEEKENDR Story Formatter ensuring strict schema keys, stripping whitespace and cleaning types.
"""

def format_story(story_dict):
    """
    Validates, reformats, and sanitizes story dictionary components.
    """
    formatted = {
        "title": str(story_dict.get("title", "")).strip(),
        "intro": str(story_dict.get("intro", "")).strip(),
        "highlights": [str(h).strip() for h in story_dict.get("highlights", [])],
        "ending": str(story_dict.get("ending", "")).strip()
    }

    # Ensure highlights count is exactly 4
    while len(formatted["highlights"]) < 4:
        formatted["highlights"].append("Relaxed pacing between neighborhood spots.")
    formatted["highlights"] = formatted["highlights"][:4]

    return formatted
