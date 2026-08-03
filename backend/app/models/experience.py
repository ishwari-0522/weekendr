from app.database.db import db
from app.models.base import BaseModel

class ExperienceTemplate(BaseModel):
    """
    Model representing reusable experience categories / templates (e.g. Date Night, Game On).
    """
    __tablename__ = 'experience_templates'
    
    title = db.Column(db.String(150), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    default_duration = db.Column(db.Integer, nullable=True) # Duration in minutes
    default_budget = db.Column(db.Numeric(10, 2), nullable=True)
    
    # Relationships
    experiences = db.relationship(
        'Experience', 
        back_populates='template',
        cascade='save-update', # Do not delete experiences on template removal, instead set template_id to null
        lazy=True
    )

    def __repr__(self):
        return f"<ExperienceTemplate {self.title}>"


class ExperiencePlace(db.Model):
    """
    Association model mapping Places to Experiences with order sequence and visit timing details.
    """
    __tablename__ = 'experience_places'
    
    experience_id = db.Column(db.Integer, db.ForeignKey('experiences.id', ondelete='CASCADE'), primary_key=True)
    place_id = db.Column(db.Integer, db.ForeignKey('places.id', ondelete='CASCADE'), primary_key=True)
    sequence = db.Column(db.Integer, nullable=False) # Stop order in itinerary (1, 2, 3, etc.)
    arrival_time = db.Column(db.DateTime, nullable=True)
    departure_time = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    # Relationships
    experience = db.relationship('Experience', back_populates='experience_places')
    place = db.relationship('Place', back_populates='experience_places')

    def __repr__(self):
        return f"<ExperiencePlace Exp_ID {self.experience_id}, Place_ID {self.place_id}, Stop {self.sequence}>"


class Experience(BaseModel):
    """
    Model representing custom itinerary experiences created by or for a user.
    """
    __tablename__ = 'experiences'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('experience_templates.id', ondelete='SET NULL'), nullable=True)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id', ondelete='RESTRICT'), nullable=False)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id', ondelete='SET NULL'), nullable=True) # Optional, can span whole city
    
    budget = db.Column(db.Numeric(10, 2), nullable=True)
    duration = db.Column(db.Integer, nullable=True) # Planned duration in minutes
    vibe = db.Column(db.String(100), nullable=True) # Vibe string matching tags
    summary = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='draft', nullable=False) # draft, active, completed, cancelled
    
    # Relationships
    user = db.relationship('User', back_populates='experiences')
    template = db.relationship('ExperienceTemplate', back_populates='experiences')
    city = db.relationship('City', back_populates='experiences')
    area = db.relationship('Area', back_populates='experiences')
    
    # One Experience contains many ExperiencePlaces (stops in itinerary)
    experience_places = db.relationship(
        'ExperiencePlace',
        back_populates='experience',
        cascade='all, delete-orphan',
        order_by='ExperiencePlace.sequence',
        lazy=True
    )
    
    # One Experience can become one Memory.
    memory = db.relationship(
        'Memory',
        back_populates='experience',
        uselist=False, # Enforce one-to-one relationship
        cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f"<Experience {self.id} for User_ID {self.user_id} - Vibe: {self.vibe}>"
