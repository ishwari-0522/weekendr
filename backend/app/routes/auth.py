from flask import Blueprint, request, jsonify, current_app
from app.services.auth import AuthService, JwtService, AuthValidator
from app.models.user import User
from app.database.db import db
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    """Decorator to enforce secure token requirements on routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check authorization headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                
        if not token:
            return jsonify({
                "success": False,
                "message": "Access token is missing.",
                "data": {},
                "errors": ["Authorization token is required."]
            }), 401
            
        secret = current_app.config.get('SECRET_KEY', 'dev_secret_key')
        payload, err = JwtService.decode(token, secret)
        if err:
            return jsonify({
                "success": False,
                "message": f"Unauthorized access: {err}",
                "data": {},
                "errors": [err]
            }), 401
            
        current_user = db.session.get(User, payload.get("user_id"))
        if not current_user:
            return jsonify({
                "success": False,
                "message": "User not found.",
                "data": {},
                "errors": ["User session is invalid."]
            }), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint to register a new WEEKENDR user."""
    req_data = request.get_json() or {}
    
    # 1. Validate fields
    is_valid, errors = AuthValidator.validate_registration(req_data)
    if not is_valid:
        return jsonify({
            "success": False,
            "message": "Validation failed.",
            "data": {},
            "errors": [errors[k] for k in errors]
        }), 400
        
    # 2. Register user via service
    user, err = AuthService.register_user(
        full_name=req_data["full_name"],
        email=req_data["email"],
        password=req_data["password"],
        phone_number=req_data.get("phone_number")
    )
    
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 409
        
    return jsonify({
        "success": True,
        "message": "User registration successful.",
        "data": {
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email
        },
        "errors": []
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint to authenticate WEEKENDR users."""
    req_data = request.get_json() or {}
    
    is_valid, errors = AuthValidator.validate_login(req_data)
    if not is_valid:
        return jsonify({
            "success": False,
            "message": "Login fields missing.",
            "data": {},
            "errors": [errors[k] for k in errors]
        }), 400
        
    # 1. Authenticate credentials
    user, err = AuthService.authenticate_user(
        email=req_data["email"],
        password=req_data["password"]
    )
    
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 401
        
    # 2. Encode JWT token
    secret = current_app.config.get('SECRET_KEY', 'dev_secret_key')
    payload = {"user_id": user.id, "email": user.email}
    token = JwtService.encode(payload, secret)
    
    return jsonify({
        "success": True,
        "message": "Login successful.",
        "data": {
            "token": token,
            "profile": {
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "preferences": {
                    "preferred_city": user.preferred_city,
                    "preferred_budget": user.preferred_budget,
                    "preferred_group_type": user.preferred_group_type,
                    "preferred_vibe": user.preferred_vibe
                }
            }
        },
        "errors": []
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    """Endpoint to return details of active session user."""
    return jsonify({
        "success": True,
        "message": "User profiles retrieved.",
        "data": {
            "user_id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone_number": current_user.phone_number,
            "preferences": {
                "preferred_city": current_user.preferred_city,
                "preferred_budget": current_user.preferred_budget,
                "preferred_group_type": current_user.preferred_group_type,
                "preferred_vibe": current_user.preferred_vibe
            }
        },
        "errors": []
    }), 200

@auth_bp.route('/preferences', methods=['PUT'])
@token_required
def preferences(current_user):
    """Endpoint to update profile preference attributes."""
    req_data = request.get_json() or {}
    
    user, err = AuthService.update_preferences(current_user.id, req_data)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "User preferences updated successfully.",
        "data": {
            "user_id": user.id,
            "preferences": {
                "preferred_city": user.preferred_city,
                "preferred_budget": user.preferred_budget,
                "preferred_group_type": user.preferred_group_type,
                "preferred_vibe": user.preferred_vibe
            }
        },
        "errors": []
    }), 200
