-- Waka Tourisme V1 — production hardening

alter table public.profiles
  add column if not exists locale text not null default 'fr',
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists terms_accepted_at timestamptz;

create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text not null,
  phone text,
  partner_type text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','qualified','won','lost','spam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  page_path text,
  rating smallint check(rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists partner_leads_created_idx on public.partner_leads(created_at desc);
create index if not exists beta_feedback_created_idx on public.beta_feedback(created_at desc);

-- Analytics, commercial leads and feedback are server-write only. The service-role API bypasses RLS.
alter table public.analytics_events enable row level security;
alter table public.partner_leads enable row level security;
alter table public.beta_feedback enable row level security;

-- Authenticated users can insert their own feedback directly if desired; anonymous feedback goes through the server API.
create policy "feedback self insert" on public.beta_feedback for insert to authenticated
  with check (auth.uid() = user_id);
create policy "feedback self read" on public.beta_feedback for select to authenticated
  using (auth.uid() = user_id);
create policy "admin read feedback" on public.beta_feedback for select to authenticated
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

-- Public catalogue can expose badges/challenges but not users' progress.
alter table public.badges enable row level security;
alter table public.challenges enable row level security;
create policy "public read active badges" on public.badges for select using (active = true);
create policy "public read active challenges" on public.challenges for select using (active = true);

-- Editors/admins can manage supporting catalogue tables.
create policy "admin write restaurants" on public.restaurants for all
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
  with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "admin write accommodations" on public.accommodations for all
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
  with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "admin write activities" on public.activities for all
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
  with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

-- Dashboard aggregate exposed only to admin/editor accounts.
create or replace function public.admin_dashboard_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
  result jsonb;
begin
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')) into allowed;
  if not allowed then raise exception 'not authorized'; end if;

  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'favorites', (select count(*) from public.favorites),
    'itineraries', (select count(*) from public.itineraries),
    'partnerLeads', (select count(*) from public.partner_leads where status='new'),
    'spins30d', (select count(*) from public.analytics_events where event_name='destination_generated' and created_at > now() - interval '30 days'),
    'conversion30d', (
      select case when spins = 0 then 0 else round((saved::numeric / spins::numeric) * 100, 1) end
      from (
        select
          count(*) filter(where event_name='destination_generated') as spins,
          count(*) filter(where event_name='itinerary_saved') as saved
        from public.analytics_events where created_at > now() - interval '30 days'
      ) q
    )
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_dashboard_metrics() from public;
grant execute on function public.admin_dashboard_metrics() to authenticated;

create policy "admin read partner leads" on public.partner_leads for select to authenticated
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));
create policy "admin update partner leads" on public.partner_leads for update to authenticated
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')))
  with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','editor')));

-- Keep profile bootstrap aligned with account metadata created during sign-up.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,first_name,terms_accepted_at)
  values(
    new.id,
    nullif(new.raw_user_meta_data->>'first_name',''),
    case when (new.raw_user_meta_data->>'terms_accepted_at') is not null then (new.raw_user_meta_data->>'terms_accepted_at')::timestamptz else null end
  )
  on conflict(id) do update set
    first_name=coalesce(excluded.first_name,public.profiles.first_name),
    terms_accepted_at=coalesce(excluded.terms_accepted_at,public.profiles.terms_accepted_at);
  return new;
end; $$;
