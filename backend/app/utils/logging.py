import os
import logging
from logging.handlers import RotatingFileHandler

# Define logger names
api_logger = logging.getLogger("weekendr.api")
validation_logger = logging.getLogger("weekendr.validation")
sync_logger = logging.getLogger("weekendr.sync")
error_logger = logging.getLogger("weekendr.error")

def get_file_handler(log_file, level, formatter):
    """Helper to create a rotating file log handler."""
    handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    handler.setFormatter(formatter)
    handler.setLevel(level)
    return handler

def get_console_handler(level, formatter):
    """Helper to create a console logger stream handler."""
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    handler.setLevel(level)
    return handler

def setup_logging(app=None):
    """
    Configures separated Python logging systems.
    Outputs go to backend/logs/ for:
    - api.log (HTTP requests, details responses, cache stats)
    - validation.log (Data quality, duplicate detection, filters)
    - sync.log (Ingestion progress, imports, stats)
    - error.log (Flask exceptions, tracebacks, database failures)
    """
    # Define logs directory path (backend/logs/)
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    logs_dir = os.path.join(backend_dir, 'logs')
    
    # Ensure logs directory exists
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
        
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s [%(name)s] [%(filename)s:%(lineno)d]: %(message)s'
    )
    
    # Check debug mode
    is_debug = app.debug if app else True
    console_level = logging.DEBUG if is_debug else logging.INFO
    
    # Set levels
    api_logger.setLevel(logging.DEBUG if is_debug else logging.INFO)
    validation_logger.setLevel(logging.DEBUG if is_debug else logging.INFO)
    sync_logger.setLevel(logging.DEBUG if is_debug else logging.INFO)
    error_logger.setLevel(logging.WARNING) # Only warn/error in error log
    
    # Clear existing handlers
    api_logger.handlers.clear()
    validation_logger.handlers.clear()
    sync_logger.handlers.clear()
    error_logger.handlers.clear()
    
    # 1. API Logger
    api_handler = get_file_handler(os.path.join(logs_dir, 'api.log'), logging.DEBUG if is_debug else logging.INFO, formatter)
    api_logger.addHandler(api_handler)
    api_logger.addHandler(get_console_handler(console_level, formatter))
    
    # 2. Validation Logger
    val_handler = get_file_handler(os.path.join(logs_dir, 'validation.log'), logging.DEBUG if is_debug else logging.INFO, formatter)
    validation_logger.addHandler(val_handler)
    validation_logger.addHandler(get_console_handler(console_level, formatter))
    
    # 3. Sync Logger
    sync_handler = get_file_handler(os.path.join(logs_dir, 'sync.log'), logging.DEBUG if is_debug else logging.INFO, formatter)
    sync_logger.addHandler(sync_handler)
    sync_logger.addHandler(get_console_handler(console_level, formatter))
    
    # 4. Error Logger
    err_handler = get_file_handler(os.path.join(logs_dir, 'error.log'), logging.WARNING, formatter)
    error_logger.addHandler(err_handler)
    error_logger.addHandler(get_console_handler(logging.ERROR, formatter))
    
    # Propagate other Flask log messages to sync_logger
    if app:
        app.logger.handlers.clear()
        # Flask log outputs direct to sync log
        app.logger.addHandler(sync_handler)
        app.logger.addHandler(get_console_handler(console_level, formatter))
        app.logger.setLevel(logging.DEBUG if is_debug else logging.INFO)
        
    sync_logger.info("Separated logging configuration loaded successfully.")
