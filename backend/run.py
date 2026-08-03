import os
from app import create_app

# Create Flask application instance
config_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    # Retrieve port from env or default to 5000
    port = int(os.environ.get('PORT', 5000))
    debug = app.config.get('DEBUG', True)
    
    app.logger.info("Starting WEEKENDR Flask backend on port %d", port)
    app.run(host='0.0.0.0', port=port, debug=debug)
