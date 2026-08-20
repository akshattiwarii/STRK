# 🌐 Complete 100% Free Cloud Hosting & Backend Deployment Guide

This guide enables you to host the **STRK ("Me vs Me")** platform entirely on **free enterprise cloud data centers** (Supabase PostgreSQL + Netlify Global Edge Network). 

**Zero laptop dependency — your users never crash their devices, and data is stored securely in the cloud.**

---

## 🏗️ Cloud Architecture Overview (100% Free Tier)

| Service | Cloud Provider | Free Tier Allowance | Purpose |
|---|---|---|---|
| **Frontend & API Server** | **Netlify** (Global Edge CDN) | 100 GB Bandwidth / mo, Unlimited Sites | Hosts website globally with instant SSL & DDoS shield |
| **Cloud Database (PostgreSQL)** | **Supabase** (AWS Data Centers) | 500 MB DB, 50,000 Monthly Users | Stores all accounts, daily logs, goals, and badges |

---

## ⚡ Step 1: Create Free Supabase Cloud Database (1 Minute)

1. Go to **[supabase.com](https://supabase.com)** and sign in with GitHub or Email (Free).
2. Click **"New Project"**:
   - **Name**: `strk-cloud-backend`
   - **Database Password**: Choose a strong password.
   - **Region**: Choose the region closest to you (e.g., *Central India / Mumbai*, *Singapore*, or *US East*).
3. Once the database is provisioned, click **"SQL Editor"** on the left menu.
4. Click **"New Query"**, copy the entire contents of [`supabase/schema.sql`](file:///c:/Users/Akshat/Documents/Consistency_project/supabase/schema.sql) from this project, paste it into the editor, and click **"Run"** (▶️).
   - *This creates all 5 tables (`profiles`, `daily_logs`, `goals`, `user_badges`, `weekly_reflections`) and high-speed indexes instantly.*
5. Go to **Project Settings** (gear icon) → **API**:
   - Copy **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - Copy **Project API Key (anon/public)** (e.g. `eyJhbGciOi...`)

---

## 🚀 Step 2: Deploy to Netlify (Free Global Cloud CDN)

### Option A: 1-Click GitHub Deploy (Recommended)

1. **Push your code to your GitHub**:
   ```bash
   git add .
   git commit -m "feat: 100% cloud backend with Supabase and Netlify"
   git push origin main
   ```
2. Open **[app.netlify.com](https://app.netlify.com)** and sign in.
3. Click **"Add new site"** → **"Import an existing project"** → **GitHub**.
4. Select your `strk-consistency` repository.
5. In **"Environment variables"**, add the two keys from Step 1:
   ```env
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```
6. Click **"Deploy site"**! Netlify will build and deploy the site to a live URL (e.g. `https://strk-me-vs-me.netlify.app`) with free HTTPS.

---

### Option B: Deploy Directly via Terminal (Netlify CLI)

If you don't want to use GitHub, you can deploy straight from your computer:

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to your free Netlify account
netlify login

# 3. Deploy to production
netlify deploy --prod
```
*When prompted for the publish directory, select `.next`.*

---

## 🛡️ Cloud Privacy & Data Isolation Guarantees

* **Cloud Hosted**: No data is locked to a user's physical laptop.
* **Auto-Scaling Cloud**: Supabase handles connection pooling, PostgreSQL backups, and real-time syncing automatically.
* **Global Edge CDN**: Web pages are cached and served from edge servers closest to each visitor for sub-50ms latency.
