-- Expand alert categories for market-specific monitoring and prepare web-push subscriptions.
do $$ begin
  alter table content_items drop constraint if exists content_items_category_check;
  alter table content_items add constraint content_items_category_check check (category in ('benefit','inflation','market','scam','tax','medicare','ss','costofliving','healthcare'));
exception when duplicate_object then null; end $$;

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_enabled_idx on push_subscriptions (user_id, enabled);
