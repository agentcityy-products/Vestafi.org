# Database Schema

### Tables:

#### `profile`

RLS
create: profile.id = auth.users.id
update: profile.id = auth.users.id
select: profile.id = auth.users.id or auth.users.raw_user_meta_data->>'role' = 'admin'

<!-- The profile of the investor -->

- `id` (UUID, PK, FK → auth.users.id)
- `email` (Text, Unique)
- `first_name` (Text)
- `last_name` (Text)
- `phone` (Text)
- `country_code` (Text)
- `created_at` (Timestamp)
- `role` (Text: investor, admin, default: investor)

#### `bank_info`

<!-- The bank info of the investor -->

RLS
create: bank_info.profile_id = auth.users.id
update: bank_info.profile_id = auth.users.id
select: bank_info.profile_id = auth.users.id or admin

- `profile_id` (UUID, FK → profile.id, PK)
- `bank_name` (Text)
- `account_number` (Text)
- `account_name` (Text)

#### `property`

<!-- The property which is listed by the admin -->

RLS
create: admin
update: admin
delete: admin
select: authenticated users

- `id` (UUID, PK)
- `title` (Text)
- `description` (Text)

- `price` (Numeric)
- `minimum_monthly_rent` (Numeric)
- `maximum_monthly_rent` (Numeric)

- `images` (Text)
- `address_line_1` (Text)
- `address_line_2` (Text)
- `city` (Text)
- `state` (Text)
- `country` (Text)
- `zip_code` (Text)

- `created_at` (Timestamp)

#### `investment`

<!-- The investment made by the investor in a property -->

RLS
create: owner
select: owner or admin

- `id` (UUID, PK)
- `user_id` (UUID, FK → profile.id)
- `property_id` (UUID, FK → property.id)
- `amount` (Numeric)
- `created_at` (Timestamp)

#### `monthly_rent`

<!-- The monthly rent on each property which is added by the admin -->

RLS
create: admin
select: admin

- `id` (UUID, PK)
- `property_id` (UUID, FK → property.id)
- `month` (Date)
- `total_rent_collected` (Numeric)

#### `monthly_return`

<!-- The monthly returns on each property for each investor distributed by the admin -->

RLS
create: admin
select: admin

- `id` (UUID, PK)
- `investment_id` (UUID, FK → investment.id)
- `month` (Date)
- `amount_distributed` (Numeric)
- `percentage_of_ownership` (Numeric) <!-- The percentage of ownership of the investor in the property at the time of the distribution -->

#### `withdrawal_request`

<!-- The withdrawal request made by the investor for the amount which they have in their vault -->

RLS
create: owner
select: owner or admin
update: owner or admin

- `id` (UUID, PK)
- `user_id` (UUID, FK → profile.id)
- `amount` (Numeric)
- `status` (Text: withdrawn, pending, paid)
- `created_at` (Timestamp)
- `updated_at` (Timestamp, Nullable)

#### `vault_view`

<!-- This will be an aggregation view of the monthly_return table and withdrawal_request table
It will be used to determine the total amount in the vault of the investor
The formula will be:
total_earnings = sum(monthly_return.amount_distributed)
total_withdrawn = sum(withdrawal_request.amount where withdrawal_request.status = 'paid')
total_amount_in_vault = total_earnings - total_withdrawn

 -->

- `profile_id` (UUID, FK → profile.id)
- `total_earnings` (Numeric)
- `total_withdrawn` (Numeric)
- `total_amount_in_vault` (Numeric)
