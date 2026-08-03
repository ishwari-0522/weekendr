from app.models.memory_photo import MemoryPhoto
from app.models.memory import Memory
from app.database.db import db
from app.utils.logging import error_logger

class PhotoService:
    """
    Service managing photo uploads metadata additions and removals actions.
    """
    @staticmethod
    def add_photo_metadata(memory_id, image_url, caption=None, display_order=0):
        """
        Creates a new photo record linked to a memory. Returns (photo, error_message).
        """
        try:
            if not image_url:
                return None, "Image URL is required."
                
            photo = MemoryPhoto(
                memory_id=memory_id,
                image_url=image_url,
                caption=caption,
                display_order=display_order
            )
            db.session.add(photo)
            db.session.commit()
            return photo, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to save photo metadata: %s", str(e))
            return None, "An unexpected error occurred saving photo details."

    @staticmethod
    def delete_photo(photo_id, user_id):
        """
        Deletes a photo metadata record if the user owns the parent memory. Returns (success, error_message).
        """
        try:
            photo = db.session.get(MemoryPhoto, photo_id)
            if not photo:
                return False, "Photo not found."
                
            # Verify owner of the parent memory
            memory = db.session.get(Memory, photo.memory_id)
            if not memory or memory.user_id != user_id:
                return False, "Unauthorized access to delete this photo."
                
            db.session.delete(photo)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to delete photo: %s", str(e))
            return False, "An unexpected error occurred deleting the photo."
