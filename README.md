# Kairox Website

Marketing website for Kairox, a movement-powered social media blocking app.

## Real waitlist backend

The website now includes:

- `POST /api/waitlist` to validate and store email signups
- duplicate protection
- email syntax and mail-domain (MX record) validation
- a private admin dashboard at `/admin`
- CSV export, search, signup totals, and deletion

## Complete the one-time setup

### 1. Create a free Supabase project

Create a project at Supabase, then open **SQL Editor**, paste the contents of `supabase-setup.sql`, and run it.

### 2. Add Vercel environment variables

In the Kairox Vercel project, open **Settings → Environment Variables** and add:

- `SUPABASE_URL` — Supabase **Project Settings → API → Project URL**
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase **Project Settings → API → service_role key**
- `ADMIN_PASSWORD` — a long private password only Sofia knows

Apply each variable to Production, Preview, and Development, then redeploy the project.

**Never put the service-role key in HTML, browser JavaScript, screenshots, or chat.** It is only used inside the serverless API functions.

### 3. Use the dashboard

After redeployment, visit:

`https://kairox-website-one.vercel.app/admin`

Enter the value configured as `ADMIN_PASSWORD`.

## What “valid email” means

The form rejects malformed addresses, common disposable domains, and domains without email (MX) records. It cannot prove that a specific mailbox exists without sending a confirmation email. Double opt-in email verification can be added later with a transactional email provider such as Resend.
