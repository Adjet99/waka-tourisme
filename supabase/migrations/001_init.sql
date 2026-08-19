-- Waka Tourisme MVP — PostgreSQL/Supabase schema
create extension if not exists pgcrypto;

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text,
  latitude double precision not null,
  longitude double precision not null,
  description_short text,
  description_long text,
  hero_image text,
  recommended_days_min smallint not null default 1,
  recommended_days_max smallint not null default 2,
  average_budget integer,
  tags text[] not null default '{}',
  active boolean not null default true,
  source text,
  source_url text,
  confidence numeric(3,2) not null default .50,
  verified boolean not null default false,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  active boolean not null default true
);

create table if not exists public.attractions (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  average_visit_duration integer,
  price_min integer,
  price_max integer,
  opening_hours jsonb,
  contact jsonb,
  website text,
  child_friendly boolean,
  accessibility jsonb,
  indoor boolean,
  outdoor boolean,
  rating numeric(2,1),
  source text,
  source_url text,
  confidence numeric(3,2) not null default .50,
  verified boolean not null default false,
  last_verified_at timestamptz,
  active boolean not null default true,
  unique(city_id, slug)
);


create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(), city_id uuid not null references public.cities(id) on delete cascade,
  name text not null, slug text not null, latitude double precision, longitude double precision,
  cuisine text[], price_level text, address text, contact jsonb, website text,
  source text, source_url text, verified boolean not null default false, last_verified_at timestamptz,
  unique(city_id,slug)
);
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(), city_id uuid not null references public.cities(id) on delete cascade,
  name text not null, slug text not null, type text, latitude double precision, longitude double precision,
  price_min integer, price_max integer, contact jsonb, website text,
  source text, source_url text, verified boolean not null default false, last_verified_at timestamptz,
  unique(city_id,slug)
);
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(), city_id uuid not null references public.cities(id) on delete cascade,
  name text not null, slug text not null, category text, latitude double precision, longitude double precision,
  duration_minutes integer, price_min integer, price_max integer, booking_url text,
  source text, source_url text, verified boolean not null default false, last_verified_at timestamptz,
  unique(city_id,slug)
);

create table if not exists public.city_images (
  id uuid primary key default gen_random_uuid(), city_id uuid not null references public.cities(id) on delete cascade,
  url text not null, alt_text text, position integer default 0, source text, source_url text
);
create table if not exists public.attraction_images (
  id uuid primary key default gen_random_uuid(), attraction_id uuid not null references public.attractions(id) on delete cascade,
  url text not null, alt_text text, position integer default 0, source text, source_url text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  residence_city_id uuid references public.cities(id),
  location_lat double precision,
  location_lng double precision,
  preferences jsonb not null default '{}',
  role text not null default 'user' check(role in ('user','admin','editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid references public.cities(id) on delete cascade,
  attraction_id uuid references public.attractions(id) on delete cascade,
  created_at timestamptz not null default now(),
  check((city_id is not null)::int + (attraction_id is not null)::int = 1)
);
create unique index if not exists favorites_user_city_unique on public.favorites(user_id,city_id) where city_id is not null;
create unique index if not exists favorites_user_attraction_unique on public.favorites(user_id,attraction_id) where attraction_id is not null;

create table if not exists public.visited_cities (
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  visited_at date not null default current_date,
  source text default 'user',
  primary key(user_id, city_id, visited_at)
);
create table if not exists public.visited_places (
  user_id uuid not null references auth.users(id) on delete cascade,
  attraction_id uuid not null references public.attractions(id) on delete cascade,
  visited_at date not null default current_date,
  primary key(user_id, attraction_id, visited_at)
);

create table if not exists public.destination_rejections (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_session_id text,
  city_id uuid not null references public.cities(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  city_id uuid not null references public.cities(id),
  title text not null,
  arrival_at timestamptz,
  departure_at timestamptz,
  budget integer,
  traveller_profile jsonb not null default '{}',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  attraction_id uuid references public.attractions(id) on delete set null,
  day_number smallint not null,
  starts_at time,
  ends_at time,
  title text not null,
  item_type text not null default 'activity',
  position integer not null default 0,
  metadata jsonb not null default '{}'
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  rules jsonb not null,
  active boolean not null default true
);
create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key(user_id,badge_id)
);
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
  description text, rules jsonb not null, starts_at timestamptz, ends_at timestamptz, active boolean not null default true
);
create table if not exists public.user_challenges (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  progress jsonb not null default '{}', completed_at timestamptz,
  primary key(user_id,challenge_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  attraction_id uuid references public.attractions(id) on delete cascade,
  city_id uuid references public.cities(id) on delete cascade,
  rating smallint not null check(rating between 1 and 5), body text, created_at timestamptz not null default now()
);

create table if not exists public.transport_options (
  id uuid primary key default gen_random_uuid(), origin_city_id uuid references public.cities(id), destination_city_id uuid references public.cities(id),
  mode text not null, operator text, duration_minutes integer, price_min integer, price_max integer,
  booking_url text, source text, source_url text, verified boolean not null default false, last_verified_at timestamptz
);

create table if not exists public.analytics_events (
  id bigserial primary key, user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text, event_name text not null, properties jsonb not null default '{}', created_at timestamptz not null default now()
);

create index if not exists cities_active_idx on public.cities(active);
create index if not exists cities_tags_idx on public.cities using gin(tags);
create index if not exists attractions_city_idx on public.attractions(city_id);
create index if not exists analytics_event_idx on public.analytics_events(event_name, created_at desc);

-- Public read for destination content
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.attractions enable row level security;
alter table public.restaurants enable row level security;
alter table public.accommodations enable row level security;
alter table public.activities enable row level security;
alter table public.city_images enable row level security;
alter table public.attraction_images enable row level security;
create policy "public read cities" on public.cities for select using (active = true);
create policy "public read categories" on public.categories for select using (active = true);
create policy "public read attractions" on public.attractions for select using (active = true);
create policy "public read restaurants" on public.restaurants for select using (true);
create policy "public read accommodations" on public.accommodations for select using (true);
create policy "public read activities" on public.activities for select using (true);
create policy "public read city images" on public.city_images for select using (true);
create policy "public read attraction images" on public.attraction_images for select using (true);


create policy "admin write cities" on public.cities for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor'))) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "admin write categories" on public.categories for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor'))) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "admin write attractions" on public.attractions for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor'))) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

-- User-owned data
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.visited_cities enable row level security;
alter table public.visited_places enable row level security;
alter table public.destination_rejections enable row level security;
alter table public.itineraries enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_challenges enable row level security;
alter table public.reviews enable row level security;

create policy "profile self" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "favorites self" on public.favorites for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "visited cities self" on public.visited_cities for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "visited places self" on public.visited_places for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "rejections self" on public.destination_rejections for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "itineraries self" on public.itineraries for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "itinerary items self" on public.itinerary_items for all using (exists(select 1 from public.itineraries i where i.id=itinerary_id and i.user_id=auth.uid())) with check (exists(select 1 from public.itineraries i where i.id=itinerary_id and i.user_id=auth.uid()));
create policy "badges self" on public.user_badges for select using (auth.uid()=user_id);
create policy "challenges self" on public.user_challenges for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "reviews readable" on public.reviews for select using (true);
create policy "reviews self write" on public.reviews for insert with check (auth.uid()=user_id);
create policy "reviews self update" on public.reviews for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "reviews self delete" on public.reviews for delete using (auth.uid()=user_id);

-- Bootstrap profile after sign-up
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
