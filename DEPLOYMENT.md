# Form Builder — Deployment & Supabase Setup Guide

This document explains, step by step, how this project is deployed on **Vercel**
and how it is connected to **Supabase** for storing projects and forms.
Follow it from top to bottom when setting up from scratch.

---

## 1. How the app works (overview)

```
Browser (React app)
   |
   |-- reads/writes projects, forms, master forms
   v
Supabase (Postgres database, free tier)
   tables: projects, forms, master_forms

Hosting: Vercel (auto-deploys on every push to the `main` branch of GitHub)
```

- All data is stored in **Supabase**, not in the browser's localStorage.
- Local dev (`npm run dev`) and the live site both talk to the **same database**,
  so they always show the same data.

Key files in this repo:

| File | Purpose |
|---|---|
| `supabase-schema.sql` | SQL to create the database tables (run once in Supabase) |
| `.env.local` | Supabase URL + key for local development (NOT committed to git) |
| `src/shared/services/supabaseClient.js` | Creates the Supabase connection |
| `src/shared/services/supabaseCollection.js` | Generic load/save logic (upsert + delete, debounced) |
| `src/shared/services/projectService.js` | Projects storage (table: `projects`) |
| `src/shared/services/formService.js` | Forms storage (table: `forms`) |
| `src/shared/services/masterFormService.js` | Master forms storage (table: `master_forms`) |

---

## 2. Supabase setup (database)

### 2.1 Create account and project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Create an **organization** (Type: Personal, Plan: Free).
3. Click **New Project** and fill:
   - **Project name:** e.g. `form-builder`
   - **Database password:** click "Generate a password" and **save it somewhere safe**
   - **Region:** Mumbai `ap-south-1` (closest to India)
   - **Security:** keep defaults ("Enable Data API" must stay checked)
4. Click **Create new project** and wait 1–2 minutes.

### 2.2 Create the tables

1. In the Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Copy the full contents of `supabase-schema.sql` (in this repo root) and paste it.
4. Click **Run**. You should see "Success. No rows returned".

This creates 3 tables (`projects`, `forms`, `master_forms`), each with:
`id` (text), `data` (jsonb — the full object), `created_at`, `updated_at`.
It also enables Row Level Security with an allow-all policy (the app has no login).

### 2.3 Get the connection keys

1. Go to **Project Settings → API Keys**.
2. Copy the **Publishable key** (starts with `sb_publishable_...`).
   - This key is SAFE to use in the browser.
   - NEVER use the **Secret key** (`sb_secret_...`) in this app.
3. Go to **Settings → Data API** and copy the **Project URL**
   (looks like `https://xxxx.supabase.co` — do NOT include `/rest/v1/`).

---

## 3. Local development setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/jayakrishnakjk/Form-Builder.git
   cd Form-Builder
   npm install
   ```

2. Create a file named `.env.local` in the project root:

   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_YOUR_KEY_HERE
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` — projects and forms load from Supabase.

**Important:** if you change `.env.local`, restart the dev server
(env variables are read only at startup).

---

## 4. Vercel deployment (hosting)

### 4.1 First-time setup

1. Push the code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and sign up/login (free Hobby plan).
3. Click **Add New → Project** and **import** the GitHub repo.
4. Framework preset: **Vite** (auto-detected). Build settings need no changes.
5. Click **Deploy**.

### 4.2 Add the Supabase environment variables

The deployed site needs the same two variables:

1. Vercel dashboard → your project → **Settings → Environment Variables**
   (if you only see "Environments", click the **Production** row —
   the Environment Variables section is inside it).
2. Click **Add Environment Variable** and add:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_YOUR_KEY_HERE` |

3. Adding them to **Production** is enough
   (local dev uses `.env.local`, not Vercel).
4. **Redeploy** after adding variables — they are baked in at build time:
   - Deployments tab → latest deployment → **⋯ → Redeploy**, OR
   - simply push a new commit (see below).

### 4.3 Deploying updates (every time)

Vercel auto-deploys on every push to `main`:

```bash
git add .
git commit -m "your change description"
git push origin main
```

Then check the **Deployments** tab in Vercel — the build takes 1–2 minutes
and goes live automatically.

---

## 5. Verifying everything works

1. Open the live site (e.g. `https://form-builder-two-orpin.vercel.app`).
2. Create a test project → open Supabase dashboard → **Table Editor** →
   `projects` table → the new row should appear within a second.
3. Open the site in a different browser/incognito — the same data should show.
4. Check browser console (F12) — there should be no red Supabase errors.
   (A `favicon.ico 404` error is harmless — that's just the missing tab icon.)

---

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| "Supabase is not configured" in console | `.env.local` missing/wrong (local) or env vars missing in Vercel (live). Restart dev server / redeploy after fixing. |
| Data not saving | Check the tables exist (run `supabase-schema.sql` again — it is safe to re-run). |
| Live site shows old code | Check Deployments tab — push may have failed, or build errored. |
| Changed env vars but no effect | Env vars are baked at build time — restart dev server locally, redeploy on Vercel. |
| 401/403 errors from Supabase | Wrong key, or RLS policies missing — re-run `supabase-schema.sql`. |

---

## 7. Embed snippets (bonus)

Forms can be embedded into any external website via **Builder → Embed Snippet**.
The snippet only contains the form ID — the embed page loads the form
definition live from Supabase, so embedded forms always show the latest
saved version automatically. No need to re-copy the snippet after editing a form.
