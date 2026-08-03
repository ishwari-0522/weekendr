from app.models.notification import Notification
from app.database.db import db
from app.utils.logging import error_logger

class NotificationService:
    """
    Service layer coordinates notifications list, unread count, and status transitions.
    """
    @staticmethod
    def get_user_notifications(user_id):
        """Returns active notifications (unread or read) ordered newest first."""
        try:
            notifications = Notification.query.filter(
                Notification.user_id == user_id,
                Notification.status.in_(['unread', 'read'])
            ).order_by(Notification.created_at.desc()).all()
            return notifications, None
        except Exception as e:
            error_logger.exception("Failed to query notifications: %s", str(e))
            return None, "Failed to load notifications."

    @staticmethod
    def get_unread_count(user_id):
        """Returns total count of unread notifications."""
        try:
            count = Notification.query.filter_by(
                user_id=user_id,
                status='unread'
            ).count()
            return count, None
        except Exception as e:
            error_logger.exception("Failed to query unread count: %s", str(e))
            return 0, "Failed to count unread notifications."

    @staticmethod
    def mark_as_read(notification_id, user_id):
        """Marks a notification status as read if owned by user."""
        try:
            notif = db.session.get(Notification, notification_id)
            if not notif or notif.user_id != user_id:
                return None, "Notification not found or unauthorized."
                
            notif.status = 'read'
            db.session.commit()
            return notif, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to update notification: %s", str(e))
            return None, "Failed to mark notification read."

    @staticmethod
    def mark_all_as_read(user_id):
        """Marks all user's unread notifications as read."""
        try:
            unread_notifs = Notification.query.filter_by(
                user_id=user_id,
                status='unread'
            ).all()
            for notif in unread_notifs:
                notif.status = 'read'
            db.session.commit()
            return len(unread_notifs), None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to update all notifications: %s", str(e))
            return 0, "Failed to update notifications."

    @staticmethod
    def dismiss_notification(notification_id, user_id):
        """Soft dismisses notification by setting status to dismissed."""
        try:
            notif = db.session.get(Notification, notification_id)
            if not notif or notif.user_id != user_id:
                return False, "Notification not found or unauthorized."
                
            notif.status = 'dismissed'
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Failed to dismiss notification: %s", str(e))
            return False, "Failed to dismiss notification."
