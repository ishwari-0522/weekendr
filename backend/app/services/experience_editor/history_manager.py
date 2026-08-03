import copy
from app.utils.logging import sync_logger

# Class-level global stack maps to keep state persistence across request scopes
_HISTORY_CACHE = {}

class HistoryManager:
    """
    Manages in-memory undo and redo history stacks for active itineraries.
    """
    def __init__(self, max_stack_size=20):
        self.max_stack_size = max_stack_size

    def _get_stacks(self, itinerary_id):
        """Retrieves or initializes the stack structures for an itinerary ID."""
        if itinerary_id not in _HISTORY_CACHE:
            _HISTORY_CACHE[itinerary_id] = {
                "undo_stack": [],
                "redo_stack": []
            }
        return _HISTORY_CACHE[itinerary_id]

    def push_state(self, itinerary_id, places_list):
        """Pushes a new state to the undo stack and clears the redo stack."""
        if not itinerary_id:
            return
            
        stacks = self._get_stacks(itinerary_id)
        # Store a deepcopy to avoid mutable reference side effects
        state_copy = copy.deepcopy(places_list)
        
        # Don't push duplicate adjacent states
        if stacks["undo_stack"] and stacks["undo_stack"][-1] == state_copy:
            return
            
        stacks["undo_stack"].append(state_copy)
        stacks["redo_stack"].clear() # Clear redo on new action
        
        # Cap stack size
        if len(stacks["undo_stack"]) > self.max_stack_size:
            stacks["undo_stack"].pop(0)
            
        sync_logger.debug("History: Pushed state for '%s'. Undo stack size: %d", 
                          itinerary_id, len(stacks["undo_stack"]))

    def undo(self, itinerary_id, current_places_list):
        """Pops the last state from undo stack, saves current to redo stack, and returns it."""
        if not itinerary_id:
            return current_places_list
            
        stacks = self._get_stacks(itinerary_id)
        if not stacks["undo_stack"]:
            sync_logger.info("History: Undo stack empty for '%s'.", itinerary_id)
            return current_places_list
            
        # Push current state to redo
        stacks["redo_stack"].append(copy.deepcopy(current_places_list))
        
        # Pop previous state
        previous_state = stacks["undo_stack"].pop()
        sync_logger.info("History: Undo executed. Undo size: %d, Redo size: %d", 
                         len(stacks["undo_stack"]), len(stacks["redo_stack"]))
        return previous_state

    def redo(self, itinerary_id, current_places_list):
        """Pops the next state from redo stack, saves current to undo stack, and returns it."""
        if not itinerary_id:
            return current_places_list
            
        stacks = self._get_stacks(itinerary_id)
        if not stacks["redo_stack"]:
            sync_logger.info("History: Redo stack empty for '%s'.", itinerary_id)
            return current_places_list
            
        # Push current state to undo
        stacks["undo_stack"].append(copy.deepcopy(current_places_list))
        
        # Pop next state
        next_state = stacks["redo_stack"].pop()
        sync_logger.info("History: Redo executed. Undo size: %d, Redo size: %d", 
                         len(stacks["undo_stack"]), len(stacks["redo_stack"]))
        return next_state

    def clear_history(self, itinerary_id):
        """Deletes histories for an itinerary session."""
        if itinerary_id in _HISTORY_CACHE:
            del _HISTORY_CACHE[itinerary_id]

    def has_history(self, itinerary_id):
        """Checks if history states exist for an itinerary ID."""
        return itinerary_id in _HISTORY_CACHE

    def get_history_counts(self, itinerary_id):
        """Returns length of undo and redo stacks."""
        stacks = _HISTORY_CACHE.get(itinerary_id, {})
        return {
            "undo_steps": len(stacks.get("undo_stack", [])),
            "redo_steps": len(stacks.get("redo_stack", []))
        }
