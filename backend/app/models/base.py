from datetime import datetime
from app.database.db import db

class BaseModel(db.Model):
    """
    Abstract base model that defines common fields for all database tables.
    """
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    updated_at = db.Column(
        db.DateTime, 
        default=db.func.now(), 
        onupdate=db.func.now(), 
        nullable=False
    )
