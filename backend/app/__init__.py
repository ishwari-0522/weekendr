import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate

from app.config.config import config_by_name
from app.database.db import db
from app.routes import all_blueprints
from app.utils.logging import setup_logging

# Initialize Migrate globally
migrate = Migrate()

def create_app(config_name=None):
    """
    Application factory for Flask.
    """
    app = Flask(__name__)
    
    # Determine configuration type (default: development)
    if not config_name:
        config_name = os.environ.get('FLASK_ENV', 'development')
        
    app.config.from_object(config_by_name.get(config_name, config_by_name['development']))
    
    # Set up Python Logging
    setup_logging(app)
    
    # Enable Cross-Origin Resource Sharing (CORS)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize SQLAlchemy database instance
    db.init_app(app)
    
    # Initialize Flask-Migrate
    migrate.init_app(app, db)
    
    # Register API blueprints
    for blueprint, url_prefix in all_blueprints:
        app.register_blueprint(blueprint, url_prefix=url_prefix)
        app.logger.info("Registered blueprint %s at %s", blueprint.name, url_prefix)
        
    # Health check route
    @app.route('/health', methods=['GET'])
    def health_check():
        app.logger.debug("Health check API called")
        return jsonify({
            "status": "healthy",
            "environment": config_name,
            "database_configured": app.config['SQLALCHEMY_DATABASE_URI'] is not None
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        app.logger.warning("404 Error: Resource not found")
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        app.logger.error("500 Error: Internal Server Error - %s", str(error))
        return jsonify({"error": "Internal Server Error"}), 500
        
    return app
