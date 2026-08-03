from app.database.db import db
from app.models.base import BaseModel

class LiveDay(BaseModel):
    """
    Model representing an active outing session that user experiences in real-time.
    """
    __tablename__ = 'live_days'
    
    memory_id = db.Column(db.Integer, db.ForeignKey('memories.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), default='active', nullable=False) # not_started, active, paused, completed
    current_stop_index = db.Column(db.Integer, default=0, nullable=False)
    
    started_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    last_updated = db.Column(
        db.DateTime, 
        default=db.func.now(), 
        onupdate=db.func.now(), 
        nullable=False
    )
    
    weather_snapshot_json = db.Column(db.JSON, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    # Relationships
    stops = db.relationship(
        'LiveDayStop',
        back_populates='live_day',
        cascade='all, delete-orphan',
        order_by='LiveDayStop.order_index',
        lazy=True
    )

    def __repr__(self):
        return f"<LiveDay ID {self.id} user={self.user_id} status={self.status} stop={self.current_stop_index}>"
