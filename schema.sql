-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Sites Table
create table public.sites (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  address text,
  manager_name text,
  manager_phone text,
  notes text,
  updated_at timestamptz not null default now()
);

-- 2. Resources Table
create table public.resources (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references public.sites(id) on delete cascade,
  category text not null, -- schedule, drawing, doc
  title text not null,
  url text not null,
  version text,
  tags text,
  updated_at timestamptz not null default now()
);

-- 3. Changelog Table
create table public.changelog (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references public.sites(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  created_by text
);

-- 4. Photos Table
create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references public.sites(id) on delete cascade,
  image_url text not null,
  taken_at timestamptz,
  phase text,
  location text,
  comment text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_sites_code on public.sites(code);
create index idx_resources_site_id on public.resources(site_id);
create index idx_changelog_site_id on public.changelog(site_id);
create index idx_photos_site_id on public.photos(site_id);

-- RLS (Row Level Security) - ENABLED BUT OPEN FOR DEV PROTOTYPE
alter table public.sites enable row level security;
alter table public.resources enable row level security;
alter table public.changelog enable row level security;
alter table public.photos enable row level security;

-- Policy: Allow all operations for anyone (Dev Mode)
-- WARN: This is insecure for production.
create policy "Allow all operations for sites" on public.sites
  for all using (true) with check (true);

create policy "Allow all operations for resources" on public.resources
  for all using (true) with check (true);

create policy "Allow all operations for changelog" on public.changelog
  for all using (true) with check (true);

create policy "Allow all operations for photos" on public.photos
  for all using (true) with check (true);
