-- Form Builder: Supabase schema
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists projects (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists forms (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists master_forms (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The app has no user login, so allow full access with the anon key.
-- If you add Supabase Auth later, tighten these policies.
alter table projects enable row level security;
alter table forms enable row level security;
alter table master_forms enable row level security;

drop policy if exists "Allow all access" on projects;
create policy "Allow all access" on projects
  for all using (true) with check (true);

drop policy if exists "Allow all access" on forms;
create policy "Allow all access" on forms
  for all using (true) with check (true);

drop policy if exists "Allow all access" on master_forms;
create policy "Allow all access" on master_forms
  for all using (true) with check (true);
