from flask import Blueprint, request, jsonify
from app.routes.auth import token_required
from app.services.notifications import NotificationService, NotificationScheduler

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@token_required
def get_notifications(current_user):
    """Endpoint returning all active user notifications, triggering auto-reminders check."""
    # Trigger auto reminders generation dynamically
    NotificationScheduler.trigger_auto_reminders(current_user.id)
    
    notifications, err = NotificationService.get_user_notifications(current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 500
        
    serialized = []
    for n in notifications:
        serialized.append({
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "action_url": n.action_url,
            "status": n.status,
            "sent_at": n.sent_at.isoformat() if n.sent_at else None
        })
        
    return jsonify({
        "success": True,
        "message": "Notifications loaded.",
        "data": serialized,
        "errors": []
    }), 200

@notifications_bp.route('/unread-count', methods=['GET'])
@token_required
def get_unread_count(current_user):
    """Endpoint returning unread alerts count."""
    # Trigger auto reminders generation dynamically
    NotificationScheduler.trigger_auto_reminders(current_user.id)
    
    count, err = NotificationService.get_unread_count(current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 500
        
    return jsonify({
        "success": True,
        "message": "Unread count counted.",
        "data": {
            "unread_count": count
        },
        "errors": []
    }), 200

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_read(current_user, notification_id):
    """Endpoint to mark notification status as read."""
    notif, err = NotificationService.mark_as_read(notification_id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Notification marked read successfully.",
        "data": {
            "id": notif.id,
            "status": notif.status
        },
        "errors": []
    }), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@token_required
def read_all(current_user):
    """Endpoint to mark all user's notifications as read."""
    count, err = NotificationService.mark_all_as_read(current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 500
        
    return jsonify({
        "success": True,
        "message": "All notifications marked read.",
        "data": {
            "updated_count": count
        },
        "errors": []
    }), 200

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@token_required
def dismiss(current_user, notification_id):
    """Endpoint to soft-dismiss notification by setting status to dismissed."""
    success, err = NotificationService.dismiss_notification(notification_id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Notification dismissed successfully.",
        "data": {},
        "errors": []
    }), 200
