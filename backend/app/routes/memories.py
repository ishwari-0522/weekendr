from flask import Blueprint, request, jsonify
from app.routes.auth import token_required
from app.services.memory import MemoryService, PhotoService, MemoryValidator

memories_bp = Blueprint('memories', __name__)

@memories_bp.route('', methods=['POST'])
@token_required
def create_memory(current_user):
    """Endpoint to save a generated itinerary into the user's Memory Book."""
    req_data = request.get_json() or {}
    
    # 1. Validate fields
    is_valid, errors = MemoryValidator.validate_memory_payload(req_data)
    if not is_valid:
        return jsonify({
            "success": False,
            "message": "Validation failed.",
            "data": {},
            "errors": [errors[k] for k in errors]
        }), 400
        
    # 2. Extract elements
    timeline_json = req_data.get("timeline_json", {})
    story_json = req_data.get("story_json", {})
    
    # Auto-extract defaults if missing in registration
    title = req_data.get("title") or timeline_json.get("title") or "My Outing"
    city = req_data.get("city") or timeline_json.get("city") or "Pune"
    area = req_data.get("area") or timeline_json.get("area")
    
    experience_template = req_data.get("experience_template")
    planned_date = req_data.get("planned_date")
    planned_time = req_data.get("planned_time")
    status = req_data.get("status") or 'upcoming'
    
    memory, err = MemoryService.save_memory(
        user_id=current_user.id,
        title=title,
        timeline_json=timeline_json,
        story_json=story_json,
        experience_template=experience_template,
        city=city,
        area=area,
        planned_date=planned_date,
        planned_time=planned_time,
        status=status
    )
    
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 500
        
    return jsonify({
        "success": True,
        "message": "Memory saved successfully.",
        "data": {
            "memory_id": memory.id,
            "title": memory.title,
            "status": memory.status
        },
        "errors": []
    }), 201

@memories_bp.route('', methods=['GET'])
@token_required
def get_memories(current_user):
    """Endpoint to return user memories with status filters."""
    status_filter = request.args.get('status')
    
    memories, err = MemoryService.get_user_memories(
        user_id=current_user.id,
        status_filter=status_filter
    )
    
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 500
        
    serialized = []
    for m in memories:
        serialized.append({
            "id": m.id,
            "title": m.title,
            "experience_template": m.experience_template,
            "city": m.city,
            "area": m.area,
            "planned_date": m.planned_date,
            "planned_time": m.planned_time,
            "status": m.status,
            "rating": m.rating,
            "cover_photo": m.cover_photo,
            "photo_count": len(m.photos)
        })
        
    return jsonify({
        "success": True,
        "message": "Memories retrieved.",
        "data": serialized,
        "errors": []
    }), 200

@memories_bp.route('/<int:memory_id>', methods=['GET'])
@token_required
def get_memory(current_user, memory_id):
    """Endpoint to return full details of a specific memory."""
    memory, err = MemoryService.get_memory_detail(memory_id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 404 if "not found" in err.lower() else 403
        
    photos_data = [{
        "id": p.id,
        "image_url": p.image_url,
        "caption": p.caption,
        "display_order": p.display_order
    } for p in memory.photos]
    
    return jsonify({
        "success": True,
        "message": "Memory details loaded.",
        "data": {
            "id": memory.id,
            "title": memory.title,
            "experience_template": memory.experience_template,
            "city": memory.city,
            "area": memory.area,
            "planned_date": memory.planned_date,
            "planned_time": memory.planned_time,
            "status": memory.status,
            "story_json": memory.story_json,
            "timeline_json": memory.timeline_json,
            "cover_photo": memory.cover_photo,
            "reflection": memory.reflection,
            "rating": memory.rating,
            "photos": photos_data
        },
        "errors": []
    }), 200

@memories_bp.route('/<int:memory_id>', methods=['PUT'])
@token_required
def update_memory(current_user, memory_id):
    """Endpoint to update details (reflection, title, dates) of a memory."""
    req_data = request.get_json() or {}
    
    # Validate payload
    is_valid, errors = MemoryValidator.validate_memory_payload(req_data)
    if not is_valid:
        return jsonify({
            "success": False,
            "message": "Validation failed.",
            "data": {},
            "errors": [errors[k] for k in errors]
        }), 400
        
    memory, err = MemoryService.update_memory(memory_id, current_user.id, req_data)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Memory updated successfully.",
        "data": {
            "id": memory.id,
            "title": memory.title,
            "status": memory.status,
            "rating": memory.rating,
            "reflection": memory.reflection
        },
        "errors": []
    }), 200

@memories_bp.route('/<int:memory_id>', methods=['DELETE'])
@token_required
def delete_memory(current_user, memory_id):
    """Endpoint to soft-delete a memory."""
    success, err = MemoryService.soft_delete_memory(memory_id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 400
        
    return jsonify({
        "success": True,
        "message": "Memory deleted successfully.",
        "data": {},
        "errors": []
    }), 200

@memories_bp.route('/<int:memory_id>/photos', methods=['POST'])
@token_required
def add_photo(current_user, memory_id):
    """Endpoint to add photo metadata details to a memory."""
    # Verify memory ownership first
    memory, err = MemoryService.get_memory_detail(memory_id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": "Memory not found or unauthorized.",
            "data": {},
            "errors": ["Unauthorized access."]
        }), 403
        
    req_data = request.get_json() or {}
    image_url = req_data.get("image_url")
    caption = req_data.get("caption")
    display_order = req_data.get("display_order", 0)
    
    photo, err = PhotoService.add_photo_metadata(
        memory_id=memory_id,
        image_url=image_url,
        caption=caption,
        display_order=display_order
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
        "message": "Photo metadata saved successfully.",
        "data": {
            "id": photo.id,
            "image_url": photo.image_url,
            "caption": photo.caption
        },
        "errors": []
    }), 201

@memories_bp.route('/photo/<int:photo_id>', methods=['DELETE'])
@token_required
def delete_photo(current_user, photo_id):
    """Endpoint to delete photo metadata from a memory."""
    success, err = PhotoService.delete_photo(photo_id, current_user.id)
    if err:
        return jsonify({
            "success": False,
            "message": err,
            "data": {},
            "errors": [err]
        }), 403
        
    return jsonify({
        "success": True,
        "message": "Photo deleted successfully.",
        "data": {},
        "errors": []
    }), 200
