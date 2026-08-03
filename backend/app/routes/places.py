from flask import Blueprint, jsonify

places_bp = Blueprint('places', __name__)

@places_bp.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "active",
        "blueprint": "places"
    }), 200
