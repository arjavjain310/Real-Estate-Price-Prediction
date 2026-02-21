# End-to-End Explanation: Real Estate Price Prediction

This document explains the full pipeline of the **Bangalore Real Estate Price Prediction** project—from raw data to a live web app and Streamlit deployment.

---

## 1. Overview

The project predicts **house prices in Bangalore (in ₹ Lakh)** using a machine learning model trained on a Kaggle dataset. Users provide:

- **Area** (square feet)
- **BHK** (bedrooms: 1–5)
- **Bathrooms** (1–5)
- **Location** (one of 240+ Bangalore areas)

The system returns an **estimated price in lakhs** (1 Lakh = ₹1,00,000).

---

## 2. Project Structure

```
Real-Estate-Price-Prediction/
├── bengaluru_house_prices.csv   # Raw Kaggle dataset
├── model/
│   ├── bhp.ipynb                # Jupyter notebook: data prep + model training
│   ├── columns.json             # Feature column names (copy used in artifacts)
│   └── banglore_home_prices_model.pickle  # Trained model (copy in artifacts)
├── artifacts/                   # Used at runtime by server/Streamlit
│   ├── columns.json             # Same structure as model/columns.json
│   └── banglore_home_prices_model.pickle  # Trained Linear Regression model
├── server/
│   ├── server.py                # Flask API + serves client
│   └── util.py                  # Load artifacts, predict price, get locations
├── client/
│   ├── app.html                 # Dashboard UI
│   ├── app.css                  # Styles
│   └── app.js                   # Calls API, shows result, recent estimates
├── streamlit_app.py             # Streamlit app for deployment
├── requirements.txt             # Python dependencies
└── README.md
```

---

## 3. Data and Model Pipeline (Notebook: `model/bhp.ipynb`)

### 3.1 Raw Data

- **Source:** `bengaluru_house_prices.csv` (Kaggle).
- **Columns (example):** `area_type`, `availability`, `location`, `size`, `society`, `total_sqft`, `bath`, `balcony`, `price`.
- **Target:** `price` (in Lakh).

### 3.2 Data Preprocessing

1. **Drop unused columns**  
   Removed: `area_type`, `society`, `balcony`, `availability`.

2. **Handle missing values**  
   Rows with nulls are dropped (`df3 = df2.dropna()`).

3. **Extract BHK from `size`**  
   `size` is like `"2 BHK"` or `"4 Bedroom"`. BHK is taken as the first token:  
   `df3['bhk'] = df3['size'].apply(lambda x: int(x.split(' ')[0]))`.

4. **Convert `total_sqft` to numeric**  
   - Some values are ranges (e.g. `"2100-2850"`).  
   - `convert_sqft_to_num()`: for ranges, use the midpoint; otherwise `float(x)`.

5. **Price per sq ft**  
   `price_per_sqft = price * 100000 / total_sqft` (price in Lakh → rupees, then per sq ft).

6. **Location cleanup**  
   - Strip whitespace from `location`.  
   - Locations with **≤10 data points** are grouped into **"other"** to reduce noise and dimensionality.

7. **Outlier removal**
   - **Price-per-sqft outliers (by location):** For each location, keep rows where `price_per_sqft` is within **one standard deviation** of the location mean (`remove_pps_outliers`).
   - **BHK-based outliers:** For each location, for each BHK value, remove rows where `price_per_sqft` is below the mean of the **previous** BHK (e.g. 2 BHK with price/sqft lower than typical 1 BHK in that location) (`remove_bhk_outliers`).

### 3.3 Feature Engineering

1. **Drop** `size`, `price_per_sqft` from the modeling dataframe.
2. **One-hot encode location:**  
   `pd.get_dummies(df10.location)` → one column per location (except **"other"**, dropped to avoid multicollinearity).
3. **Final feature matrix (X):**  
   - First 3 columns: `total_sqft`, `bath`, `bhk`.  
   - Rest: one binary column per location (1 if that location, else 0).  
   - **Target (y):** `price` (Lakh).

So each row is: `[total_sqft, bath, bhk, loc_1, loc_2, ...]` with exactly one location set to 1.

### 3.4 Model Training

- **Algorithm:** Scikit-learn **Linear Regression** (also compared with Lasso and Decision Tree via GridSearchCV; Linear Regression is used for the final model).
- **Train/validation:**  
  - `train_test_split(X, y, test_size=0.2)`.  
  - **Cross-validation:** `ShuffleSplit(n_splits=5, test_size=0.2)` for stability.
- **Hyperparameter tuning:** GridSearchCV over Linear Regression, Lasso, and Decision Tree; best model (typically Linear Regression) is kept.
- **Saved artifacts:**
  - **Model:** `banglore_home_prices_model.pickle` (serialized fitted model).
  - **Columns:** `columns.json` with `data_columns`: list of feature names in the same order as the training data (e.g. `["total_sqft","bath","bhk","1st block jayanagar", ...]`).

These files are copied into **`artifacts/`** so the server and Streamlit app can load them at runtime.

---

## 4. Runtime: How a Prediction Is Made

### 4.1 Loading Artifacts (`server/util.py`)

