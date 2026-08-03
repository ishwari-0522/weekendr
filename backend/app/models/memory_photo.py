from app.database.db import db
from app.models.base import BaseModel

class MemoryPhoto(BaseModel):
    """
    Model representing user uploaded photos associated with a saved memory book experience.
    """
    __tablename__ = 'memory_photos'
    
    memory_id = db.Column(db.Integer, db.ForeignKey('memories.id', ondelete='CASCADE'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(200), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    
    # Relationships
    memory = db.relationship('Memory', back_populates='photos')

    def __repr__(self):
        return f"<MemoryPhoto ID {self.id} for Memory_ID {self.memory_id}>"
