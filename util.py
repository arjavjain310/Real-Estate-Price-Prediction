import json
import pickle
import numpy as np
from pathlib import Path
import warnings

# Suppress sklearn warnings
warnings.filterwarnings("ignore", message="X does not have valid feature names*")

__locations = None
__data_columns = None
__model = None
__loc_name_to_index = None


def get_estimated_price(location, sqft, bhk, bath):
    global __data_columns, __model, __loc_name_to_index
    try:
        if __data_columns is None or __model is None:
            raise Exception("Artifacts not loaded. Call load_saved_artifacts() before predictions.")

        # Case-insensitive location matching with exact match first
        location_lower = location.strip().lower()
        loc_index = __loc_name_to_index.get(location_lower, -1)

        # If exact match not found, try partial matching
        if loc_index == -1:
            for loc_name, idx in __loc_name_to_index.items():
                if location_lower in loc_name or loc_name in location_lower:
                    loc_index = idx
                    print(f"Partial match found: {location} -> {loc_name}")
                    break

        # If location still not found, use fallback method
        if loc_index == -1:
            print(f"Location '{location}' not found in dataset, using fallback pricing")
            return estimate_price_without_location(sqft, bath, bhk)

        x = np.zeros(len(__data_columns))
        x[0] = float(sqft)
        x[1] = int(bath)
        x[2] = int(bhk)
        if loc_index >= 0:
            x[loc_index] = 1

        prediction = __model.predict([x])[0]
        return round(prediction, 2)
    except Exception as e:
        print(f"Error in price estimation: {e}")
        return estimate_price_without_location(sqft, bath, bhk)


def estimate_price_without_location(sqft, bath, bhk):
    """Fallback method when location is not found"""
    # Simple heuristic based on square footage and rooms
    base_price = float(sqft) * 0.5  # ₹0.5 per sqft as base
    room_factor = (int(bath) + int(bhk)) * 0.1  # 10% increase per room
    return round(base_price * (1 + room_factor) / 100000, 2)  # Convert to lakhs


def get_location_names():
    return __locations if __locations else []


def load_saved_artifacts():
    global __data_columns, __locations, __model, __loc_name_to_index

    try:
        # Use absolute path to avoid issues
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        artifacts_dir = os.path.join(base_dir, "artifacts")

        columns_path = os.path.join(artifacts_dir, "columns.json")
        model_path = os.path.join(artifacts_dir, "banglore_home_prices_model.pickle")

        print("Looking for artifacts in:", artifacts_dir)

        # Load columns data
        with open(columns_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            __data_columns = data["data_columns"]
            __locations = __data_columns[3:]  # Skip sqft, bath, bhk

        # Create location to index mapping (case-insensitive)
        __loc_name_to_index = {}
        for idx, col in enumerate(__data_columns):
            __loc_name_to_index[col.lower()] = idx

        # Load model
        with open(model_path, "rb") as f:
            __model = pickle.load(f)

        print(f"Loaded artifacts: {len(__locations)} locations and model successfully.")
        return True
    except Exception as e:
        print(f"Error loading artifacts: {e}")
        return False


if __name__ == "__main__":
    load_saved_artifacts()
    print("Some locations:", get_location_names()[:10])
    print("Sample prediction:", get_estimated_price("1st phase jp nagar", 1000, 3, 3))
    print("Sample prediction:", get_estimated_price("JP Nagar", 1000, 3, 3))
    print("Sample prediction:", get_estimated_price("btm", 1000, 2, 2))