from app.models.live_day import LiveDay
from app.models.live_day_stop import LiveDayStop
from app.models.memory import Memory
from app.database.db import db
from datetime import datetime
from app.utils.logging import error_logger

class LiveDayService:
    """
    Service layer starting and ending Live Day sessions.
    """
    @staticmethod
    def start_live_day(user_id, memory_id):
        """
        Creates a Live Day session derived from a saved Memory. Returns (live_day, error).
        """
        try:
            # Check duplicate active outings
            active_session = LiveDay.query.filter_by(user_id=user_id, status='active').first()
            if active_session:
                return None, "You already have an active Live Day outing session."
                
            # Fetch target memory
            memory = db.session.get(Memory, memory_id)
            if not memory or memory.user_id != user_id or memory.is_deleted:
                return None, "Memory not found or unauthorized."
                
            # Create LiveDay session
            live_day = LiveDay(
                memory_id=memory_id,
                user_id=user_id,
                status='active',
                current_stop_index=0
            )
            db.session.add(live_day)
            db.session.flush() # Populate live_day.id
            
            # Extract stops from timeline_json segments
            timeline = memory.timeline_json or {}
            segments = timeline.get("segments", [])
            activities = [s for s in segments if s.get("type") == 'activity']
            
            if not activities:
                return None, "This outing does not contain any destination stops."
                
            # Create LiveDayStop records
            for idx, act in enumerate(activities):
                # Set first stop to current check-in on start
                stop_status = 'current' if idx == 0 else 'pending'
                planned_start = act.get("arrival_time")
                planned_end = act.get("departure_time")
                
                stop = LiveDayStop(
                    live_day_id=live_day.id,
                    order_index=idx,
                    planned_start=planned_start,
                    planned_end=planned_end,
                    status=stop_status,
                    reflection=""
                )
                if idx == 0:
                    stop.actual_arrival = datetime.now()
                    
                db.session.add(stop)
                
            db.session.commit()
            return live_day, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to start Live Day session: %s", str(e))
            return None, "An unexpected error occurred starting Live Day."

    @staticmethod
    def end_live_day(live_day_id, user_id):
        """
        Completes the outing session, updating Memory and transferring reflections. Returns (live_day, error).
        """
        try:
            session = db.session.get(LiveDay, live_day_id)
            if not session or session.user_id != user_id or session.status != 'active':
                return None, "Active session not found or unauthorized."
                
            session.status = 'completed'
            session.completed_at = datetime.now()
            
            # Update associated Memory status
            memory = db.session.get(Memory, session.memory_id)
            if memory:
                memory.status = 'completed'
                
                # Consolidate reflections from stops
                reflections = [s.reflection for s in session.stops if s.reflection]
                if reflections:
                    memory.reflection = " | ".join(reflections)
                    
            db.session.commit()
            return session, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to end Live Day session: %s", str(e))
            return None, "Failed to end Live Day outing."
