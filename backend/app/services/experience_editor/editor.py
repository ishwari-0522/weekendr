from app.models import Place
from app.services.experience_editor.replacement_engine import ReplacementEngine
from app.services.experience_editor.timeline_updater import TimelineUpdater
from app.services.experience_editor.budget_recalculator import BudgetRecalculator
from app.services.experience_editor.validator import EditorValidator
from app.services.experience_editor.history_manager import HistoryManager
from app.utils.logging import sync_logger, error_logger

class ExperienceEditor:
    """
    Main orchestrator for WEEKENDR Editable Experience Engine.
    Coordinates place mutations, alternative lookups, history pushbacks,
    and updates chronological timestamps.
    """
    def __init__(self, duration_path=None, traffic_multiplier=1.0):
        self.replacement_engine = ReplacementEngine()
        self.timeline_updater = TimelineUpdater(duration_path, traffic_multiplier)
        self.budget_recalculator = BudgetRecalculator()
        self.validator = EditorValidator()
        self.history_manager = HistoryManager()

    def _get_place_dict(self, place):
        """Converts a database Place object into a timeline-ready dict."""
        image_url = place.images[0].image_url if place.images else None
        cost = float(place.average_cost) if place.average_cost else 300.0
        return {
            "place_id": place.id,
            "name": place.name,
            "category": place.category.name,
            "area": place.area.name,
            "latitude": place.latitude,
            "longitude": place.longitude,
            "estimated_cost": cost,
            "image_url": image_url
        }

    def apply_edit(self, places_list, action, budget=None, duration=None, template_name="Coffee & Conversations", itinerary_id=None):
        """
        Applies requested itinerary edits (swap, move, remove, replace, undo/redo).
        Returns updated timeline JSON.
        """
        action_type = action.get("type")
        sync_logger.info("Applying edit: Action: %s on Itinerary: %s", action_type, itinerary_id)
        
        # 1. Handle undo/redo state pops
        if action_type == "undo":
            modified_places = self.history_manager.undo(itinerary_id, places_list)
        elif action_type == "redo":
            modified_places = self.history_manager.redo(itinerary_id, places_list)
        else:
            # For mutations, push current state to undo history stack
            if itinerary_id:
                self.history_manager.push_state(itinerary_id, places_list)
                
            modified_places = list(places_list)
            
            # 2. Mutate place nodes list based on action parameters
            if action_type == "replace":
                idx = action.get("index")
                new_place_id = action.get("new_place_id")
                
                if 0 <= idx < len(modified_places):
                    target_stop = modified_places[idx]
                    
                    if new_place_id:
                        # Direct place assignment
                        place = Place.query.get(new_place_id)
                        if place:
                            modified_places[idx] = self._get_place_dict(place)
                    else:
                        # Smart replacement alternative lookup
                        exclude_ids = [p["place_id"] for p in modified_places]
                        place = self.replacement_engine.find_alternative(
                            category_name=target_stop["category"],
                            area_name=target_stop["area"],
                            city_name=action.get("city", "Pune"),
                            max_budget=budget,
                            exclude_ids=exclude_ids
                        )
                        if place:
                            modified_places[idx] = self._get_place_dict(place)
                            sync_logger.info("Smart replaced stop at index %d with alternative: '%s'", idx, place.name)
                            
            elif action_type == "remove":
                idx = action.get("index")
                if 0 <= idx < len(modified_places):
                    removed = modified_places.pop(idx)
                    sync_logger.info("Removed stop at index %d ('%s')", idx, removed["name"])
                    
            elif action_type == "add":
                idx = action.get("index")
                new_place_id = action.get("new_place_id")
                if new_place_id:
                    place = Place.query.get(new_place_id)
                    if place:
                        place_dict = self._get_place_dict(place)
                        if 0 <= idx <= len(modified_places):
                            modified_places.insert(idx, place_dict)
                        else:
                            modified_places.append(place_dict)
                            
            elif action_type == "swap":
                idx1 = action.get("index")
                idx2 = action.get("index2")
                if 0 <= idx1 < len(modified_places) and 0 <= idx2 < len(modified_places):
                    modified_places[idx1], modified_places[idx2] = modified_places[idx2], modified_places[idx1]
                    sync_logger.info("Swapped stop index %d with %d", idx1, idx2)
                    
            elif action_type == "move":
                idx = action.get("index")
                direction = action.get("direction")
                if direction == "earlier" and idx > 0:
                    modified_places[idx], modified_places[idx - 1] = modified_places[idx - 1], modified_places[idx]
                elif direction == "later" and idx < len(modified_places) - 1:
                    modified_places[idx], modified_places[idx + 1] = modified_places[idx + 1], modified_places[idx]
                    
            elif action_type == "replace_category":
                # Replace only food, dessert, or activity stops
                target_cat = action.get("category")
                exclude_ids = [p["place_id"] for p in modified_places]
                
                for idx, stop in enumerate(modified_places):
                    if stop["category"] == target_cat:
                        alt = self.replacement_engine.find_alternative(
                            category_name=target_cat,
                            area_name=stop["area"],
                            city_name=action.get("city", "Pune"),
                            max_budget=budget,
                            exclude_ids=exclude_ids
                        )
                        if alt:
                            modified_places[idx] = self._get_place_dict(alt)
                            exclude_ids.append(alt.id)
                            sync_logger.info("Category replace: updated stop at index %d to alternative '%s'", idx, alt.name)

        # 3. Recalculate timeline arrival/departure times and transits
        timeline = self.timeline_updater.update_timeline(
            places_list=modified_places,
            user_duration=duration
        )
        
        # 4. Audit constraints
        is_valid, reason = self.validator.validate_edit(timeline, budget, duration)
        if not is_valid:
            timeline["validation_note"] = reason
            
        # 5. Inject composition metadata details
        hist_counts = self.history_manager.get_history_counts(itinerary_id)
        timeline.update({
            "experience_template": template_name,
            "total_budget": self.budget_recalculator.recalculate_cost(modified_places),
            "metadata": {
                "itinerary_id": itinerary_id,
                "history_states_available": self.history_manager.has_history(itinerary_id),
                "undo_steps": hist_counts["undo_steps"],
                "redo_steps": hist_counts["redo_steps"]
            }
        })
        
        return timeline
