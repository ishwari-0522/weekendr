import os
import json
import re
from app.utils.logging import sync_logger, error_logger

class PlaceCleaner:
    """
    Cleans, standardizes, and normalizes raw data payloads from external sources.
    Loads category mapping from configurations.
    """
    def __init__(self, category_map_path=None):
        if not category_map_path:
            config_dir = os.path.join(os.path.dirname(__file__), 'config')
            category_map_path = os.path.join(config_dir, 'categories.json')
            
        self.category_mapping = {}
        try:
            with open(category_map_path, 'r', encoding='utf-8') as f:
                self.category_mapping = json.load(f)
            sync_logger.info("Category mapping loaded from config. %d types mapped.", len(self.category_mapping))
        except Exception as e:
            error_logger.error("Failed to load category mapping from %s: %s", category_map_path, str(e))
            
    def clean_text(self, text):
        """Trims whitespace and returns None if empty."""
        if not text:
            return None
        cleaned = str(text).strip()
        # Remove multiple consecutive whitespaces
        cleaned = re.sub(r'\s+', ' ', cleaned)
        return cleaned if cleaned else None

    def clean_phone(self, phone):
        """
        Cleans and standardizes phone numbers into international formats.
        E.g. '+91 (123) 456-7890' -> '+911234567890'
        """
        if not phone:
            return None
        # Remove brackets, dashes, spaces, keeping numbers and '+' sign
        cleaned = re.sub(r'[^\d+]', '', str(phone))
        # Add default India country code if format matches 10 digits without +
        if len(cleaned) == 10 and not cleaned.startswith('+'):
            cleaned = "+91" + cleaned
        return cleaned

    def clean_address(self, address):
        """Standardizes address formatting."""
        return self.clean_text(address)

    def map_category(self, google_types):
        """
        Maps a list of Google Places types to a single WEEKENDR category.
        Takes the first matching type from the configuration.
        """
        if not google_types:
            return "Restaurant" # Default fallback
            
        for g_type in google_types:
            mapped = self.category_mapping.get(g_type.lower())
            if mapped:
                return mapped
                
        return "Restaurant" # Standard default fallback if none match

    def parse_opening_hours(self, opening_hours_obj):
        """
        Extracts weekday text arrays from Google Places opening hours object.
        """
        if not opening_hours_obj:
            return None
        
        # We store the weekday text, and period components in JSON format
        return {
            "weekday_text": opening_hours_obj.get("weekday_text", []),
            "periods": opening_hours_obj.get("periods", []),
            "open_now": opening_hours_obj.get("open_now", None)
        }

    def parse_photos(self, photos_list, api_key=None):
        """
        Parses Google photo objects into structured dictionaries.
        Photos require attributions, which we store in the database.
        """
        if not photos_list:
            return []
            
        api_key = api_key or os.environ.get('GOOGLE_MAPS_API_KEY', '')
        parsed_images = []
        
        # Retrieve up to 5 photos per place
        for photo in photos_list[:5]:
            ref = photo.get("photo_reference")
            if not ref:
                continue
                
            # Construct Google place photo URL
            image_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference={ref}&key={api_key}"
            
            # Attributions are required by Google terms
            html_attributions = photo.get("html_attributions", [])
            attribution = " ".join(html_attributions) if html_attributions else None
            
            parsed_images.append({
                "image_url": image_url,
                "attribution": attribution,
                "width": photo.get("width"),
                "height": photo.get("height")
            })
            
        return parsed_images
