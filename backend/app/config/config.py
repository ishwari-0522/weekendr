import os
from dotenv import load_dotenv

# Load environment variables from .env file (which resides in the workspace root)
# By default, load_dotenv() searches parent directories for .env files
load_dotenv()

class Config:
    """Base config."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_secret_key_change_me')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google API Keys
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
    GOOGLE_PLACES_API_KEY = os.environ.get('GOOGLE_PLACES_API_KEY')
    
    # OpenAI API Key
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # Cloudinary URL
    CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL')

class DevelopmentConfig(Config):
    FLASK_ENV = 'development'
    DEBUG = True
    # Default to sqlite if PostgreSQL URL is not provided, to allow local fallback/testing
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'postgresql://postgres:postgres@localhost:5432/weekendr'
    )

class ProductionConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# Export configurations dict
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}
