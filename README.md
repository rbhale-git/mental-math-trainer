# MentalMath - Mental Math Training App

Practice and improve your mental arithmetic skills across multiple game modes, 5 operations, and 4 difficulty levels.

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

### 3. Run the database migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Run each migration file in this order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_assessments.sql`
   - `supabase/migrations/003_add_lives_mode_to_sessions.sql`
4. Click **Run** after pasting each file

### 4. Configure environment variables

1. In your Supabase dashboard, go to **Settings -> API**
2. Copy the **Project URL** and **anon public** key
3. Edit the `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Configure Supabase Auth (optional but recommended)

1. In Supabase dashboard, go to **Authentication -> URL Configuration**
2. Set **Site URL** to `http://localhost:3000`
3. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
mental-math/
+-- proxy.ts                        # Route protection (Next.js 16 proxy)
+-- supabase/migrations/            # Database schema SQL
+-- src/
|   +-- app/
|   |   +-- page.tsx                # Landing page
|   |   +-- login/page.tsx          # Login page
|   |   +-- signup/page.tsx         # Signup page
|   |   +-- auth/callback/route.ts  # Supabase auth callback
|   |   +-- dashboard/page.tsx      # Stats dashboard
|   |   +-- practice/page.tsx       # Practice mode
|   |   +-- assessment/page.tsx     # Adaptive skill assessment
|   +-- components/                 # Reusable UI components
|   +-- hooks/                      # Custom React hooks
|   +-- lib/
|       +-- supabase/               # Supabase client helpers
|       +-- assessment.ts           # Assessment engine
|       +-- problems.ts             # Problem generation engine
|       +-- types.ts                # TypeScript type definitions
```

## Features

- **5 Operations**: Addition, subtraction, multiplication, division, percentages
- **4 Difficulty Levels**: Easy, medium, hard, expert
- **3 Game Modes**:
  - **Unlimited**: Open-ended practice
  - **Timed**: Score as many correct answers as possible before time runs out
  - **Lives**: Session ends when all lives are lost
- **Adaptive Assessment**: Skill test across all operations with per-operation levels
- **Guest Mode**: Practice and assessment without creating an account
- **Streak Tracking**: Live streak and best streak in each session
- **Real-time Stats**: Track accuracy and speed per operation
- **Dashboard**: See overall performance and per-operation breakdown (signed-in users)
- **Mobile-Friendly Input**: Numeric keypad support on mobile for faster answering

## Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy - Vercel auto-detects Next.js
5. Update your Supabase **Site URL** and **Redirect URLs** to your production domain
