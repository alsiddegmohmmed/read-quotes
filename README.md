# Read Quotes

A small Next.js quote reader backed by Supabase.

## Reading room features

- Search quote text, book titles, and authors without repeatedly downloading the full library.
- Filter by book, saved favorites, or the 50 most recently viewed passages.
- Move backward and forward through the current session, or choose a new random passage.
- Use Left Arrow for Previous, Right Arrow for Next, and `R` for Random when focus is outside a text field.
- Copy, share, or export a passage image containing the quote, book title, and author.

Favorites and recently viewed passages are stored only in the current browser's
`localStorage`. GoodQuotes2 has no private user account configured, so this keeps
the public reader read-only, avoids unsafe anonymous database write policies,
and leaves the persistence hooks isolated for a future authenticated backend.

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

## Quotes API

The read-only API supports these requests:

```text
GET /api/quotes
GET /api/quotes?book=<title>
GET /api/quotes?search=<text>
GET /api/quotes?book=<title>&search=<text>
GET /api/quotes?type=books
```

Search is case-insensitive across quote content, book title, and author. Query
values are validated, and wildcard characters are treated as literal text. The
books response includes `id`, `bookTitle`, `author`, and `quoteCount`.
