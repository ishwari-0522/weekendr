from app.models.memory import Memory
from app.database.db import db
from app.utils.logging import error_logger

class MemoryService:
    """
    Service layer orchestrating Memory Book logic (create, read, update, soft-delete).
    """
    @staticmethod
    def save_memory(
        user_id, 
        title, 
        timeline_json, 
        story_json=None, 
        experience_template=None, 
        city=None, 
        area=None, 
        planned_date=None, 
        planned_time=None, 
        status='upcoming'
    ):
        """
        Creates and registers a new Memory record. Returns (memory, error_message).
        """
        try:
            # Check if an experience_id is optional but extractable
            experience_id = timeline_json.get("experience_id") if isinstance(timeline_json, dict) else None

            memory = Memory(
                user_id=user_id,
                experience_id=experience_id,
                title=title,
                experience_template=experience_template,
                city=city,
                area=area,
                planned_date=planned_date,
                planned_time=planned_time,
                status=status,
                story_json=story_json,
                timeline_json=timeline_json
            )
            db.session.add(memory)
            db.session.commit()
            return memory, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to save memory: %s", str(e))
            return None, "An unexpected error occurred saving memory."

    @staticmethod
    def get_user_memories(user_id, status_filter=None):
        """
        Retrieves user's memories that are not soft-deleted. Returns (memories, error_message).
        """
        try:
            query = Memory.query.filter_by(user_id=user_id, is_deleted=False)
            if status_filter:
                query = query.filter_by(status=status_filter.lower())
                
            memories = query.order_by(Memory.created_at.desc()).all()
            return memories, None
        except Exception as e:
            error_logger.exception("Failed to query user memories: %s", str(e))
            return None, "Failed to retrieve memories."

    @staticmethod
    def get_memory_detail(memory_id, user_id):
        """
        Retrieves a single memory details if owned by current user. Returns (memory, error_message).
        """
        try:
            memory = db.session.get(Memory, memory_id)
            if not memory or memory.is_deleted:
                return None, "Memory not found."
            if memory.user_id != user_id:
                return None, "Unauthorized access to this memory."
            return memory, None
        except Exception as e:
            error_logger.exception("Failed to fetch memory detail: %s", str(e))
            return None, "Failed to load memory details."

    @staticmethod
    def update_memory(memory_id, user_id, update_data):
        """
        Updates memory properties. Returns (memory, error_message).
        """
        try:
            memory = db.session.get(Memory, memory_id)
            if not memory or memory.is_deleted:
                return None, "Memory not found."
            if memory.user_id != user_id:
                return None, "Unauthorized access to edit this memory."
                
            # Perform optional property mappings
            if "title" in update_data:
                memory.title = update_data["title"]
            if "reflection" in update_data:
                memory.reflection = update_data["reflection"]
            if "rating" in update_data:
                memory.rating = update_data["rating"]
            if "planned_date" in update_data:
                memory.planned_date = update_data["planned_date"]
            if "planned_time" in update_data:
                memory.planned_time = update_data["planned_time"]
            if "status" in update_data:
                memory.status = update_data["status"]
            if "cover_photo" in update_data:
                memory.cover_photo = update_data["cover_photo"]
                
            db.session.commit()
            return memory, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to update memory: %s", str(e))
            return None, "An unexpected error occurred saving updates."

    @staticmethod
    def soft_delete_memory(memory_id, user_id):
        """
        Performs soft delete on memory by setting is_deleted flag. Returns (success, error_message).
        """
        try:
            memory = db.session.get(Memory, memory_id)
            if not memory or memory.is_deleted:
                return False, "Memory not found."
            if memory.user_id != user_id:
                return False, "Unauthorized access to delete this memory."
                
            memory.is_deleted = True
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to soft-delete memory: %s", str(e))
            return False, "An unexpected error occurred deleting the memory."
