from app.database.db import db
from app.models.base import BaseModel

class Notification(BaseModel):
    """
    Model representing user companion alerts, reminders, and weekly recommendations.
    """
    __tablename__ = 'notifications'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # upcoming_outing, starting_soon, memory_reminder, reflection_reminder, etc.
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    action_url = db.Column(db.String(255), nullable=True)
    
    status = db.Column(db.String(30), default='unread', nullable=False) # unread, read, dismissed
    
    scheduled_for = db.Column(db.DateTime, nullable=True)
    sent_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    
    metadata_json = db.Column(db.JSON, nullable=True)
    
    # Relationships
    user = db.relationship('User', back_populates='notifications')

    def __repr__(self):
        return f"<Notification ID {self.id} for User_ID {self.user_id} - Type: {self.type}>"
