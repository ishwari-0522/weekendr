from flask import Blueprint, jsonify
from app.routes.auth import token_required
from app.database.db import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "active",
        "blueprint": "users"
    }), 200

@users_bp.route('/me', methods=['DELETE'])
@token_required
def delete_me(current_user):
    """Endpoint to delete user account."""
    try:
        db.session.delete(current_user)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Account deleted successfully.",
            "data": {},
            "errors": []
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to delete account.",
            "data": {},
            "errors": [str(e)]
        }), 500
