import logging
import os
from pathlib import Path

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

def setup_logger(name, log_file="app.log", level=logging.INFO):
    """Function to setup as many loggers as you want"""
    
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s')

    # File handler
    file_handler = logging.FileHandler(LOG_DIR / log_file)
    file_handler.setFormatter(formatter)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid duplicate handlers if setup_logger is called multiple times
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger

# Default logger
logger = setup_logger("research_agent")
