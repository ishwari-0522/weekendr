# Expose blueprints for registration in application factory
from .auth import auth_bp
from .users import users_bp
from .places import places_bp
from .planner_api import planner_api_bp
from .memories import memories_bp
from .maps import maps_bp
from .assistant import assistant_bp
from .live_day import live_day_bp
from .explore import explore_bp
from .notifications import notifications_bp

# List of blueprints for registration looping
all_blueprints = [
    (auth_bp, '/api/auth'),
    (users_bp, '/api/users'),
    (places_bp, '/api/places'),
    (planner_api_bp, '/api'),
    (memories_bp, '/api/memories'),
    (maps_bp, '/api/maps'),
    (assistant_bp, '/api/assistant'),
    (live_day_bp, '/api/live-day'),
    (explore_bp, '/api/explore'),
    (notifications_bp, '/api/notifications')
]
