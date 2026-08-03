class NotificationValidator:
    """
    Validation constraints verifying transitions for notifications.
    """
    @staticmethod
    def validate_status(status):
        """Checks if next status tag is valid."""
        return status in ['unread', 'read', 'dismissed']
