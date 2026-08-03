import os
import json
import time
import math
from app.services.data_ingestion.geocoding_service import GeocodingService
from app.services.data_ingestion.google_places_service import GooglePlacesService
from app.services.data_ingestion.place_cleaner import PlaceCleaner
from app.services.data_ingestion.place_validator import PlaceValidator
from app.services.data_ingestion.tag_generator import TagGenerator
from app.services.data_ingestion.database_loader import DatabaseLoader
from app.utils.logging import sync_logger, validation_logger, api_logger, error_logger

class DataIngestionSyncRunner:
    """
    Orchestrates the area-by-area and category-by-category ingestion pipeline.
    Uses JSON configuration directories for cities and categories.
    Implements a state tracker (sync_progress.json) to pause/resume crawls.
    """
    def __init__(self, limit=None, dry_run=False, resume=False):
        self.limit = limit
        self.dry_run = dry_run
        self.resume = resume
        
        # Define Configuration Paths
        self.base_config_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'config'))
        self.cities_dir = os.path.join(self.base_config_dir, 'cities')
        self.categories_path = os.path.join(self.base_config_dir, 'categories.json')
        self.sync_config_path = os.path.join(self.base_config_dir, 'sync_config.json')
        self.progress_path = os.path.join(self.base_config_dir, 'sync_progress.json')
        
        # Load configs
        self.sync_config = self._load_json(self.sync_config_path)
        self.categories_config = self._load_json(self.categories_path).get("categories", {})
        
        # Configure operational constants
        self.api_delay = self.sync_config.get("api_delay_seconds", 1.5)
        self.retry_count = self.sync_config.get("retry_count", 3)
        self.min_quality_score = self.sync_config.get("min_quality_score", 40)
        
        # Initialize Core Services
        self.geocoder = GeocodingService()
        self.places_service = GooglePlacesService()
        self.cleaner = PlaceCleaner()
        self.validator = PlaceValidator(
            min_quality_score=self.min_quality_score,
            duplicate_distance_meters=self.sync_config.get("duplicate_distance_meters", 50),
            duplicate_name_threshold=self.sync_config.get("duplicate_name_threshold", 0.6)
        )
        self.tagger = TagGenerator()
        self.db_loader = DatabaseLoader(validator=self.validator)
        
        # Initialize/Load Ingestion State Progress Tracker
        self.progress = self._load_progress()

    def _load_json(self, filepath):
        if not os.path.exists(filepath):
            return {}
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            error_logger.error("Failed to load JSON config from %s: %s", filepath, str(e))
            return {}

    def _load_progress(self):
        """Loads sync_progress.json tracker state if exists and resume flag is set."""
        if self.resume and os.path.exists(self.progress_path):
            state = self._load_json(self.progress_path)
            sync_logger.info("Resuming sync from tracker checkpoint: City '%s', Area '%s', Category '%s'", 
                             state.get("current_city"), state.get("current_area"), state.get("current_category"))
            return state
        return {
            "current_city": None,
            "current_area": None,
            "current_category": None,
            "completed_areas": [],
            "pending_areas": [],
            "failed_areas": {}
        }

    def _save_progress(self, city_name, area_name, category_name, pending_areas, failed_areas):
        """Saves current traversal cursor to state progress file."""
        self.progress.update({
            "current_city": city_name,
            "current_area": area_name,
            "current_category": category_name,
            "pending_areas": pending_areas,
            "failed_areas": failed_areas
        })
        try:
            with open(self.progress_path, 'w', encoding='utf-8') as f:
                json.dump(self.progress, f, indent=2)
            sync_logger.debug("Ingestion tracker checkpoint saved: Area '%s', Cat '%s'", area_name, category_name)
        except Exception as e:
            error_logger.error("Failed saving sync progress tracker file: %s", str(e))

    def _clear_progress(self):
        """Deletes tracker file upon successful sync completion."""
        if os.path.exists(self.progress_path):
            try:
                os.remove(self.progress_path)
                sync_logger.info("Cleared progress state. Crawl completed successfully.")
            except Exception as e:
                error_logger.error("Failed to clear progress file: %s", str(e))
        self.progress = {
            "current_city": None,
            "current_area": None,
            "current_category": None,
            "completed_areas": [],
            "pending_areas": [],
            "failed_areas": {}
        }

    def _get_city_config(self, city_name):
        """Loads specific city configuration file from backend/config/cities/{name}.json."""
        path = os.path.join(self.cities_dir, f"{city_name.lower()}.json")
        return self._load_json(path)

    def get_area_grid(self, area_lat, area_lng, radius, step_size_deg=0.012):
        """
        Creates a bounding box grid centered on an area's center coordinates
        matching its search radius.
        """
        grid = []
        
        # Approximate lat/lng deltas based on radius in meters (1 degree lat ~= 111,000m)
        lat_delta = radius / 110540.0
        lng_delta = radius / (111320.0 * math.cos(math.radians(area_lat)))
        
        min_lat = area_lat - lat_delta
        max_lat = area_lat + lat_delta
        min_lng = area_lng - lng_delta
        max_lng = area_lng + lng_delta
        
        # Grid step traversal
        lat = min_lat
        while lat <= max_lat + (step_size_deg / 2): # Add half step to ensure center/end coverage
            lng = min_lng
            while lng <= max_lng + (step_size_deg / 2):
                grid.append((round(lat, 5), round(lng, 5)))
                lng += step_size_deg
            lat += step_size_deg
            
        # Ensure at least area center is returned if grid is empty
        if not grid:
            grid.append((area_lat, area_lng))
            
        return grid

    def get_sorted_areas(self, city_meta):
        """Sorts areas based on priority (High -> Medium -> Low)."""
        areas = city_meta.get("areas", [])
        priority_map = {"High": 3, "Medium": 2, "Low": 1}
        return sorted(areas, key=lambda x: priority_map.get(x.get("priority", "Medium"), 2), reverse=True)

    def get_sorted_categories(self, category_names):
        """Sorts categories based on categories.json priorities (High -> Medium -> Low)."""
        priority_map = {"High": 3, "Medium": 2, "Low": 1}
        
        categories_with_priority = []
        for name in category_names:
            meta = self.categories_config.get(name, {})
            priority = meta.get("priority", "Medium")
            categories_with_priority.append({
                "name": name,
                "priority_val": priority_map.get(priority, 2),
                "meta": meta
            })
            
        sorted_list = sorted(categories_with_priority, key=lambda x: x["priority_val"], reverse=True)
        return [c["name"] for c in sorted_list]

    def run_sync(self, target_city=None):
        """
        Runs the synchronizer using the Config-Driven Strategy.
        Grid searches Area-by-Area and Category-by-Category.
        """
        sync_logger.info("=============================================")
        sync_logger.info("WEEKENDR City Collection Strategy Crawler Started")
        sync_logger.info("---------------------------------------------")
        
        # Determine cities to sync
        cities_to_process = []
        if target_city:
            cities_to_process.append(target_city)
        else:
            # Load all json files in config/cities/
            if os.path.exists(self.cities_dir):
                for f in os.listdir(self.cities_dir):
                    if f.endswith('.json'):
                        cities_to_process.append(f[:-5].capitalize())
                        
        if not cities_to_process:
            sync_logger.warning("No city configuration files found in %s.", self.cities_dir)
            return {}
            
        stats = {
            "cities_synced": 0,
            "areas_completed": 0,
            "places_discovered": 0,
            "places_inserted": 0,
            "places_updated": 0,
            "places_rejected": 0,
            "duplicates_skipped": 0,
            "errors": 0
        }
        
        for city_name in cities_to_process:
            city_meta = self._get_city_config(city_name)
            if not city_meta:
                sync_logger.error("Failed to load city configuration for: %s", city_name)
                stats["errors"] += 1
                continue
                
            sync_logger.info("Processing City: %s (%s, %s)", city_name, city_meta.get("state"), city_meta.get("country"))
            
            # Upsert City Record
            city_db = None
            if not self.dry_run:
                city_db = self.db_loader.get_or_create_city(
                    name=city_name,
                    state=city_meta.get("state"),
                    country=city_meta.get("country")
                )
                if not city_db:
                    sync_logger.error("Failed to create database reference for City '%s'. Skipping.", city_name)
                    stats["errors"] += 1
                    continue
            
            # Sort areas by priority
            sorted_areas = self.get_sorted_areas(city_meta)
            area_names = [a["name"] for a in sorted_areas]
            
            # Sort categories by priority
            supported_categories = city_meta.get("supported_categories", [])
            sorted_categories = self.get_sorted_categories(supported_categories)
            
            # Apply tracker state filters if resuming
            start_area_idx = 0
            start_cat_idx = 0
            
            if self.resume and self.progress.get("current_city") == city_name:
                curr_area = self.progress.get("current_area")
                curr_cat = self.progress.get("current_category")
                
                if curr_area in area_names:
                    start_area_idx = area_names.index(curr_area)
                if curr_cat in sorted_categories:
                    start_cat_idx = sorted_categories.index(curr_cat)
                    
                stats["areas_completed"] = len(self.progress.get("completed_areas", []))
                
            # Loop over Areas
            for area_idx in range(start_area_idx, len(sorted_areas)):
                area_meta = sorted_areas[area_idx]
                area_name = area_meta["name"]
                
                # Reset category cursor if we move to a new area
                cat_start_loop_idx = start_cat_idx if area_idx == start_area_idx else 0
                
                # Skipped future expansion flagged areas
                if area_meta.get("future_expansion", False):
                    sync_logger.info("Area '%s' flagged for future expansion. Skipping.", area_name)
                    continue
                    
                sync_logger.info("Ingesting Area: %s [Priority: %s, Radius: %dm]", 
                                 area_name, area_meta["priority"], area_meta["search_radius"])
                
                # Fetch pending lists for state tracking
                pending_areas = area_names[area_idx + 1:]
                failed_areas = self.progress.get("failed_areas", {})
                
                # Generate geographic grid points centered on area center coordinates
                grid_step = city_meta.get("search_grid_size", 0.012)
                area_grid = self.get_area_grid(
                    area_meta["latitude"], 
                    area_meta["longitude"], 
                    area_meta["search_radius"], 
                    step_size_deg=grid_step
                )
                
                sync_logger.info("Split Area '%s' into %d search grid points.", area_name, len(area_grid))
                
                # Loop over Categories
                for cat_idx in range(cat_start_loop_idx, len(sorted_categories)):
                    category_name = sorted_categories[cat_idx]
                    category_meta = self.categories_config.get(category_name, {})
                    
                    sync_logger.info("Running Ingestion. Area: '%s' -> Category: '%s'", area_name, category_name)
                    self._save_progress(city_name, area_name, category_name, pending_areas, failed_areas)
                    
                    # Search types list
                    g_types = category_meta.get("google_types", [])
                    keywords = category_meta.get("search_keywords", [])
                    
                    # Track Place IDs queried during this Area/Category loop
                    processed_ids = set()
                    
                    # Loop over coordinates grid points
                    for grid_lat, grid_lng in area_grid:
                        if self.limit and (stats["places_inserted"] + stats["places_updated"]) >= self.limit:
                            break
                            
                        # Query Places API (Delay integrated)
                        nearby_results = []
                        
                        # Use Google place types if defined, else fallback to text/keyword searches
                        query_types = g_types if g_types else [None]
                        
                        for q_type in query_types:
                            # Apply rate-limit delay before Google Places searches
                            time.sleep(self.api_delay)
                            
                            results = self.places_service.find_places_nearby(
                                lat=grid_lat,
                                lng=grid_lng,
                                radius=area_meta["search_radius"],
                                category_type=q_type
                            )
                            
                            # If keywords are defined, filter results or supplement
                            nearby_results.extend(results)
                            
                        # Process Places
                        for summary in nearby_results:
                            if self.limit and (stats["places_inserted"] + stats["places_updated"]) >= self.limit:
                                break
                                
                            g_place_id = summary.get("place_id")
                            if not g_place_id or g_place_id in processed_ids:
                                continue
                                
                            processed_ids.add(g_place_id)
                            stats["places_discovered"] += 1
                            
                            # Apply delay and fetch Details
                            time.sleep(self.api_delay)
                            raw_details = self.places_service.get_place_details(g_place_id)
                            if not raw_details:
                                stats["errors"] += 1
                                continue
                                
                            # Clean details
                            cleaned = {
                                "name": self.cleaner.clean_text(raw_details.get("name")),
                                "google_place_id": g_place_id,
                                "google_maps_url": raw_details.get("url"),
                                "website": raw_details.get("website"),
                                "phone": self.cleaner.clean_phone(raw_details.get("formatted_phone_number")),
                                "price_level": raw_details.get("price_level"),
                                "rating": raw_details.get("rating"),
                                "review_count": raw_details.get("user_ratings_total", 0),
                                "opening_hours": self.cleaner.parse_opening_hours(raw_details.get("opening_hours")),
                                "popular_menu": None,
                                "business_status": raw_details.get("business_status"),
                                "types": raw_details.get("types", [])
                            }
                            
                            geom = raw_details.get("geometry", {})
                            loc = geom.get("location", {})
                            cleaned["latitude"] = loc.get("lat")
                            cleaned["longitude"] = loc.get("lng")
                            
                            # Validate
                            is_valid, reason, score = self.validator.is_valid_place(cleaned)
                            if not is_valid:
                                validation_logger.warning("Rejected '%s' (Score: %d). Reason: %s", cleaned["name"], score, reason)
                                stats["places_rejected"] += 1
                                continue
                                
                            # Generate tags
                            tags = self.tagger.generate_tags(cleaned, category_name)
                            images = self.cleaner.parse_photos(raw_details.get("photos", []))
                            cleaned["images"] = images
                            
                            if self.dry_run:
                                sync_logger.info("[DRY RUN] Ingesting '%s' in Area '%s' (%s)", cleaned["name"], area_name, category_name)
                                stats["places_inserted"] += 1
                                continue
                                
                            # Database Loader commits
                            area_db = self.db_loader.get_or_create_area(
                                city_id=city_db.id,
                                area_name=area_name,
                                lat=area_meta["latitude"],
                                lng=area_meta["longitude"]
                            )
                            category_db = self.db_loader.get_or_create_category(category_name)
                            tag_objects = self.db_loader.get_or_create_tags(tags)
                            
                            op, place_id = self.db_loader.load_place(
                                place_data=cleaned,
                                area=area_db,
                                category=category_db,
                                tag_objects=tag_objects,
                                image_data=images
                            )
                            
                            if op == "insert":
                                stats["places_inserted"] += 1
                            elif op == "update":
                                stats["places_updated"] += 1
                            elif op == "skip":
                                stats["duplicates_skipped"] += 1
                            elif op == "error":
                                stats["errors"] += 1
                                
                # Add current area to completed tracker
                if area_name not in self.progress["completed_areas"]:
                    self.progress["completed_areas"].append(area_name)
                stats["areas_completed"] += 1
                
            # Clear progress state upon completing the city crawl
            self._clear_progress()
            stats["cities_synced"] += 1
            
        sync_logger.info("=============================================")
        sync_logger.info("WEEKENDR City Collection Strategy Crawler Completed")
        sync_logger.info("---------------------------------------------")
        sync_logger.info("Cities Synced:       %d", stats["cities_synced"])
        sync_logger.info("Areas Completed:     %d", stats["areas_completed"])
        sync_logger.info("Places Discovered:   %d", stats["places_discovered"])
        sync_logger.info("Places Inserted:     %d", stats["places_inserted"])
        sync_logger.info("Places Updated:      %d", stats["places_updated"])
        sync_logger.info("Places Rejected:     %d", stats["places_rejected"])
        sync_logger.info("Duplicates Skipped:  %d", stats["duplicates_skipped"])
        sync_logger.info("Errors:              %d", stats["errors"])
        sync_logger.info("=============================================")
        
        return stats
