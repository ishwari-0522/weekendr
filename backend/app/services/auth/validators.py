import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

class AuthValidator:
    """
    Validation checks for user registrations and logins requests payloads.
    """
    @staticmethod
    def validate_registration(data):
        """
        Validates register body elements. Returns (is_valid, errors).
        """
        errors = {}
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        full_name = data.get("full_name", "").strip()
        
        if not full_name:
            errors["full_name"] = "Full name is required."
        elif len(full_name) < 2:
            errors["full_name"] = "Full name must be at least 2 characters."
            
        if not email:
            errors["email"] = "Email address is required."
        elif not EMAIL_REGEX.match(email):
            errors["email"] = "Invalid email format."
            
        if not password:
            errors["password"] = "Password is required."
        elif len(password) < 6:
            errors["password"] = "Password must be at least 6 characters long."
            
        return len(errors) == 0, errors

    @staticmethod
    def validate_login(data):
        """
        Validates login body elements. Returns (is_valid, errors).
        """
        errors = {}
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        
        if not email:
            errors["email"] = "Email address is required."
        if not password:
            errors["password"] = "Password is required."
            
        return len(errors) == 0, errors
