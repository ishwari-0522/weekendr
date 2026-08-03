from app.database.db import db
from app.models.base import BaseModel

# Association Table for Many-to-Many relationship between Place and Tag
place_tag = db.Table(
    'place_tag',
    db.Column('place_id', db.Integer, db.ForeignKey('places.id', ondelete='CASCADE'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)


class Category(BaseModel):
    """
    Model representing place categories (e.g. Cafe, Restaurant, Nature).
    """
    __tablename__ = 'categories'
    
    name = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(100), nullable=True) # Icon string for frontend mapping
    
    # Relationships
    places = db.relationship(
        'Place', 
        back_populates='category',
        lazy=True
    )

    def __repr__(self):
        return f"<Category {self.name}>"


class Tag(BaseModel):
    """
    Model representing tags for search filters and personalization (e.g. Pet Friendly, Date Night).
    """
    __tablename__ = 'tags'
    
    name = db.Column(db.String(100), unique=True, nullable=False)
    
    # Relationships
    places = db.relationship(
        'Place', 
        secondary=place_tag, 
        back_populates='tags',
        lazy=True
    )

    def __repr__(self):
        return f"<Tag {self.name}>"


class Place(BaseModel):
    """
    Core Place model representing a venue. Contains core and WEEKENDR metadata.
    Separates Google details and AI metadata into separate tables.
    """
    __tablename__ = 'places'
    
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id', ondelete='CASCADE'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='RESTRICT'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True) # WEEKENDR editorial description
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    average_cost = db.Column(db.Numeric(10, 2), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Relationships
    area = db.relationship('Area', back_populates='places')
    category = db.relationship('Category', back_populates='places')
    
    # Many Places can have many Tags.
    tags = db.relationship(
        'Tag', 
        secondary=place_tag, 
        back_populates='places',
        lazy='subquery'
    )
    
    # One-to-One Google details
    google_detail = db.relationship(
        'PlaceGoogleDetail', 
        back_populates='place', 
        uselist=False, 
        cascade='all, delete-orphan'
    )
    
    # One-to-One AI Metadata details
    ai_metadata = db.relationship(
        'PlaceAiMetadata', 
        back_populates='place', 
        uselist=False, 
        cascade='all, delete-orphan'
    )
    
    # One-to-Many Images
    images = db.relationship(
        'PlaceImage', 
        back_populates='place', 
        cascade='all, delete-orphan',
        lazy=True
    )
    
    # Connects places to Experiences via the ExperiencePlace association model.
    experience_places = db.relationship(
        'ExperiencePlace',
        back_populates='place',
        cascade='all, delete-orphan',
        lazy=True
    )

    def __repr__(self):
        return f"<Place {self.name}>"


class PlaceGoogleDetail(db.Model):
    """
    Model storing Google specific attributes to separate it from core WEEKENDR data.
    """
    __tablename__ = 'place_google_details'
    
    place_id = db.Column(db.Integer, db.ForeignKey('places.id', ondelete='CASCADE'), primary_key=True)
    google_place_id = db.Column(db.String(255), unique=True, index=True, nullable=False)
    google_maps_url = db.Column(db.String(512), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    price_level = db.Column(db.Integer, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    review_count = db.Column(db.Integer, default=0, nullable=False)
    opening_hours = db.Column(db.JSON, nullable=True)
    popular_menu = db.Column(db.JSON, nullable=True)
    business_status = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now(), nullable=False)
    
    # Relationships
    place = db.relationship('Place', back_populates='google_detail')

    def __repr__(self):
        return f"<PlaceGoogleDetail for Place_ID {self.place_id}>"


class PlaceAiMetadata(db.Model):
    """
    Model holding future AI enrichment fields to prepare schema for AI features.
    """
    __tablename__ = 'place_ai_metadata'
    
    place_id = db.Column(db.Integer, db.ForeignKey('places.id', ondelete='CASCADE'), primary_key=True)
    vibe_summary = db.Column(db.Text, nullable=True)
    ai_description = db.Column(db.Text, nullable=True)
    suggested_tags = db.Column(db.JSON, nullable=True)
    best_time_to_visit = db.Column(db.String(255), nullable=True)
    is_enriched = db.Column(db.Boolean, default=False, nullable=False)
    enriched_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now(), nullable=False)
    
    # Relationships
    place = db.relationship('Place', back_populates='ai_metadata')

    def __repr__(self):
        return f"<PlaceAiMetadata for Place_ID {self.place_id}>"


class PlaceImage(BaseModel):
    """
    Model supporting multiple images per place, including Google Photo attributions.
    """
    __tablename__ = 'place_images'
    
    place_id = db.Column(db.Integer, db.ForeignKey('places.id', ondelete='CASCADE'), nullable=False)
    image_url = db.Column(db.String(512), nullable=False)
    attribution = db.Column(db.Text, nullable=True)
    width = db.Column(db.Integer, nullable=True)
    height = db.Column(db.Integer, nullable=True)
    
    # Relationships
    place = db.relationship('Place', back_populates='images')

    def __repr__(self):
        return f"<PlaceImage {self.id} for Place_ID {self.place_id}>"


class RawGooglePlace(db.Model):
    """
    Model caching raw JSON responses from Google APIs to prevent unnecessary/costly API calls.
    """
    __tablename__ = 'raw_google_places'
    
    google_place_id = db.Column(db.String(255), primary_key=True)
    raw_response = db.Column(db.JSON, nullable=False)
    
    created_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now(), nullable=False)

    def __repr__(self):
        return f"<RawGooglePlace {self.google_place_id}>"
