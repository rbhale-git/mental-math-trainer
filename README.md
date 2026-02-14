# MentalMath — Mental Math Training App

Practice and improve your mental arithmetic skills with timed problems across 5 operations and 4 difficulty levels.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (Auth + PostgreSQL)

## Prerequisites

- [Node.js](https://nodejs.org/) 20.9 or later
- A free [Supabase](https://supabase.com/) account

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd mental-math
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project** and give it a name
3. Wait for the project to finish provisioning

### 3. Run the database migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` and paste it
4. Click **Run** — this creates the tables, indexes, and security policies

### 4. Configure environment variables

1. In your Supabase dashboard, go to **Settings → API**
2. Copy the **Project URL** and **anon public** key
3. Edit the `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Configure Supabase Auth (optional but recommended)

1. In Supabase dashboard, go to **Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:3000`
3. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mental-math/
├── proxy.ts                        # Route protection (Next.js 16 proxy)
├── supabase/migrations/            # Database schema SQL
├── src/
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   ├── auth/callback/route.ts  # Supabase auth callback
│   │   ├── dashboard/page.tsx      # Stats dashboard
│   │   └── practice/page.tsx       # Practice mode
│   ├── components/                 # Reusable UI components
│   ├── hooks/                      # Custom React hooks
│   └── lib/
│       ├── supabase/               # Supabase client helpers
│       ├── problems.ts             # Problem generation engine
│       └── types.ts                # TypeScript type definitions
```

## Features

- **5 Operations**: Addition, subtraction, multiplication, division, percentages
- **4 Difficulty Levels**: Easy, medium, hard, expert
- **Unlimited Practice**: Solve problems at your own pace
- **Real-time Stats**: Track accuracy and speed per operation
- **Dashboard**: See your overall performance and per-operation breakdown

## Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy — Vercel auto-detects Next.js
5. Update your Supabase **Site URL** and **Redirect URLs** to your production domain
