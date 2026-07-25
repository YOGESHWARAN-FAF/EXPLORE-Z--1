# 🚀 Deploying AI Smart Tourist Planner to Vercel

This repository is pre-configured with `vercel.json` for one-click deployment of both the **FastAPI Backend** and the **Vite React Frontend** under a single Vercel domain.

---

## 🛠️ Step-by-Step Deployment Instructions

### Option 1: Vercel Dashboard (Recommended)

1. Push this repository to GitHub.
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" -> "Project"**.
3. Import your GitHub repository (`EXPLORE-Z--1`).
4. Keep the **Root Directory** as `./` (Root).
5. Expand **Environment Variables** and add the following keys:

#### Required Environment Variables:

| Variable Name | Description / Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key (`gsk_...`) |
| `GNEWS_API_KEY` | Your GNews API key |
| `FIREBASE_DATABASE_URL` | `https://tourism-e45c9-default-rtdb.asia-southeast1.firebasedatabase.app` |
| `FIREBASE_CREDENTIALS_JSON` | Firebase Admin SDK JSON string |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCDKMSS8rO1CHBUl-m-fL02mE6H3ng2Jd4` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `tourism-e45c9.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `tourism-e45c9` |

6. Click **"Deploy"**. Vercel will automatically build the Vite frontend and provision the FastAPI serverless functions.

---

### Option 2: Vercel CLI

If you have the `vercel` CLI installed:

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy to Preview
vercel

# 3. Deploy to Production
vercel --prod
```

---

## 🌐 Architecture Overview

- **FastAPI API**: Serverless function entrypoint at `api/index.py`, served under `/api/v1/...`.
- **Vite React Frontend**: Static build from `frontend/package.json`, served under `/`.
- **Client SPA Routing**: Handled seamlessly by Vercel filesystem routing & fallback to `index.html`.
