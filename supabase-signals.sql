-- ─── SIGNALS TABLE ────────────────────────────────────────────────────────────
-- Stores reader questions sent via Signal Ink.
-- Run this in Supabase Dashboard → SQL Editor → New query

create table if not exists public.signals (
  id            uuid        default gen_random_uuid() primary key,
  chapter_slug  text        not null,
  chapter_title text,
  selected_text text,
  question      text        not null,
  reader_email  text,
  answered      boolean     not null default false,
  reply         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists signals_answered_idx    on public.signals(answered);
create index if not exists signals_created_at_idx  on public.signals(created_at desc);
create index if not exists signals_chapter_idx     on public.signals(chapter_slug);

-- Reuse the set_updated_at() trigger function from the readers table
drop trigger if exists signals_updated_at on public.signals;
create trigger signals_updated_at
  before update on public.signals
  for each row execute function public.set_updated_at();

alter table public.signals disable row level security;
