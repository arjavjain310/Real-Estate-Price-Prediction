# Deploy Real Estate Price Prediction (Streamlit) — Anyone With Link Can Open

Follow these steps so your app is **public** and **anyone with the link** can open it.

---

## 1. Make sure the GitHub repo is **public**

1. Go to **https://github.com/arjavjain310/Real-Estate-Price-Prediction**
2. Click **Settings** (repo settings, not your profile).
3. Scroll to **Danger Zone** (or **General** → **Visibility**).
4. If the repo is **Private**, change it to **Public**.
5. Streamlit Community Cloud can only deploy from repos it can read; **private repos** only work if your Streamlit account is linked to the same GitHub account that owns the repo.

---

## 2. Sign in to Streamlit with the **same** GitHub account

1. Go to **https://share.streamlit.io**
2. Click **Sign in** and choose **Continue with GitHub**.
3. Sign in with the GitHub account that **owns** the repo: **arjavjain310** (same as in the error: `github.com/arjavjain310`).
4. If you use a different GitHub account, you will get “You do not have access to this app or it does not exist” when opening the app URL.

---

## 3. Create and deploy the app

1. On **https://share.streamlit.io**, click **“New app”** (or **“Create app”**).
2. When asked “Do you already have an app?”, choose **“Yup, I have an app.”**
3. Fill in:
   - **Repository:** `arjavjain310/Real-Estate-Price-Prediction`
   - **Branch:** `main`
   - **Main file path:** `streamlit_app.py`
4. (Optional) In **“App URL”** / **“Custom subdomain”**, enter something like:  
   `real-estate-price-prediction`  
   so your link is easier to share (e.g. `https://real-estate-price-prediction.streamlit.app`).
5. Click **“Deploy”** (or **“Deploy!”**).
6. Wait for the build to finish. If the build fails, check the logs on the same page.

---

## 4. Get the public link

- After a successful deploy, you’ll see a URL like:
  - `https://arjavjain310-real-estate-price-prediction-streamlit-app-xxxxx.streamlit.app`  
  or, if you set a custom subdomain:
  - `https://real-estate-price-prediction.streamlit.app`
- **This link is public:** anyone with the link can open the app (no login required).
- Do **not** use `https://share.streamlit.io/...` or `.../errors/not_found` — the real app lives on `*.streamlit.app`.

---

## 5. If you still see “Not found” or “You do not have access”

- **Wrong URL:** Use the `*.streamlit.app` URL from the deploy page, not `share.streamlit.io/errors/not_found`.
- **Wrong GitHub account:** You must be signed in to Streamlit with **github.com/arjavjain310** (the owner of the repo).
- **App not deployed:** Create the app again as in step 3 and wait for the build to succeed.
- **Repo private:** Make the repo **Public** (step 1), or ensure your Streamlit account is connected to the GitHub account that owns the private repo.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Repo **Public**: `arjavjain310/Real-Estate-Price-Prediction` |
| 2 | Sign in at **share.streamlit.io** with **GitHub: arjavjain310** |
| 3 | New app → Repo: `arjavjain310/Real-Estate-Price-Prediction`, Branch: `main`, Main file: `streamlit_app.py` → Deploy |
| 4 | Use the **`https://....streamlit.app`** link — that’s the one anyone with the link can open |
