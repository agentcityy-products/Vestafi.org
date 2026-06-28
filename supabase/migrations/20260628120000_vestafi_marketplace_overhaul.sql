-- Vestafi marketplace overhaul.
-- Adds admin-controlled apartment economics, publishing, marketplace status,
-- Prime contact handoffs, dashboard content settings, member alerts, and
-- application ownership preference.

alter table public.property
  add column if not exists apartment_status text not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists acquisition_cost numeric not null default 0,
  add column if not exists furnishing_cost numeric not null default 0,
  add column if not exists legal_setup_cost numeric not null default 0,
  add column if not exists operational_setup_cost numeric not null default 0,
  add column if not exists markup_amount numeric not null default 0,
  add column if not exists markup_percentage numeric not null default 0,
  add column if not exists listed_value numeric,
  add column if not exists annual_yield_min numeric,
  add column if not exists annual_yield_max numeric,
  add column if not exists starting_ownership_amount numeric,
  add column if not exists occupancy_percentage numeric,
  add column if not exists earnings_active_since date,
  add column if not exists last_distribution_at date,
  add column if not exists next_distribution_at date,
  add column if not exists apartment_features text[] not null default '{}',
  add column if not exists prime_highlights text[] not null default '{}',
  add column if not exists managed_by_vestafi boolean not null default true;

alter table public.property
  drop constraint if exists property_apartment_status_check;

alter table public.property
  add constraint property_apartment_status_check
  check (
    apartment_status in (
      'draft',
      'acquiring',
      'operational',
      'prime-available',
      'live-active',
      'fractional-open',
      'fully-sold'
    )
  );

alter table public.property
  drop constraint if exists property_occupancy_percentage_check;

alter table public.property
  add constraint property_occupancy_percentage_check
  check (occupancy_percentage is null or (occupancy_percentage >= 0 and occupancy_percentage <= 100));

update public.property
set
  apartment_status = case
    when opportunity_type = 'prime' then 'prime-available'
    when opportunity_type = 'live' then 'live-active'
    when opportunity_type = 'fractional' then 'fractional-open'
    else 'draft'
  end,
  published_at = coalesce(published_at, created_at),
  listed_value = coalesce(listed_value, price),
  annual_yield_min = coalesce(annual_yield_min, 16),
  annual_yield_max = coalesce(annual_yield_max, 19),
  starting_ownership_amount = coalesce(starting_ownership_amount, case when opportunity_type = 'prime' then price else 1000000 end),
  occupancy_percentage = coalesce(occupancy_percentage, case when opportunity_type = 'live' then 100 else null end),
  earnings_active_since = coalesce(earnings_active_since, case when opportunity_type = 'live' then date '2026-01-01' else null end),
  last_distribution_at = coalesce(last_distribution_at, case when opportunity_type = 'live' then date '2026-06-04' else null end),
  next_distribution_at = coalesce(next_distribution_at, case when opportunity_type in ('live', 'prime') then date '2026-07-04' else null end),
  apartment_features = case
    when coalesce(array_length(apartment_features, 1), 0) = 0 and opportunity_type = 'prime'
      then array['3 Bedroom Penthouse', 'Fully Furnished', 'Rooftop Terrace', 'City Skyline Views']
    when coalesce(array_length(apartment_features, 1), 0) = 0 and opportunity_type = 'live'
      then array['Tenant Occupied', 'Rent Active', 'Managed by Vestafi']
    when coalesce(array_length(apartment_features, 1), 0) = 0
      then array['Member Ownership', 'Professionally Managed', 'Structured Acquisition']
    else apartment_features
  end,
  prime_highlights = case
    when coalesce(array_length(prime_highlights, 1), 0) = 0 and opportunity_type = 'prime'
      then array['Full ownership with individual title', 'Premium location', 'Managed by Vestafi optional', 'High rental demand area']
    else prime_highlights
  end
where true;

create table if not exists public.ownership_contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profile(id) on delete cascade,
  property_id uuid not null references public.property(id) on delete cascade,
  opportunity_type text not null check (opportunity_type in ('prime', 'live')),
  request_type text not null default 'prime-reservation'
    check (request_type in ('prime-reservation', 'live-support', 'general-support')),
  status text not null default 'reserved'
    check (status in ('reserved', 'contacted', 'completed', 'cancelled', 'expired')),
  note text,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ownership_contact_requests_user_idx
  on public.ownership_contact_requests(user_id, created_at desc);

create index if not exists ownership_contact_requests_property_active_idx
  on public.ownership_contact_requests(property_id, status)
  where status in ('reserved', 'contacted');

alter table public.ownership_contact_requests enable row level security;

drop policy if exists "Members can read own ownership contact requests" on public.ownership_contact_requests;
create policy "Members can read own ownership contact requests"
  on public.ownership_contact_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Members can create own ownership contact requests" on public.ownership_contact_requests;
create policy "Members can create own ownership contact requests"
  on public.ownership_contact_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Admins manage ownership contact requests" on public.ownership_contact_requests;
create policy "Admins manage ownership contact requests"
  on public.ownership_contact_requests
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.user_role
      where user_role.id = auth.uid()
        and user_role.role = 'admin'::public.user_role_enum
    )
  )
  with check (
    exists (
      select 1
      from public.user_role
      where user_role.id = auth.uid()
        and user_role.role = 'admin'::public.user_role_enum
    )
  );

