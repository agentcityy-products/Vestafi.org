alter table public.property
add column if not exists opportunity_type text;

alter table public.property
drop constraint if exists property_opportunity_type_check;

alter table public.property
add constraint property_opportunity_type_check
check (opportunity_type in ('prime', 'live', 'fractional'));

update public.property p
set opportunity_type = case
  when exists (
    select 1
    from public.monthly_rent mr
    where mr.property_id = p.id
  ) then 'live'
  when not p.allow_first_time_investors
    and not exists (
      select 1
      from public.investment i
      where i.property_id = p.id
    ) then 'prime'
  else 'fractional'
end
where opportunity_type is null;

alter table public.property
alter column opportunity_type set default 'fractional';

alter table public.property
alter column opportunity_type set not null;

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
  p.opportunity_type,
  p.created_at,
  coalesce(inv.total_investment, 0::numeric) as total_investment,
  case
    when p.price > 0::numeric
      then (coalesce(inv.total_investment, 0::numeric) / p.price) * 100::numeric
    else 0::numeric
  end as investment_percentage,
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
) inv on p.id = inv.property_id
left join (
  select
    monthly_rent.property_id,
    avg(monthly_rent.total_rent_collected) as average_rent_6_months
  from public.monthly_rent
  where monthly_rent.month >= current_date - interval '6 months'
  group by monthly_rent.property_id
) rent on p.id = rent.property_id;

comment on column public.property.opportunity_type is
  'Admin-controlled marketplace presentation: prime, live, or fractional.';
