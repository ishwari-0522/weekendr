from flask import Blueprint, request, jsonify
from app.routes.auth import token_required
from app.services.live_day import LiveDayService, ProgressService, LiveDayValidator

live_day_bp = Blueprint('live_day', __name__)

@live_day_bp.route('/start', methods=['POST'])
@token_required
def start(current_user):
    """Endpoint to trigger a Live Day session from a saved memory itinerary."""
    req_data = request.get_json() or {}
    
    # 1. Validate payload inputs
    is_valid, err = LiveDayValidator.validate_start_payload(req_data)
    if not is_valid:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    memory_id = req_data["memory_id"]
    session, err = LiveDayService.start_live_day(current_user.id, memory_id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Live Day session started successfully.",
        "data": {
            "session_id": session.id,
            "current_stop_index": session.current_stop_index,
            "status": session.status
        },
        "errors": []
    }), 201

@live_day_bp.route('/current', methods=['GET'])
@token_required
def get_current(current_user):
    """Endpoint to return details of user's active outing session."""
    session = ProgressService.get_user_active_session(current_user.id)
    if not session:
        return jsonify({
            "success": True,
            "message": "No active Live Day session.",
            "data": None,
            "errors": []
        }), 200
        
    stops_data = [{
        "id": s.id,
        "order_index": s.order_index,
        "planned_start": s.planned_start,
        "planned_end": s.planned_end,
        "actual_arrival": s.actual_arrival.isoformat() if s.actual_arrival else None,
        "actual_departure": s.actual_departure.isoformat() if s.actual_departure else None,
        "status": s.status,
        "reflection": s.reflection
    } for s in session.stops]
    
    return jsonify({
        "success": True,
        "message": "Active Live Day session retrieved.",
        "data": {
            "id": session.id,
            "memory_id": session.memory_id,
            "status": session.status,
            "current_stop_index": session.current_stop_index,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "stops": stops_data
        },
        "errors": []
    }), 200

@live_day_bp.route('/next', methods=['POST'])
@token_required
def next_stop(current_user):
    """Endpoint to advance index to next stop."""
    session = ProgressService.get_user_active_session(current_user.id)
    if not session:
        return jsonify({
            "success": False,
            "message": "No active Live Day session found.",
            "data": {},
            "errors": ["Session not active."]
        }), 404
        
    updated_session, err = ProgressService.move_next_stop(session.id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Moved to next stop.",
        "data": {
            "current_stop_index": updated_session.current_stop_index
        },
        "errors": []
    }), 200

@live_day_bp.route('/previous', methods=['POST'])
@token_required
def previous_stop(current_user):
    """Endpoint to revert index back one stop."""
    session = ProgressService.get_user_active_session(current_user.id)
    if not session:
        return jsonify({
            "success": False,
            "message": "No active Live Day session found.",
            "data": {},
            "errors": ["Session not active."]
        }), 404
        
    updated_session, err = ProgressService.move_previous_stop(session.id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Moved to previous stop.",
        "data": {
            "current_stop_index": updated_session.current_stop_index
        },
        "errors": []
    }), 200

@live_day_bp.route('/complete-stop', methods=['POST'])
@token_required
def complete_stop(current_user):
    """Endpoint to mark current stop completed."""
    session = ProgressService.get_user_active_session(current_user.id)
    if not session:
        return jsonify({
            "success": False,
            "message": "No active Live Day session found.",
            "data": {},
            "errors": ["Session not active."]
        }), 404
        
    req_data = request.get_json() or {}
    reflection = req_data.get("reflection")
    
    updated_session, err = ProgressService.complete_current_stop(
        live_day_id=session.id,
        user_id=current_user.id,
        reflection=reflection
    )
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Stop marked completed.",
        "data": {
            "current_stop_index": updated_session.current_stop_index
        },
        "errors": []
    }), 200

@live_day_bp.route('/skip-stop', methods=['POST'])
@token_required
def skip_stop(current_user):
    """Endpoint to skip current stop."""
    session = ProgressService.get_user_active_session(current_user.id)
    if not session:
        return jsonify({
            "success": False,
            "message": "No active Live Day session found.",
            "data": {},
            "errors": ["Session not active."]
        }), 404
        
    updated_session, err = ProgressService.skip_current_stop(session.id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Stop marked skipped.",
        "data": {
            "current_stop_index": updated_session.current_stop_index
        },
        "errors": []
    }), 200

@live_day_bp.route('/end', methods=['POST'])
@token_required
def end(current_user):
    """Endpoint to end Live Day outing, updates memory status."""
    session = ProgressService.get_user_active_session(current_user.id)
    if not session:
        return jsonify({
            "success": False,
            "message": "No active Live Day session found.",
            "data": {},
            "errors": ["Session not active."]
        }), 404
        
    completed_session, err = LiveDayService.end_live_day(session.id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Live Day session completed. Reflections transferred to Memory Book.",
        "data": {
            "status": completed_session.status
        },
        "errors": []
    }), 200
