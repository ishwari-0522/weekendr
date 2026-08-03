from app.database.db import db
from app.models.base import BaseModel

class Memory(BaseModel):
    """
    Model representing user saved itineraries, reflections, ratings, and photos.
    """
    __tablename__ = 'memories'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    experience_id = db.Column(
        db.Integer, 
        db.ForeignKey('experiences.id', ondelete='SET NULL'), 
        nullable=True
    )
    title = db.Column(db.String(150), nullable=False)
    experience_template = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    area = db.Column(db.String(100), nullable=True)
    
    planned_date = db.Column(db.String(30), nullable=True) # Planned calendar date
    planned_time = db.Column(db.String(30), nullable=True) # E.g., '14:30'
    status = db.Column(db.String(30), default='draft', nullable=False) # draft, upcoming, completed, cancelled
    
    story_json = db.Column(db.JSON, nullable=True)
    timeline_json = db.Column(db.JSON, nullable=True)
    
    cover_photo = db.Column(db.String(255), nullable=True)
    reflection = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, nullable=True)
    
    is_deleted = db.Column(db.Boolean, default=False, nullable=False) # Soft delete
    
    # Relationships
    user = db.relationship('User', back_populates='memories')
    experience = db.relationship('Experience', back_populates='memory')
    
    photos = db.relationship(
        'MemoryPhoto',
        back_populates='memory',
        cascade='all, delete-orphan',
        lazy=True
    )

    def __repr__(self):
        return f"<Memory {self.title} status={self.status}>"
