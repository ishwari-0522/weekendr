from flask import Blueprint, jsonify

maps_bp = Blueprint('maps', __name__)

@maps_bp.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "active",
        "blueprint": "maps"
    }), 200
