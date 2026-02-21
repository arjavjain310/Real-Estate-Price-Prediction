"""
Real Estate Price Prediction - Streamlit app for deployment.
Run: streamlit run streamlit_app.py
"""
import sys
import os

# Ensure project root is on path when running from repo root (e.g. Streamlit Cloud)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st
from server import util

st.set_page_config(
    page_title="Real Estate Price Prediction",
    page_icon="🏠",
    layout="centered",
)

# Load model artifacts once
@st.cache_resource
def load_model():
    return util.load_saved_artifacts()

if not load_model():
    st.error("Failed to load model artifacts. Check that the `artifacts` folder exists with columns.json and banglore_home_prices_model.pickle.")
    st.stop()

locations = util.get_location_names()
locations_sorted = sorted(locations) if locations else []

st.title("🏠 Real Estate Price Prediction")
st.caption("Bangalore · Estimate property value in lakhs (₹)")

st.markdown("---")

col1, col2 = st.columns(2)

with col1:
    location = st.selectbox(
        "Location",
        options=locations_sorted,
        index=0 if locations_sorted else None,
        placeholder="Select area",
    )
    total_sqft = st.number_input(
        "Area (sq ft)",
        min_value=1,
        max_value=99999999,
        value=None,
        step=1,
        placeholder="Enter area",
    )

with col2:
    bhk = st.selectbox("BHK", options=[1, 2, 3, 4, 5], index=1)
    bath = st.selectbox("Bathrooms", options=[1, 2, 3, 4, 5], index=1)

if st.button("Estimate Price", type="primary", use_container_width=True):
    if not location:
        st.warning("Please select a location.")
    elif total_sqft is None or total_sqft < 1:
        st.warning("Please enter area (sq ft) — any positive number.")
    else:
        with st.spinner("Calculating..."):
            price = util.get_estimated_price(location, total_sqft, bhk, bath)
        st.success(f"**Estimated price: ₹ {price} Lakh**")
        st.info(f"{total_sqft} sq ft · {bhk} BHK · {bath} bath · {location}")

st.markdown("---")
st.caption("For reference only · Trained on Bangalore housing data")
