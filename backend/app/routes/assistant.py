from flask import Blueprint, jsonify

assistant_bp = Blueprint('assistant', __name__)

@assistant_bp.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "active",
        "blueprint": "assistant"
    }), 200
