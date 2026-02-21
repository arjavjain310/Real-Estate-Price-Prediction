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

## ☁️ Deploy with Streamlit (Streamlit Community Cloud)

1. Push this repo to GitHub (already done if you cloned from GitHub).
2. Go to [share.streamlit.io](https://share.streamlit.io).
3. Sign in with GitHub and click **New app**.
4. Select your repo: `arjavjain310/Real-Estate-Price-Prediction`.
5. Set **Main file path** to: `streamlit_app.py`.
6. Click **Deploy**. Your app will be live at a URL like `https://your-app-name.streamlit.app`.

<img width="917" height="612" alt="Real Estate Price Prediction" src="https://github.com/user-attachments/assets/e9b25af8-0d06-4e55-b903-ea19b9542aeb" />
