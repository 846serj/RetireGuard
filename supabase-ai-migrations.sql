-- AI action-plan cache.
alter table scores add column if not exists ai_plan jsonb;

-- Per-user AI coach rate limiting. Stores counts/timestamps only, never message text.
create table if not exists coach_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  created_at timestamptz default now() not null
);
create index if not exists coach_usage_user_created_idx on coach_usage (user_id, created_at desc);
alter table coach_usage enable row level security;
create policy "own coach usage insert" on coach_usage for insert with check (auth.uid() = user_id);
create policy "own coach usage read" on coach_usage for select using (auth.uid() = user_id);

-- Optional metadata for tier gates. Stores billing tier only, never message text.
alter table coach_usage add column if not exists tier text;
alter table coach_usage add column if not exists plan text;