create table if not exists public.member_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profile(id) on delete cascade,
  property_id uuid references public.property(id) on delete cascade,
  alert_type text not null check (
    alert_type in (
      'apartment_published',
      'rent_distribution',
      'weekly_onboarding_call',
      'monthly_apartment_visit',
      'membership_reminder'
    )
  ),
  title text not null,
  message text not null,
  channel text not null default 'dashboard' check (channel in ('dashboard', 'email', 'both')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_alerts enable row level security;

drop policy if exists "Members read relevant alerts" on public.member_alerts;
create policy "Members read relevant alerts"
  on public.member_alerts
  for select
  to authenticated
  using (
    status = 'published'
    and (user_id is null or user_id = auth.uid())
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at >= now())
  );

drop policy if exists "Admins manage member alerts" on public.member_alerts;
create policy "Admins manage member alerts"
  on public.member_alerts
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.user_role
      where user_role.id = auth.uid()
        and user_role.role = 'admin'::public.user_role_enum
    )
  )
  with check (
    exists (
      select 1
      from public.user_role
      where user_role.id = auth.uid()
        and user_role.role = 'admin'::public.user_role_enum
    )
  );

alter table public.applications
  add column if not exists preferred_ownership_path text;

alter table public.applications
  drop constraint if exists applications_preferred_ownership_path_check;

alter table public.applications
  add constraint applications_preferred_ownership_path_check
  check (
    preferred_ownership_path is null
    or preferred_ownership_path in ('prime', 'live', 'fractional', 'not-sure')
  );

insert into public.app_settings (key, value)
values
  (
    'marketplace_auto_approval_mode',
    '"prime-only"'::jsonb
  ),
  (
    'dashboard_marketplace_content',
    jsonb_build_object(
      'heroLabel', 'Available inside Vestafi',
      'heroTitle', 'Current Ownership Openings',
      'heroDescription', 'Private apartment ownership opportunities currently available inside Vestafi.',
      'supportTitle', 'Need help choosing the right ownership opportunity?',
      'supportDescription', 'A Vestafi advisor can guide you privately.',
      'webinarTitle', 'Weekly ownership orientation',
      'webinarDescription', 'Join a guided session to understand Prime, Live, and Fractional apartment ownership.'
    )
  )
on conflict (key) do nothing;

drop view if exists public.listings_view;

create or replace view public.listings_view
with (security_invoker = false)
as
select
  p.id,
  p.title,
  p.description,
  p.price,
  p.minimum_monthly_rent,
  p.maximum_monthly_rent,
  p.address_line_1,
  p.address_line_2,
  p.city,
  p.state,
  p.zip_code,
  p.country,
  p.images,
  p.created_at,
  p.allow_first_time_investors,
  p.opportunity_type,
  p.property_type,
  p.apartment_status,
  p.published_at,
  p.acquisition_cost,
  p.furnishing_cost,
  p.legal_setup_cost,
  p.operational_setup_cost,
  p.markup_amount,
  p.markup_percentage,
  coalesce(p.listed_value, p.price) as listed_value,
  p.annual_yield_min,
  p.annual_yield_max,
  p.starting_ownership_amount,
  p.occupancy_percentage,
  p.earnings_active_since,
  p.last_distribution_at,
  p.next_distribution_at,
  p.apartment_features,
  p.prime_highlights,
  p.managed_by_vestafi,
  coalesce(inv.total_investment, 0::numeric) as total_investment,
  case
    when p.price > 0 then round((coalesce(inv.total_investment, 0::numeric) / p.price) * 100::numeric, 2)
    else 0::numeric
  end as investment_percentage,
  greatest(p.price - coalesce(inv.total_investment, 0::numeric), 0::numeric) as available_ownership,
  coalesce(res.reserved_amount, 0::numeric) as reserved_amount,
  (coalesce(res.reservation_count, 0) + coalesce(contact_res.contact_count, 0)) > 0 as is_reserved,
  rent.average_rent_6_months
from public.property p
left join (
  select
    investment.property_id,
    sum(investment.amount) as total_investment
  from public.investment
  where investment.status = any (
    array[
      'successful'::public.investment_status_enum,
      'pending'::public.investment_status_enum
    ]
  )
  group by investment.property_id
) inv on inv.property_id = p.id
left join (
  select
    ownership_reservations.property_id,
    sum(ownership_reservations.ownership_amount) as reserved_amount,
    count(*) as reservation_count
  from public.ownership_reservations
  where ownership_reservations.status in ('reserved', 'pending_review')
    and ownership_reservations.expires_at > now()
  group by ownership_reservations.property_id
) res on res.property_id = p.id
left join (
  select
    ownership_contact_requests.property_id,
    count(*) as contact_count
  from public.ownership_contact_requests
  where ownership_contact_requests.status in ('reserved', 'contacted')
    and ownership_contact_requests.expires_at > now()
  group by ownership_contact_requests.property_id
) contact_res on contact_res.property_id = p.id
left join (
  select
    monthly_rent.property_id,
    avg(monthly_rent.total_rent_collected) as average_rent_6_months
  from public.monthly_rent
  where monthly_rent.month >= (date_trunc('month', now()) - interval '6 months')
  group by monthly_rent.property_id
) rent on rent.property_id = p.id;

grant select on public.listings_view to authenticated;
grant select on public.listings_view to service_role;
