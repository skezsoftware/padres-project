import pandas as pd
import numpy as np

class Database:
    def __init__(self):
        self.df = None
        self.load_data()

    def load_data(self):
        """Load and clean the CSV data"""
        try:
            self.df = pd.read_csv('padres_project_data.csv')
            self.clean_data()
            print("Data loaded successfully")
        except Exception as e:
            print(f"Error loading data: {e}")
            self.df = pd.DataFrame()

    def clean_data(self):
        """Clean the dataframe"""
        if self.df is not None:
            # Replace inf and -inf with None
            self.df = self.df.replace([np.inf, -np.inf], None)
            # Replace NaN with None
            self.df = self.df.replace({np.nan: None})

    def get_dataframe(self):
        """Return the dataframe"""
        return self.df

# Create a single instance of the database
db = Database()