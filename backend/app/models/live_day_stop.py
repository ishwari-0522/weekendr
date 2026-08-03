from app.database.db import db
from app.models.base import BaseModel

class LiveDayStop(BaseModel):
    """
    Model representing a single destination stop within a Live Day outing session.
    """
    __tablename__ = 'live_day_stops'
    
    live_day_id = db.Column(db.Integer, db.ForeignKey('live_days.id', ondelete='CASCADE'), nullable=False)
    place_id = db.Column(db.Integer, db.ForeignKey('places.id', ondelete='SET NULL'), nullable=True)
    order_index = db.Column(db.Integer, nullable=False)
    
    # Planned offsets (e.g. '14:30' or datetime strings)
    planned_start = db.Column(db.String(30), nullable=True)
    planned_end = db.Column(db.String(30), nullable=True)
    
    # Actual check-in/check-out timestamps
    actual_arrival = db.Column(db.DateTime, nullable=True)
    actual_departure = db.Column(db.DateTime, nullable=True)
    
    status = db.Column(db.String(30), default='pending', nullable=False) # pending, current, completed, skipped
    photo_count = db.Column(db.Integer, default=0, nullable=False)
    reflection = db.Column(db.Text, nullable=True)
    
    # Relationships
    live_day = db.relationship('LiveDay', back_populates='stops')
    place = db.relationship('Place')

    def __repr__(self):
        return f"<LiveDayStop ID {self.id} Stop {self.order_index} status={self.status}>"
