create table if not exists public.ownership_reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.property(id) on delete cascade,
  user_id uuid not null references public.profile(id) on delete cascade,
  investment_id uuid references public.investment(id) on delete set null,
  vault_transaction_id uuid references public.vault_transactions(id) on delete set null,
  opportunity_type text not null check (opportunity_type in ('prime', 'live')),
  payment_method text not null check (payment_method in ('bank_transfer', 'vault')),
  status text not null default 'reserved'
    check (status in ('reserved', 'pending_review', 'completed', 'rejected', 'expired', 'cancelled')),
  ownership_amount numeric not null check (ownership_amount > 0),
  legal_fee numeric not null default 0 check (legal_fee >= 0),
  service_fee numeric not null default 0 check (service_fee >= 0),
  total_due numeric not null check (total_due > 0),
  proof_images text[] not null default '{}',
  expires_at timestamptz not null default (now() + interval '7 days'),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ownership_reservations_property_active_idx
  on public.ownership_reservations(property_id, expires_at)
  where status in ('reserved', 'pending_review');

create index if not exists ownership_reservations_user_idx
  on public.ownership_reservations(user_id, created_at desc);

create unique index if not exists ownership_reservations_investment_unique
  on public.ownership_reservations(investment_id)
  where investment_id is not null;

create unique index if not exists ownership_reservations_prime_active_unique
  on public.ownership_reservations(property_id)
  where opportunity_type = 'prime'
    and status in ('reserved', 'pending_review');

create or replace function public.validate_ownership_reservation_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  property_price numeric;
  invested_amount numeric;
  reserved_amount numeric;
begin
  if new.status not in ('reserved', 'pending_review') then
    return new;
  end if;

  select price
  into property_price
  from public.property
  where id = new.property_id
  for update;

  if property_price is null then
    raise exception 'Property does not exist';
  end if;

  select coalesce(sum(amount), 0)
  into invested_amount
  from public.investment
  where property_id = new.property_id
    and status = 'successful'::public.investment_status_enum;

  select coalesce(sum(ownership_amount), 0)
  into reserved_amount
  from public.ownership_reservations
  where property_id = new.property_id
    and status in ('reserved', 'pending_review')
    and expires_at > now()
    and id <> new.id;

  if invested_amount + reserved_amount + new.ownership_amount > property_price then
    raise exception 'Requested ownership exceeds the amount currently available';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_ownership_reservation_capacity_trigger
  on public.ownership_reservations;
create trigger validate_ownership_reservation_capacity_trigger
before insert or update of property_id, ownership_amount, status
on public.ownership_reservations
for each row
execute function public.validate_ownership_reservation_capacity();

alter table public.ownership_reservations enable row level security;

drop policy if exists "Members can view their ownership reservations"
  on public.ownership_reservations;
create policy "Members can view their ownership reservations"
  on public.ownership_reservations
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.user_role
      where user_role.id = auth.uid()
        and user_role.role = 'admin'::public.user_role_enum
    )
  );

grant select on public.ownership_reservations to authenticated;
grant all on public.ownership_reservations to service_role;

alter table public.investment
  add column if not exists ownership_type text
  check (ownership_type in ('prime', 'live', 'fractional'));

alter table public.investment
  add column if not exists payment_method text
  check (payment_method in ('bank_transfer', 'vault'));

alter table public.investment
  add column if not exists reservation_id uuid
  references public.ownership_reservations(id) on delete set null;

create or replace function public.expire_ownership_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer;
begin
  update public.ownership_reservations
  set status = 'expired',
      updated_at = now()
  where status in ('reserved', 'pending_review')
    and expires_at <= now();

  get diagnostics expired_count = row_count;

  update public.investment i
  set status = 'rejected',
      updated_at = now()
  from public.ownership_reservations r
  where r.investment_id = i.id
    and r.status = 'expired'
    and i.status = 'pending';

  return expired_count;
end;
$$;

grant execute on function public.expire_ownership_reservations() to authenticated;
grant execute on function public.expire_ownership_reservations() to service_role;

create or replace view public.listings_view
with (security_invoker = on) as
select
  p.id,
  p.title,
  p.description,
  p.price,
  p.minimum_monthly_rent,
  p.maximum_monthly_rent,
  p.images,
  p.address_line_1,
  p.address_line_2,
  p.city,
  p.state,
  p.country,
  p.zip_code,
  p.allow_first_time_investors,
  p.created_at,
  coalesce(inv.total_investment, 0::numeric) as total_investment,
  case
    when p.price > 0::numeric
      then (coalesce(inv.total_investment, 0::numeric) / p.price) * 100::numeric
    else 0::numeric
  end as investment_percentage,
  rent.average_rent_6_months,
  p.opportunity_type,
  coalesce(res.reserved_amount, 0::numeric) as reserved_amount,
  greatest(
    p.price
      - coalesce(inv.total_investment, 0::numeric)
      - coalesce(res.reserved_amount, 0::numeric),
    0::numeric
  ) as available_ownership,
  coalesce(res.active_count, 0) > 0 as is_reserved
from public.property p
left join (
  select
    investment.property_id,
    sum(investment.amount) as total_investment
  from public.investment
  where investment.status = 'successful'::public.investment_status_enum
  group by investment.property_id
) inv on p.id = inv.property_id
left join (
  select
    monthly_rent.property_id,
    avg(monthly_rent.total_rent_collected) as average_rent_6_months
  from public.monthly_rent
  where monthly_rent.month >= current_date - interval '6 months'
  group by monthly_rent.property_id
) rent on p.id = rent.property_id
left join (
  select
    ownership_reservations.property_id,
    sum(ownership_reservations.ownership_amount) as reserved_amount,
    count(*)::integer as active_count
  from public.ownership_reservations
  where ownership_reservations.status in ('reserved', 'pending_review')
    and ownership_reservations.expires_at > now()
  group by ownership_reservations.property_id
) res on p.id = res.property_id;
