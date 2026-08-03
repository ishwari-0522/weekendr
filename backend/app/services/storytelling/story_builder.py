# -*- coding: utf-8 -*-

"""
WEEKENDR Story Builder translating itinerary segments into editorial paragraphs.
"""

from .story_templates import TEMPLATE_INTROS, BUDGET_ADAPTATIONS, WEATHER_ADAPTATIONS

def build_story_json(itinerary, params):
    """
    Constructs a warm, editorial description of the planned day.
    """
    template_name = params.get("experienceTemplate", "Coffee & Conversations")
    group_type = params.get("group", "Couple")
    budget = params.get("budget", 2000)
    weather = params.get("weather", "Sunny")
    
    # 1. Determine Title
    title = f"Your Perfect {template_name.split(' ')[0]} Afternoon"
    if group_type == "Couple":
        title = f"A Shared {template_name.split(' ')[0]} Getaway"
    elif group_type == "Solo":
        title = f"Quiet {template_name.split(' ')[0]} Exploration"

    # 2. Compile Intro paragraph
    intro_base = ""
    template_dict = TEMPLATE_INTROS.get(template_name, TEMPLATE_INTROS["Coffee & Conversations"])
    
    if group_type in template_dict:
        intro_base = template_dict[group_type]
    else:
        intro_base = template_dict.get("default", "We planned a custom journey tailored to your selected spots.")

    # Budget level check
    budget_level = "medium"
    if budget < 1500:
        budget_level = "low"
    elif budget >= 5000:
        budget_level = "high"
        
    budget_stmt = BUDGET_ADAPTATIONS.get(budget_level)
    weather_stmt = WEATHER_ADAPTATIONS.get(weather, WEATHER_ADAPTATIONS["Sunny"])

    intro = f"{intro_base} {budget_stmt} {weather_stmt}"

    # 3. Formulate 4 highlights based on actual places in the itinerary
    activities = [s for s in itinerary.get("segments", []) if s.get("type") == "activity"]
    transits = [s for s in itinerary.get("segments", []) if s.get("type") == "transit"]
    
    highlights = []
    
    # Highlight 1: First stop details
    if len(activities) > 0:
        highlights.append(f"Warm welcome at {activities[0].get('name')} to start your day.")
    else:
        highlights.append("Handpicked local spots chosen for their inviting atmosphere.")

    # Highlight 2: Midpoint discovery
    if len(activities) > 1:
        highlights.append(f"A short walk over to {activities[1].get('name')} for the next experience.")
    else:
        highlights.append("Balanced pacing so you never feel rushed between locations.")

    # Highlight 3: Travel simplicity
    total_transit_mins = sum(t.get("duration_mins", 0) for t in transits)
    if total_transit_mins < 15:
        highlights.append("Exceptionally short travel times, giving you more time at each stop.")
    else:
        highlights.append("Convenient routing to keep travel times light and easy.")

    # Highlight 4: Finishing stop detail
    if len(activities) > 2:
        highlights.append(f"Ending the outing beautifully at {activities[-1].get('name')}.")
    else:
        highlights.append("A sweet finishing detail or dessert spot to complete the day.")

    # Ensure we return exactly 4 items
    highlights = highlights[:4]
    while len(highlights) < 4:
        highlights.append("A thoughtful, relaxed flow of activities.")

    # 4. Formulate Closing Sentence
    ending = "Take your time. The best moments are the ones that are never rushed."
    if group_type == "Couple":
        ending = "Take your time. The best conversations are shared in quiet moments."
    elif group_type == "Friends":
        ending = "Enjoy the day. Great company makes every place unforgettable."

    return {
        "title": title,
        "intro": intro,
        "highlights": highlights,
        "ending": ending
    }
