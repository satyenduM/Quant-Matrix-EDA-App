"""
Data loader module for loading and caching the CSV dataset.
"""
import pandas as pd
from django.conf import settings
from functools import lru_cache


class DataLoader:
    _instance = None
    _data = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
        return cls._instance
    
    def load_data(self):
        """Load the CSV data into memory (singleton pattern for efficiency)"""
        if self._data is None:
            try:
                self._data = pd.read_csv(settings.DATASET_PATH)
                # Convert date column to datetime
                self._data['date'] = pd.to_datetime(self._data['date'], format='%d-%m-%Y', errors='coerce')
                # Ensure numeric columns are properly typed
                self._data['SalesValue'] = pd.to_numeric(self._data['SalesValue'], errors='coerce')
                self._data['Volume'] = pd.to_numeric(self._data['Volume'], errors='coerce')
                self._data['Year'] = pd.to_numeric(self._data['Year'], errors='coerce').astype('Int64')
                self._data['Month'] = pd.to_numeric(self._data['Month'], errors='coerce').astype('Int64')
            except Exception as e:
                print(f"Error loading data: {e}")
                self._data = pd.DataFrame()
        return self._data
    
    def get_data(self):
        """Get the loaded data"""
        if self._data is None:
            self.load_data()
        return self._data


# Global data loader instance
data_loader = DataLoader()

