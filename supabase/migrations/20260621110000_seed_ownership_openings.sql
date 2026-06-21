-- Production-style placeholder opportunities.
-- These records are ordinary property rows and remain fully editable in Admin.
insert into public.property (
  id,
  title,
  description,
  price,
  minimum_monthly_rent,
  maximum_monthly_rent,
  images,
  address_line_1,
  city,
  state,
  country,
  zip_code,
  allow_first_time_investors,
  property_type,
  status,
  opportunity_type,
  listing_date
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'The Residences, Kololo',
    'A premier three-bedroom penthouse in one of Kampala''s most prestigious addresses, fully furnished and professionally managed by Vestafi.',
    420000000,
    5600000,
    6200000,
    array['/images/vestafi/apartment-placeholder.png'],
    'Prince Charles Drive',
    'Kololo',
    'Kampala',
    'Uganda',
    '256',
    true,
    'investment',
    'approved',
    'prime',
    current_date
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Acacia Heights',
    'A refined full-ownership apartment with generous living spaces, city views, secure parking, and optional Vestafi management.',
    550000000,
    7200000,
    8100000,
    array['/images/vestafi/apartment-placeholder.png'],
    'Acacia Avenue',
    'Nakasero',
    'Kampala',
    'Uganda',
    '256',
    true,
    'investment',
    'approved',
    'prime',
    current_date
  ),
  (
    '20000000-0000-4000-8000-000000000001',
    'Falcon Residency, Unit 116',
    'An operational two-bedroom apartment with an active tenant, established rent flow, and monthly member distributions.',
    200000000,
    3000000,
    3400000,
    array['/images/vestafi/apartment-placeholder.png'],
    'Kira Road',
    'Najjera',
    'Kampala',
    'Uganda',
    '256',
    true,
    'investment',
    'approved',
    'live',
    current_date
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Sunset Apartments',
    'A fully occupied apartment in Muyenga with stable rental performance, professional management, and active monthly distributions.',
    185000000,
    2700000,
    3100000,
    array['/images/vestafi/apartment-placeholder.png'],
    'Tank Hill Road',
    'Muyenga',
    'Kampala',
    'Uganda',
    '256',
    true,
    'investment',
    'approved',
    'live',
    current_date
  ),
  (
    '30000000-0000-4000-8000-000000000001',
    'Greenview Apartments',
    'A structured member ownership opportunity designed for people who want to acquire a professionally managed Kampala apartment together.',
    500000000,
    6500000,
    7400000,
    array['/images/vestafi/apartment-placeholder.png'],
    'Kisaasi Road',
    'Kisaasi',
    'Kampala',
    'Uganda',
    '256',
    true,
    'investment',
    'approved',
    'fractional',
    current_date
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'Lakeview Apartments',
    'A collaborative apartment acquisition opportunity near Entebbe Road with a clear ownership structure and Vestafi management.',
    400000000,
    4800000,
    5600000,
    array['/images/vestafi/apartment-placeholder.png'],
    'Entebbe Road',
    'Najjera',
    'Kampala',
    'Uganda',
    '256',
    true,
    'investment',
    'approved',
    'fractional',
    current_date
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  minimum_monthly_rent = excluded.minimum_monthly_rent,
  maximum_monthly_rent = excluded.maximum_monthly_rent,
  images = excluded.images,
  address_line_1 = excluded.address_line_1,
  city = excluded.city,
  state = excluded.state,
  country = excluded.country,
  zip_code = excluded.zip_code,
  allow_first_time_investors = excluded.allow_first_time_investors,
  property_type = excluded.property_type,
  status = excluded.status,
  opportunity_type = excluded.opportunity_type,
  listing_date = excluded.listing_date;

insert into public.monthly_rent (property_id, month, total_rent_collected)
select property_id, month, rent
from (
  values
    ('20000000-0000-4000-8000-000000000001'::uuid, (current_date - interval '1 month')::date, 3200000::numeric),
    ('20000000-0000-4000-8000-000000000001'::uuid, (current_date - interval '2 months')::date, 3200000::numeric),
    ('20000000-0000-4000-8000-000000000001'::uuid, (current_date - interval '3 months')::date, 3150000::numeric),
    ('20000000-0000-4000-8000-000000000002'::uuid, (current_date - interval '1 month')::date, 2900000::numeric),
    ('20000000-0000-4000-8000-000000000002'::uuid, (current_date - interval '2 months')::date, 2900000::numeric),
    ('20000000-0000-4000-8000-000000000002'::uuid, (current_date - interval '3 months')::date, 2850000::numeric)
) as rent_seed(property_id, month, rent)
where not exists (
  select 1
  from public.monthly_rent existing
  where existing.property_id = rent_seed.property_id
    and existing.month = rent_seed.month
);
