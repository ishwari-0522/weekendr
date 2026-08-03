# Expose all SQLAlchemy models for easy importing and detection by Flask-Migrate / Alembic
from app.database.db import db
from app.models.base import BaseModel
from app.models.user import User
from app.models.location import City, Area
from app.models.place import Category, Tag, Place, PlaceGoogleDetail, PlaceAiMetadata, PlaceImage, RawGooglePlace, place_tag
from app.models.activity import Activity
from app.models.experience import ExperienceTemplate, Experience, ExperiencePlace
from app.models.memory import Memory
from app.models.memory_photo import MemoryPhoto
from app.models.notification import Notification
from app.models.live_day import LiveDay
from app.models.live_day_stop import LiveDayStop

__all__ = [
    'db',
    'BaseModel',
    'User',
    'City',
    'Area',
    'Category',
    'Tag',
    'Place',
    'PlaceGoogleDetail',
    'PlaceAiMetadata',
    'PlaceImage',
    'RawGooglePlace',
    'place_tag',
    'Activity',
    'ExperienceTemplate',
    'Experience',
    'ExperiencePlace',
    'Memory',
    'MemoryPhoto',
    'Notification',
    'LiveDay',
    'LiveDayStop'
]
