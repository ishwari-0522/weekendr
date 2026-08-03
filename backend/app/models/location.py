from app.database.db import db
from app.models.base import BaseModel

class City(BaseModel):
    """
    Model representing a city (e.g. Pune, Mumbai).
    """
    __tablename__ = 'cities'
    
    name = db.Column(db.String(100), unique=True, nullable=False)
    state = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    
    # Relationships
    # One City has many Areas.
    areas = db.relationship(
        'Area', 
        back_populates='city', 
        cascade='all, delete-orphan',
        lazy=True
    )
    
    # One City has many Experiences.
    experiences = db.relationship(
        'Experience',
        back_populates='city',
        lazy=True
    )

    def __repr__(self):
        return f"<City {self.name}>"


class Area(BaseModel):
    """
    Model representing specific areas or neighborhoods within a city (e.g. Baner, Bandra).
    """
    __tablename__ = 'areas'
    
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    # Relationships
    city = db.relationship('City', back_populates='areas')
    
    # One Area has many Places.
    places = db.relationship(
        'Place', 
        back_populates='area', 
        cascade='all, delete-orphan',
        lazy=True
    )
    
    # One Area can associate with many Experiences.
    experiences = db.relationship(
        'Experience',
        back_populates='area',
        lazy=True
    )

    def __repr__(self):
        return f"<Area {self.name} in City_ID {self.city_id}>"
