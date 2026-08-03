import re
from app.utils.logging import validation_logger

class TagGenerator:
    """
    Deterministically generates search and vibe tags for places based on their details,
    types, and metadata.
    """
    def __init__(self):
        # Keyword triggers for tags
        self.keywords = {
            "Outdoor Seating": [
                r"rooftop", r"garden", r"outdoor", r"patio", r"balcony", 
                r"terrace", r"open air", r"lawn", r"courtyard"
            ],
            "Date Night": [
                r"cozy", r"romantic", r"intimate", r"candlelight", r"date", 
                r"aesthetic", r"fine dining", r"lounge", r"dimly lit"
            ],
            "Pet Friendly": [
                r"pet friendly", r"dog friendly", r"pets allowed", r"pet-friendly",
                r"dog-friendly"
            ],
            "Quiet": [
                r"quiet", r"peaceful", r"calm", r"silent", r"work friendly",
                r"study", r"library", r"relaxing", r"serene"
            ],
            "Live Music": [
                r"live music", r"live band", r"gig", r"acoustic", r"performance",
                r"concert", r"karaoke"
            ],
            "Vegetarian": [
                r"pure veg", r"vegetarian", r"vegan", r"veg only"
            ]
        }

    def check_keywords(self, text, patterns):
        """Returns True if any pattern matches the text."""
        if not text:
            return False
        text_lower = str(text).lower()
        return any(re.search(pat, text_lower) for pat in patterns)

    def is_late_night(self, opening_hours):
        """
        Detects if a place is open past 11:00 PM (2300) or open 24 hours.
        """
        if not opening_hours:
            return False
            
        periods = opening_hours.get("periods", [])
        
        # 1. Check for 24 hours open (represented by open-only or day=0, time=0000 with no close)
        if len(periods) == 1 and periods[0].get("open", {}).get("day") == 0 and periods[0].get("open", {}).get("time") == "0000" and not periods[0].get("close"):
            return True
            
        # 2. Check each period close time
        for period in periods:
            close = period.get("close", {})
            close_time = close.get("time") # Format e.g. "2330", "0130"
            
            if close_time:
                try:
                    hour = int(close_time[:2])
                    # Open past 23:00 (11 PM) or closes in early morning hours (12 AM - 4 AM)
                    if hour >= 23 or hour <= 4:
                        return True
                except ValueError:
                    continue
                    
        # 3. Check weekday text as fallback
        weekday_text = opening_hours.get("weekday_text", [])
        for text in weekday_text:
            text_lower = text.lower()
            if "open 24 hours" in text_lower or "24/7" in text_lower:
                return True
            # Matches strings like "11:00 pm", "12:00 am", "1:00 am", "2:00 am"
            if re.search(r"(11|12|1|2|3|4)(:\d+)?\s*(pm|am)\b", text_lower):
                # Double check PM triggers
                if "pm" in text_lower and not text_lower.startswith("11"):
                    continue
                return True
                
        return False

    def generate_tags(self, place_data, category_name):
        """
        Examines place data and assigns a list of tags.
        """
        tags = []
        name = place_data.get("name", "")
        desc = place_data.get("description", "")
        text_corpus = f"{name} {desc}"
        
        price_level = place_data.get("price_level")
        rating = place_data.get("rating")
        review_count = place_data.get("review_count", 0)
        google_types = place_data.get("types", [])
        
        # 1. Budget tag
        if price_level is not None and price_level <= 1:
            tags.append("Budget")
            
        # 2. Luxury tag
        if price_level is not None and price_level >= 3:
            tags.append("Luxury")
            
        # 3. Late Night tag
        if self.is_late_night(place_data.get("opening_hours")):
            tags.append("Late Night")
            
        # 4. Outdoor Seating tag
        # Google types check or keyword triggers
        if "outdoor_seating" in google_types or self.check_keywords(text_corpus, self.keywords["Outdoor Seating"]):
            tags.append("Outdoor Seating")
            
        # 5. Date Night tag
        if category_name in ["Cafe", "Restaurant"] and rating is not None and rating >= 4.2:
            if self.check_keywords(text_corpus, self.keywords["Date Night"]):
                tags.append("Date Night")
                
        # 6. Student Friendly tag
        if category_name in ["Cafe", "Dessert", "Gaming"] and (price_level is None or price_level <= 1):
            tags.append("Student Friendly")
            
        # 7. Family Friendly tag
        if category_name not in ["Nightlife"] and not self.check_keywords(text_corpus, [r"\bbar\b", r"\bpub\b", r"\bbrewery\b", r"\bclub\b"]):
            tags.append("Family Friendly")
            
        # 8. Instagrammable tag
        if rating is not None and rating >= 4.3 and review_count >= 150:
            tags.append("Instagrammable")
            
        # 9. Quiet tag
        if self.check_keywords(text_corpus, self.keywords["Quiet"]):
            tags.append("Quiet")
            
        # 10. Pet Friendly tag
        if self.check_keywords(text_corpus, self.keywords["Pet Friendly"]):
            tags.append("Pet Friendly")
            
        # 11. Live Music tag
        if self.check_keywords(text_corpus, self.keywords["Live Music"]):
            tags.append("Live Music")
            
        # 12. Vegetarian tag
        if self.check_keywords(text_corpus, self.keywords["Vegetarian"]):
            tags.append("Vegetarian")
            
        validation_logger.debug("Generated tags for '%s': %s", name, tags)
        return tags
