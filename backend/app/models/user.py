from app.database.db import db
from app.models.base import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash

class User(BaseModel):
    """
    Model representing user account information.
    """
    __tablename__ = 'users'
    
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    is_verified = db.Column(db.Boolean, default=True, nullable=False)
    profile_image = db.Column(db.String(255), nullable=True)
    
    # User Preferences
    preferred_city = db.Column(db.String(100), nullable=True)
    preferred_budget = db.Column(db.Integer, nullable=True)
    preferred_group_type = db.Column(db.String(50), nullable=True)
    preferred_vibe = db.Column(db.String(100), nullable=True)
    
    # Relationships
    experiences = db.relationship(
        'Experience', 
        back_populates='user', 
        cascade='all, delete-orphan',
        lazy=True
    )
    
    memories = db.relationship(
        'Memory', 
        back_populates='user', 
        cascade='all, delete-orphan',
        lazy=True
    )
    
    notifications = db.relationship(
        'Notification', 
        back_populates='user', 
        cascade='all, delete-orphan',
        lazy=True
    )

    def set_password(self, password):
        """Hashes the plain password and stores it."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifies a plain password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email}>"
