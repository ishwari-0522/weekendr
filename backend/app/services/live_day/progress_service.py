from app.models.live_day import LiveDay
from app.models.live_day_stop import LiveDayStop
from app.database.db import db
from datetime import datetime
from app.utils.logging import error_logger

class ProgressService:
    """
    Service managing stop-by-stop advances, check-in timestamps, and skips.
    """
    @staticmethod
    def get_user_active_session(user_id):
        """Returns user's active LiveDay session if it exists."""
        return LiveDay.query.filter_by(user_id=user_id, status='active').first()

    @classmethod
    def move_next_stop(cls, live_day_id, user_id):
        """Advances current_stop_index by one. Returns (live_day, error)."""
        try:
            session = db.session.get(LiveDay, live_day_id)
            if not session or session.user_id != user_id or session.status != 'active':
                return None, "Active session not found or unauthorized."
                
            total_stops = len(session.stops)
            if session.current_stop_index >= total_stops - 1:
                return None, "You are already at the final stop of your outing."
                
            # Auto-complete previous stop if pending or current
            current_stop = session.stops[session.current_stop_index]
            if current_stop.status in ['pending', 'current']:
                current_stop.status = 'completed'
                if not current_stop.actual_arrival:
                    current_stop.actual_arrival = datetime.now()
                if not current_stop.actual_departure:
                    current_stop.actual_departure = datetime.now()
                    
            # Move index forward
            session.current_stop_index += 1
            
            # Set new stop to current
            next_stop = session.stops[session.current_stop_index]
            next_stop.status = 'current'
            if not next_stop.actual_arrival:
                next_stop.actual_arrival = datetime.now()
                
            db.session.commit()
            return session, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to advance stop index: %s", str(e))
            return None, "Failed to move to next stop."

    @classmethod
    def move_previous_stop(cls, live_day_id, user_id):
        """Reverts current_stop_index by one. Returns (live_day, error)."""
        try:
            session = db.session.get(LiveDay, live_day_id)
            if not session or session.user_id != user_id or session.status != 'active':
                return None, "Active session not found or unauthorized."
                
            if session.current_stop_index <= 0:
                return None, "You are already at the first stop of your outing."
                
            # Reset current stop status to pending
            current_stop = session.stops[session.current_stop_index]
            current_stop.status = 'pending'
            
            # Move index backward
            session.current_stop_index -= 1
            
            # Reset new stop to current
            prev_stop = session.stops[session.current_stop_index]
            prev_stop.status = 'current'
            
            db.session.commit()
            return session, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to revert stop index: %s", str(e))
            return None, "Failed to move to previous stop."

    @classmethod
    def complete_current_stop(cls, live_day_id, user_id, reflection=None):
        """Marks current stop completed. Returns (live_day, error)."""
        try:
            session = db.session.get(LiveDay, live_day_id)
            if not session or session.user_id != user_id or session.status != 'active':
                return None, "Active session not found or unauthorized."
                
            current_stop = session.stops[session.current_stop_index]
            current_stop.status = 'completed'
            
            if not current_stop.actual_arrival:
                current_stop.actual_arrival = datetime.now()
            current_stop.actual_departure = datetime.now()
            
            if reflection:
                current_stop.reflection = reflection
                
            db.session.commit()
            return session, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to complete stop: %s", str(e))
            return None, "Failed to complete stop."

    @classmethod
    def skip_current_stop(cls, live_day_id, user_id):
        """Skips current stop and moves index forward. Returns (live_day, error)."""
        try:
            session = db.session.get(LiveDay, live_day_id)
            if not session or session.user_id != user_id or session.status != 'active':
                return None, "Active session not found or unauthorized."
                
            current_stop = session.stops[session.current_stop_index]
            current_stop.status = 'skipped'
            
            total_stops = len(session.stops)
            # If not final stop, advance index
            if session.current_stop_index < total_stops - 1:
                session.current_stop_index += 1
                next_stop = session.stops[session.current_stop_index]
                next_stop.status = 'current'
                if not next_stop.actual_arrival:
                    next_stop.actual_arrival = datetime.now()
            else:
                # If final stop is skipped, we stay but mark status skipped
                pass
                
            db.session.commit()
            return session, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to skip stop: %s", str(e))
            return None, "Failed to skip stop."
