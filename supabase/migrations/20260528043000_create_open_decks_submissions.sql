create table if not exists public.open_decks_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age >= 18 and age <= 120),
  hometown text not null,
  instagram_handle text not null,
  created_at timestamptz not null default now()
);

alter table public.open_decks_submissions enable row level security;

drop policy if exists "Allow public open decks submissions"
  on public.open_decks_submissions;

create policy "Allow public open decks submissions"
  on public.open_decks_submissions
  for insert
  to anon
  with check (true);
