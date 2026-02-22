# Real-Estate-Price-Prediction
This project is a machine learning web application that predicts house prices in Bangalore using a Kaggle dataset. The end-to-end pipeline covers everything from data preprocessing to model deployment, with an interactive UI for users to test predictions.

🔑 Key Features:

1.)Data Preprocessing:
Cleaned and transformed raw housing data
Handled missing values and categorical variables
Performed outlier detection to improve model accuracy

2.)Feature Engineering & Dimensionality Reduction:
Extracted meaningful features (e.g., BHK, square footage, location)
Reduced irrelevant dimensions to optimize performance

3.)Model Development:
Built and trained models using Scikit-learn
Implemented Linear Regression as the primary model
Evaluated with k-fold cross-validation
Tuned hyperparameters using Grid Search

4.)Web Application:
Deployed with Flask as the backend
Developed an interactive UI using HTML, CSS, and JavaScript
Users can input details like square footage, BHK, and location to get a predicted price in real-time


🚀 Tech Stack: 
Machine Learning: Python, Scikit-learn, Pandas, NumPy |
Backend: Flask |
Frontend: HTML, CSS, JavaScript

🎯 Outcome:
An end-to-end ML pipeline and deployed web application that predicts house prices in Bangalore with an easy-to-use interface.

---

## 🚀 Run locally

**Flask (dashboard):**
```bash
pip install -r requirements.txt
python server/server.py
```
Then open http://localhost:5001

**Streamlit:**
```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```
Then open the URL shown in the terminal (e.g. http://localhost:8501).

---

## ☁️ Deploy with Streamlit (anyone with link can open)

1. **Repo must be Public:** GitHub → `arjavjain310/Real-Estate-Price-Prediction` → Settings → change to **Public** if needed.
2. Go to **[share.streamlit.io](https://share.streamlit.io)** and sign in with **GitHub** (use the same account: **arjavjain310**).
3. Click **New app** → "Yup, I have an app."
4. Set **Repository:** `arjavjain310/Real-Estate-Price-Prediction`, **Branch:** `main`, **Main file path:** `streamlit_app.py`.
5. (Optional) Set a **Custom subdomain** (e.g. `real-estate-price-prediction`) for a shorter URL.
6. Click **Deploy**. When the build finishes, your app URL will be like `https://....streamlit.app` — **share that link; anyone with it can open the app** (no login).
7. If you see "Not found" or "You do not have access": use the `*.streamlit.app` URL from the deploy page (not `share.streamlit.io/errors/...`), and ensure you signed in with **github.com/arjavjain310**. See **DEPLOY.md** for full steps.

<img width="917" height="612" alt="Real Estate Price Prediction" src="https://github.com/user-attachments/assets/e9b25af8-0d06-4e55-b903-ea19b9542aeb" />
