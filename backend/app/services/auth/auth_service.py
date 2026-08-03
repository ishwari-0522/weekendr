from app.models.user import User
from app.database.db import db
from app.utils.logging import error_logger

class AuthService:
    """
    Service encapsulating database actions for user registration, authentication, and updates.
    """
    @staticmethod
    def register_user(full_name, email, password, phone_number=None):
        """
        Creates and stores user in database. Returns (user, error_message).
        """
        try:
            # Check duplicate email
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return None, "Email address is already registered."
                
            new_user = User(
                full_name=full_name,
                email=email,
                phone_number=phone_number
            )
            new_user.set_password(password)
            
            db.session.add(new_user)
            db.session.commit()
            return new_user, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Registration failed: %s", str(e))
            return None, "An unexpected error occurred during registration."

    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticates user by password hash checks. Returns (user, error_message).
        """
        try:
            user = User.query.filter_by(email=email).first()
            if not user or not user.check_password(password):
                return None, "Invalid email address or password."
            return user, None
        except Exception as e:
            error_logger.exception("Authentication failed: %s", str(e))
            return None, "An unexpected error occurred during login."

    @staticmethod
    def update_preferences(user_id, preferences):
        """
        Updates user preference columns. Returns (user, error_message).
        """
        try:
            user = db.session.get(User, user_id)
            if not user:
                return None, "User not found."
                
            if "preferred_city" in preferences:
                user.preferred_city = preferences["preferred_city"]
            if "preferred_budget" in preferences:
                user.preferred_budget = int(preferences["preferred_budget"])
            if "preferred_group_type" in preferences:
                user.preferred_group_type = preferences["preferred_group_type"]
            if "preferred_vibe" in preferences:
                user.preferred_vibe = preferences["preferred_vibe"]
                
            db.session.commit()
            return user, None
        except Exception as e:
            db.session.rollback()
            error_logger.exception("Preferences update failed: %s", str(e))
            return None, "Failed to update preferences."
