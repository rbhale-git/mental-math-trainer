-- ============================================================
-- Mental Math Training App — Initial Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor:
--   Supabase Dashboard → SQL Editor → New Query → paste & run

-- ============================================================
-- 1. PROBLEMS TABLE
-- Stores every individual problem a user attempts
-- ============================================================
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('add', 'subtract', 'multiply', 'divide', 'percentage')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  operand1 NUMERIC NOT NULL,
  operand2 NUMERIC NOT NULL,
  correct_answer NUMERIC NOT NULL,
  user_answer NUMERIC,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by user
CREATE INDEX idx_problems_user_id ON problems(user_id);
CREATE INDEX idx_problems_created_at ON problems(user_id, created_at DESC);

-- ============================================================
-- 2. SESSIONS TABLE
-- Groups problems into practice sessions
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('unlimited', 'timed')),
  operations TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  total_problems INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  avg_response_time_ms INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ============================================================
-- 3. PERFORMANCE METRICS TABLE
-- Aggregated stats per user/operation/difficulty combo
-- Updated after each answered problem
-- ============================================================
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('add', 'subtract', 'multiply', 'divide', 'percentage')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC NOT NULL DEFAULT 0,
  avg_response_time_ms INTEGER NOT NULL DEFAULT 0,
  last_practiced TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Each user can only have one row per operation+difficulty
  UNIQUE(user_id, operation, difficulty)
);

CREATE INDEX idx_performance_user_id ON performance_metrics(user_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- Ensures users can only read/write their own data
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Problems: users can only see and insert their own problems
CREATE POLICY "Users can view own problems"
  ON problems FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problems"
  ON problems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sessions: users can only manage their own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Performance metrics: users can manage their own metrics
CREATE POLICY "Users can view own metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics"
  ON performance_metrics FOR UPDATE
  USING (auth.uid() = user_id);
