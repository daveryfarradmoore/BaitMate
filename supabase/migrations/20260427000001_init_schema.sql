-- BaitMate initial schema.
-- Recommendation flow: species + method -> gear_groups + gear_items, with
-- price_results filled by the active PriceProvider. cached_recommendations
-- is populated from Milestone 2 onward.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Lookup tables
-- ---------------------------------------------------------------------------
create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  color text not null default '#2563eb',
  created_at timestamptz not null default now()
);

create table if not exists public.fishing_methods (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.gear_groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  display_order int not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.retailers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('mock', 'amazon', 'walmart')),
  display_name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Gear catalog
-- ---------------------------------------------------------------------------
create table if not exists public.gear_items (
  id uuid primary key default gen_random_uuid(),
  gear_group_id uuid not null references public.gear_groups(id) on delete cascade,
  name text not null,
  description text not null default '',
  tag text not null check (tag in ('Best Value', 'Premium', 'Value Items', 'Cheapest')),
  base_price_usd numeric(10,2) not null check (base_price_usd >= 0),
  created_at timestamptz not null default now()
);

create index if not exists gear_items_group_idx on public.gear_items(gear_group_id);
create index if not exists gear_items_tag_idx on public.gear_items(tag);

-- Which gear items are recommended for which species + method, in order.
create table if not exists public.species_method_gear (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete cascade,
  method_id uuid not null references public.fishing_methods(id) on delete cascade,
  gear_group_id uuid not null references public.gear_groups(id) on delete cascade,
  gear_item_id uuid not null references public.gear_items(id) on delete cascade,
  rank int not null default 0,
  created_at timestamptz not null default now(),
  unique (species_id, method_id, gear_item_id)
);

create index if not exists smg_species_method_idx
  on public.species_method_gear(species_id, method_id);
create index if not exists smg_group_idx
  on public.species_method_gear(gear_group_id);

-- ---------------------------------------------------------------------------
-- Pricing snapshots (filled by PriceProvider)
-- ---------------------------------------------------------------------------
create table if not exists public.price_results (
  id uuid primary key default gen_random_uuid(),
  gear_item_id uuid not null references public.gear_items(id) on delete cascade,
  retailer_id uuid not null references public.retailers(id) on delete cascade,
  price_usd numeric(10,2) not null check (price_usd >= 0),
  url text not null,
  title text not null,
  image_url text,
  fetched_at timestamptz not null default now()
);

create index if not exists price_results_item_retailer_idx
  on public.price_results(gear_item_id, retailer_id);
create index if not exists price_results_fetched_at_idx
  on public.price_results(fetched_at desc);

-- ---------------------------------------------------------------------------
-- Cached responses (Milestone 2)
-- ---------------------------------------------------------------------------
create table if not exists public.cached_recommendations (
  id uuid primary key default gen_random_uuid(),
  request_hash text unique not null,
  response_jsonb jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists cached_recommendations_expires_idx
  on public.cached_recommendations(expires_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.species enable row level security;
alter table public.fishing_methods enable row level security;
alter table public.gear_groups enable row level security;
alter table public.retailers enable row level security;
alter table public.gear_items enable row level security;
alter table public.species_method_gear enable row level security;
alter table public.price_results enable row level security;
alter table public.cached_recommendations enable row level security;

-- Anonymous read on the catalog and pricing.
create policy "anon_read_species" on public.species
  for select using (true);
create policy "anon_read_methods" on public.fishing_methods
  for select using (true);
create policy "anon_read_gear_groups" on public.gear_groups
  for select using (true);
create policy "anon_read_retailers" on public.retailers
  for select using (true);
create policy "anon_read_gear_items" on public.gear_items
  for select using (true);
create policy "anon_read_smg" on public.species_method_gear
  for select using (true);
create policy "anon_read_price_results" on public.price_results
  for select using (true);

-- cached_recommendations is service-role only (writes happen in the function).
create policy "service_role_read_cache" on public.cached_recommendations
  for select using (auth.role() = 'service_role');
create policy "service_role_write_cache" on public.cached_recommendations
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
