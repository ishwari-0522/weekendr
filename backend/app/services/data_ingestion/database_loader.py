from datetime import datetime
from app.database.db import db
from app.models import (
    Place, PlaceGoogleDetail, PlaceAiMetadata, PlaceImage, 
    City, Area, Category, Tag
)
from app.utils.logging import sync_logger, error_logger, validation_logger

class DatabaseLoader:
    """
    Handles database inserts and upserts for Cities, Areas, Categories, Tags, and Places.
    Correctly splits Google detail metadata, WEEKENDR core metadata, and AI placeholders.
    """
    def __init__(self, validator=None):
        self.validator = validator

    def get_or_create_city(self, name, state, country):
        """Retrieves an existing city or creates a new one."""
        try:
            city = City.query.filter_by(name=name).first()
            if not city:
                city = City(name=name, state=state, country=country)
                db.session.add(city)
                db.session.commit()
                sync_logger.info("Database: Created new City: %s", name)
            return city
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to get/create City '%s': %s", name, str(e))
            return None

    def get_or_create_area(self, city_id, area_name, lat=None, lng=None):
        """Retrieves an existing area within a city or creates a new one."""
        try:
            area = Area.query.filter_by(city_id=city_id, name=area_name).first()
            if not area:
                area = Area(
                    city_id=city_id,
                    name=area_name,
                    latitude=lat,
                    longitude=lng,
                    description=f"Area {area_name}"
                )
                db.session.add(area)
                db.session.commit()
                sync_logger.info("Database: Created new Area: %s for City ID %d", area_name, city_id)
            return area
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to get/create Area '%s': %s", area_name, str(e))
            return None

    def get_or_create_category(self, category_name):
        """Retrieves or creates a WEEKENDR category."""
        try:
            cat = Category.query.filter_by(name=category_name).first()
            if not cat:
                cat = Category(name=category_name, icon="default-icon")
                db.session.add(cat)
                db.session.commit()
                sync_logger.info("Database: Created new Category: %s", category_name)
            return cat
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to get/create Category '%s': %s", category_name, str(e))
            return None

    def get_or_create_tags(self, tag_names):
        """Retrieves or creates a list of Tags."""
        tag_objects = []
        try:
            for name in tag_names:
                tag = Tag.query.filter_by(name=name).first()
                if not tag:
                    tag = Tag(name=name)
                    db.session.add(tag)
                    db.session.commit()
                    sync_logger.info("Database: Created new Tag: %s", name)
                tag_objects.append(tag)
            return tag_objects
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to get/create Tags: %s", str(e))
            return []

    def load_place(self, place_data, area, category, tag_objects, image_data):
        """
        Loads a place into the database. Performs:
        1. Google Place ID duplicate check (Updates if exists).
        2. Name/Location similarity duplicate check (Skips if matches existing).
        3. Split Table insertion (Place, PlaceGoogleDetail, PlaceAiMetadata, PlaceImage).
        Returns (operation_type, place_id) where operation_type is 'insert', 'update', or 'skip'.
        """
        google_place_id = place_data.get("google_place_id")
        
        try:
            # 1. Look up existing Google details record
            google_detail = PlaceGoogleDetail.query.filter_by(google_place_id=google_place_id).first()
            
            if google_detail:
                # UPDATE PATH
                place = google_detail.place
                
                # Update Core metadata
                place.name = place_data["name"]
                place.latitude = place_data["latitude"]
                place.longitude = place_data["longitude"]
                place.updated_at = datetime.utcnow()
                
                # Update Google details
                google_detail.google_maps_url = place_data.get("google_maps_url")
                google_detail.website = place_data.get("website")
                google_detail.phone = place_data.get("phone")
                google_detail.price_level = place_data.get("price_level")
                google_detail.rating = place_data.get("rating")
                google_detail.review_count = place_data.get("review_count", 0)
                google_detail.opening_hours = place_data.get("opening_hours")
                google_detail.popular_menu = place_data.get("popular_menu")
                google_detail.business_status = place_data.get("business_status")
                google_detail.updated_at = datetime.utcnow()
                
                # Sync Tags
                place.tags = tag_objects
                
                # Sync Images: Clear old images and load new ones
                PlaceImage.query.filter_by(place_id=place.id).delete()
                for img in image_data:
                    new_img = PlaceImage(
                        place_id=place.id,
                        image_url=img["image_url"],
                        attribution=img.get("attribution"),
                        width=img.get("width"),
                        height=img.get("height")
                    )
                    db.session.add(new_img)
                    
                db.session.commit()
                sync_logger.info("Database: UPDATED place: '%s' (ID: %d)", place.name, place.id)
                return "update", place.id
                
            else:
                # INSERT PATH (Check for coordinate & name similarity duplicates first)
                if self.validator:
                    # Query all active places in this area to compare
                    existing_places = Place.query.filter_by(area_id=area.id, is_active=True).all()
                    is_duplicate, duplicate_id = self.validator.check_potential_duplicate(place_data, existing_places)
                    
                    if is_duplicate:
                        validation_logger.warning(
                            "Database: SKIPPED potential duplicate: '%s' (matches Place ID: %d)",
                            place_data["name"], duplicate_id
                        )
                        return "skip", duplicate_id
                
                # Create core Place
                place = Place(
                    area_id=area.id,
                    category_id=category.id,
                    name=place_data["name"],
                    description=place_data.get("description") or f"A wonderful {category.name} in {area.name}.",
                    latitude=place_data["latitude"],
                    longitude=place_data["longitude"],
                    average_cost=None, # Editorial/User input
                    is_active=True
                )
                db.session.add(place)
                db.session.flush() # Flushes to database to populate place.id
                
                # Create Google details
                google_detail = PlaceGoogleDetail(
                    place_id=place.id,
                    google_place_id=google_place_id,
                    google_maps_url=place_data.get("google_maps_url"),
                    website=place_data.get("website"),
                    phone=place_data.get("phone"),
                    price_level=place_data.get("price_level"),
                    rating=place_data.get("rating"),
                    review_count=place_data.get("review_count", 0),
                    opening_hours=place_data.get("opening_hours"),
                    popular_menu=place_data.get("popular_menu"),
                    business_status=place_data.get("business_status")
                )
                db.session.add(google_detail)
                
                # Create AI Metadata placeholder (Future AI Enrichment ready)
                ai_meta = PlaceAiMetadata(
                    place_id=place.id,
                    vibe_summary=None,
                    ai_description=None,
                    suggested_tags=None,
                    best_time_to_visit=None,
                    is_enriched=False
                )
                db.session.add(ai_meta)
                
                # Create Images
                for img in image_data:
                    new_img = PlaceImage(
                        place_id=place.id,
                        image_url=img["image_url"],
                        attribution=img.get("attribution"),
                        width=img.get("width"),
                        height=img.get("height")
                    )
                    db.session.add(new_img)
                    
                # Associate Tags
                place.tags = tag_objects
                
                db.session.commit()
                sync_logger.info("Database: INSERTED place: '%s' (ID: %d, Cat: %s)", place.name, place.id, category.name)
                return "insert", place.id
                
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Database: Failed loading place '%s': %s", place_data.get("name"), str(e))
            return "error", None
