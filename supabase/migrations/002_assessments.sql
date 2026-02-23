-- ============================================================
-- Assessment table for adaptive skill-level tests
-- ============================================================

create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Per-operation skill levels determined by the adaptive algorithm
  add_level text not null,
  subtract_level text not null,
  multiply_level text not null,
  divide_level text not null,
  percentage_level text not null,

  -- Overall rating derived from the average of operation scores
  overall_rating text not null,

  -- Summary stats
  total_questions integer not null,
  total_correct integer not null,

  completed_at timestamptz default now() not null
);

-- Index for fetching the most recent assessment per user
create index assessments_user_completed on assessments (user_id, completed_at desc);

-- Row Level Security
alter table assessments enable row level security;

create policy "Users can view their own assessments"
  on assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assessments"
  on assessments for insert
  with check (auth.uid() = user_id);
