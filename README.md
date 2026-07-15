# Read Quotes

A small Next.js quote reader backed by Supabase.

## Local setup

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Set the GoodQuotes2 project values in `.env.local`:

   ```env
   SUPABASE_URL=https://pbiobysefaglcaucobau.supabase.co
   SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   Use a publishable key from **Supabase → Project Settings → API Keys**. Do not
   use a secret or `service_role` key; the API route only needs public read
   access protected by Row Level Security.

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

## Vercel configuration

In **Vercel → Project → Settings → Environment Variables**, add these variables
to Production, Preview, and Development:

- `SUPABASE_URL` = `https://pbiobysefaglcaucobau.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` = the active GoodQuotes2 publishable key

Remove the obsolete `MONGO_URI` variable, then redeploy the latest deployment.
No `NEXT_PUBLIC_` variables or database secret keys are required.

## Database

The schema is stored in
`supabase/migrations/20260715000000_create_books_and_quotes.sql`. The `books`
and `quotes` tables expose read-only access to anonymous and authenticated users
through explicit grants and RLS policies.
