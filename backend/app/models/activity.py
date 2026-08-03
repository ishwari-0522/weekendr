from app.database.db import db
from app.models.base import BaseModel

class Activity(BaseModel):
    """
    Model representing specific activity types (e.g. Bowling, Go Karting, Escape Room).
    Used for user preference matching.
    """
    __tablename__ = 'activities'
    
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    average_duration = db.Column(db.Integer, nullable=True) # Duration in minutes

    def __repr__(self):
        return f"<Activity {self.name}>"
