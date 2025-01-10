import pandas as pd
import numpy as np
import logging
from .config import get_settings

settings = get_settings()

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.df = None
        self.load_data()

    def load_data(self):
        """Load and clean the CSV data"""
        try:
            self.df = pd.read_csv(settings.DATABASE_FILE)
            self.clean_data()
            logger.info("Data loaded successfully")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            self.df = pd.DataFrame()

    def clean_data(self):
        """Clean the dataframe"""
        if self.df is not None:
            # Replace inf and -inf with None
            self.df = self.df.replace([np.inf, -np.inf], None)
            # Replace NaN with None
            self.df = self.df.replace({np.nan: None})
            logger.debug("Data cleaning completed")

    def get_dataframe(self):
        """Return the dataframe"""
        return self.df

db = Database()