- **`load_saved_artifacts()`** (called once at startup):
  - Reads `artifacts/columns.json` → list of column names (`data_columns`).
  - Sets **locations** = `data_columns[3:]` (all columns after `total_sqft`, `bath`, `bhk`).
  - Builds a **location → column index** map (case-insensitive).
  - Loads **`artifacts/banglore_home_prices_model.pickle`** into a global model object.

### 4.2 Prediction Logic (`get_estimated_price(location, sqft, bhk, bath)`)

1. **Location match:**  
   - Normalize `location` (strip, lower).  
   - Look up in the location→index map.  
   - If not found, try partial match (user input contained in a known location name or vice versa).  
   - If still not found → use **fallback** (see below).

2. **Build feature vector:**  
   - Same length as `data_columns`.  
   - `x[0] = total_sqft`, `x[1] = bath`, `x[2] = bhk`.  
   - All location columns 0 except `x[loc_index] = 1`.

3. **Predict:**  
   `model.predict([x])[0]` → price in Lakh, rounded to 2 decimals.

4. **Fallback (unknown location):**  
   Simple heuristic: `base = sqft * 0.5`, adjust by (bath + bhk), convert to Lakh. Used when the location is not in the training set.

---

## 5. Web Applications

### 5.1 Flask App (Dashboard)

- **Entry:** `python server/server.py` (serves on port 5001 by default).
- **Responsibilities:**
  - **Load artifacts** once at startup via `util.load_saved_artifacts()`.
  - **API:**
    - `GET /get_location_names` → list of locations for the dropdown.
    - `POST /predict_home_price` → body: `{ total_sqft, location, bhk, bath }` → returns `{ estimated_price, status, input }`.
    - `GET /health` → health check.
  - **Static files:** Serves `client/app.html`, `app.css`, `app.js` from `/` and `/<filename>`.
- **Client (`client/`):**
  - User enters **area (sq ft)** (any positive number), selects **BHK**, **bathrooms**, **location**.
  - On “Estimate price”, JavaScript calls `POST /predict_home_price` and displays the result.
  - Recent estimates are stored in **sessionStorage** and shown in the dashboard.

### 5.2 Streamlit App (Deployment)

- **Entry:** `streamlit run streamlit_app.py`.
- **Flow:**
  - Adds project root to `sys.path`, imports `server.util`.
  - Uses `@st.cache_resource` to load artifacts once via `util.load_saved_artifacts()`.
  - Renders: location **selectbox**, **number_input** for area (sq ft), **selectbox** for BHK and bathrooms, “Estimate Price” button.
  - On submit: validates location and area, calls `util.get_estimated_price(...)`, shows **Estimated price: ₹ X Lakh** and property details.
- **Deployment:** The same repo can be deployed on **Streamlit Community Cloud** (e.g. [share.streamlit.io](https://share.streamlit.io)) by pointing to this repo and main file `streamlit_app.py`.

---

## 6. End-to-End Flow Summary

| Step | Where | What |
|------|--------|------|
| 1. Data | `bengaluru_house_prices.csv` | Raw Bangalore house listings (area, location, size, bath, price, etc.) |
| 2. Preprocessing | `model/bhp.ipynb` | Clean nulls, parse BHK and total_sqft, price_per_sqft, location grouping, outlier removal |
| 3. Features | `model/bhp.ipynb` | One-hot encoding for location; feature vector = [total_sqft, bath, bhk, loc_dummies] |
| 4. Training | `model/bhp.ipynb` | Linear Regression, train/test split, cross-validation, GridSearchCV; save model + columns |
| 5. Artifacts | `artifacts/` | `columns.json` + `banglore_home_prices_model.pickle` (used by server and Streamlit) |
| 6. Prediction | `server/util.py` | Load artifacts; map location → index; build vector; model.predict(); fallback for unknown location |
| 7. API | `server/server.py` | Flask: /get_location_names, /predict_home_price, serve client files |
| 8. Dashboard | `client/*` | HTML/CSS/JS: form → API call → show price + recent estimates |
| 9. Streamlit | `streamlit_app.py` | Same util; Streamlit UI for deployment (e.g. Streamlit Cloud) |

---

## 7. Tech Stack

- **Data & ML:** Pandas, NumPy, Scikit-learn (Linear Regression, GridSearchCV, train_test_split, cross_val_score).
- **Backend:** Flask, Flask-CORS.
- **Frontend (Flask):** HTML, CSS, JavaScript (jQuery for API calls).
- **Deployment UI:** Streamlit.
- **Persistence:** Model and column names in pickle + JSON; no database.

---

## 8. How to Run

- **Flask dashboard:**  
  `pip install -r requirements.txt` → `python server/server.py` → open http://localhost:5001  
- **Streamlit:**  
  `pip install -r requirements.txt` → `streamlit run streamlit_app.py` → open the URL shown (e.g. http://localhost:8501).  
- **Deploy on Streamlit Cloud:** Push repo to GitHub, connect at [share.streamlit.io](https://share.streamlit.io), set main file to `streamlit_app.py`, deploy.

This is the complete end-to-end explanation of the Real Estate Price Prediction project.
