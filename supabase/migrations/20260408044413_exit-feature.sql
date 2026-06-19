do $enum$ begin
  create type "public"."exit_window_order_status_enum" as enum ('open', 'partially_filled', 'filled', 'cancelled', 'expired');
exception when duplicate_object then null;
end $enum$;

do $enum$ begin
  create type "public"."exit_window_status_enum" as enum ('draft', 'active', 'ended');
exception when duplicate_object then null;
end $enum$;
do $enum$ begin
  create type "public"."membership_status_enum" as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $enum$;

do $enum$ begin
  create type "public"."ownership_movement_reason_enum" as enum ('primary_investment', 'secondary_trade', 'admin_adjustment');
exception when duplicate_object then null;
end $enum$;

do $enum$ begin
  create type "public"."property_status_enum" as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $enum$;

do $enum$ begin
  create type "public"."property_type_enum" as enum ('investment', 'rental');
exception when duplicate_object then null;
end $enum$;

do $enum$ begin
  create type "public"."rank_types" as enum ('Associate', 'Steward', 'Champion', 'Legacy');
exception when duplicate_object then null;
end $enum$;

drop policy if exists "Users can view their own profile or admin can view all" on "public"."profile";


  create table if not exists "public"."app_settings" (
    "id" uuid not null default gen_random_uuid(),
    "key" text not null,
    "value" jsonb not null,
    "updated_at" timestamp with time zone default now(),
    "updated_by" uuid
      );



  create table if not exists "public"."exit_window_orders" (
    "id" uuid not null default gen_random_uuid(),
    "exit_window_id" uuid not null,
    "property_id" uuid not null,
    "seller_user_id" uuid not null,
    "amount_total" numeric not null,
    "amount_remaining" numeric not null,
    "status" exit_window_order_status_enum not null default 'open'::exit_window_order_status_enum,
    "created_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone not null
      );


alter table if exists "public"."exit_window_orders" enable row level security;


  create table if not exists "public"."exit_window_property_prices" (
    "id" uuid not null default gen_random_uuid(),
    "exit_window_id" uuid not null,
    "property_id" uuid not null,
    "exit_price" numeric not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."exit_window_property_prices" enable row level security;


  create table if not exists "public"."exit_window_trades" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "property_id" uuid not null,
    "seller_user_id" uuid not null,
    "buyer_user_id" uuid not null,
    "amount" numeric not null,
    "fee_amount" numeric not null,
    "seller_proceeds" numeric not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."exit_window_trades" enable row level security;


  create table if not exists "public"."exit_windows" (
    "id" uuid not null default gen_random_uuid(),
    "start_at" timestamp with time zone not null,
    "end_at" timestamp with time zone not null,
    "status" exit_window_status_enum not null default 'draft'::exit_window_status_enum,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."exit_windows" enable row level security;


  create table if not exists "public"."membership_activations" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "amount" numeric not null default 150000,
    "proof_images" text[] default '{}'::text[],
    "rejection_reason" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "approved_at" timestamp with time zone,
    "approved_by" uuid,
    "status" membership_status_enum not null default 'pending'::membership_status_enum
      );


alter table "public"."membership_activations" enable row level security;


  create table if not exists "public"."property_ownership_movements" (
    "id" uuid not null default gen_random_uuid(),
    "property_id" uuid not null,
    "user_id" uuid not null,
    "amount_delta" numeric not null,
    "reason" ownership_movement_reason_enum not null,
    "ref_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."property_ownership_movements" enable row level security;


  create table if not exists "public"."referral_rewards" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "reward_per_referral" numeric default 0,
    "total_referrals" integer default 0,
    "total_rewards" numeric default 0,
    "updated_at" timestamp without time zone default now()
      );


alter table "public"."referral_rewards" enable row level security;


  create table if not exists "public"."referrals" (
    "id" uuid not null default gen_random_uuid(),
    "referrer_id" uuid,
    "referee_id" uuid,
    "referral_code" text not null,
    "status" text default 'pending'::text,
    "created_at" timestamp without time zone default now(),
    "application_id" uuid
      );


alter table "public"."referrals" enable row level security;


  create table if not exists "public"."user_vault" (
    "user_id" uuid not null,
    "balance" numeric default 0,
    "total_deposited" numeric default 0,
    "total_deployed" numeric default 0,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
      );


alter table if exists "public"."user_vault" enable row level security;


  create table if not exists "public"."vault_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "type" text,
    "amount" numeric not null,
    "property_id" uuid,
    "proof_images" text[],
    "status" text default 'pending'::text,
    "created_at" timestamp without time zone default now(),
    "receipt_url" text
      );


alter table "public"."vault_transactions" enable row level security;

alter table "public"."applications" add column if not exists "age_range" text;

alter table "public"."applications" add column if not exists "category" integer;

alter table "public"."applications" add column if not exists "contribution_capacity" text;

alter table "public"."applications" add column if not exists "contribution_frequency" text;

alter table "public"."applications" add column if not exists "country" text;

alter table "public"."applications" add column if not exists "goals" text[];

alter table "public"."applications" add column if not exists "investment_timeline" text;

alter table "public"."applications" add column if not exists "joining_as" text;

alter table "public"."applications" add column if not exists "monthly_income" text;

alter table "public"."applications" add column if not exists "referral_source" text;

alter table "public"."applications" add column if not exists "referred_by" text;

alter table "public"."applications" add column if not exists "webinar_willing" boolean;

alter table "public"."applications" alter column "location" drop not null;

alter table "public"."investment" add column if not exists "vault_transaction_id" uuid;

alter table "public"."investment" alter column "proof_images" drop not null;

alter table "public"."profile" add column if not exists "is_founding_member" boolean not null default false;

alter table "public"."profile" add column if not exists "membership_expires_at" timestamp with time zone;

alter table "public"."profile" add column if not exists "rank_types" rank_types default 'Associate'::rank_types;

alter table "public"."profile" add column if not exists "referral_code" text;

alter table "public"."property" add column if not exists "listing_date" timestamp with time zone default now();

alter table "public"."property" add column if not exists "ownership_proof" text[];

alter table "public"."property" add column if not exists "price_usd" numeric;

alter table "public"."property" add column if not exists "property_type" property_type_enum not null default 'investment'::property_type_enum;

alter table "public"."property" add column if not exists "rejection_reason" text;

alter table "public"."property" add column if not exists "status" property_status_enum default 'approved'::property_status_enum;

alter table "public"."property" add column if not exists "submitted_by" uuid;

alter table "public"."property" alter column "maximum_monthly_rent" drop not null;

alter table "public"."property" alter column "minimum_monthly_rent" drop not null;

alter table "public"."property" alter column "state" drop not null;

alter table "public"."property" alter column "zip_code" drop not null;

CREATE UNIQUE INDEX IF NOT EXISTS app_settings_key_key ON public.app_settings USING btree (key);

CREATE UNIQUE INDEX IF NOT EXISTS app_settings_pkey ON public.app_settings USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS applications_email_key ON public.applications USING btree (email);

CREATE UNIQUE INDEX IF NOT EXISTS exit_window_orders_pkey ON public.exit_window_orders USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS exit_window_property_prices_exit_window_id_property_id_key ON public.exit_window_property_prices USING btree (exit_window_id, property_id);

CREATE UNIQUE INDEX IF NOT EXISTS exit_window_property_prices_pkey ON public.exit_window_property_prices USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS exit_window_trades_pkey ON public.exit_window_trades USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS exit_windows_pkey ON public.exit_windows USING btree (id);

CREATE INDEX IF NOT EXISTS idx_exit_window_orders_window_status ON public.exit_window_orders USING btree (exit_window_id, status);

CREATE INDEX IF NOT EXISTS idx_property_ownership_movements_property_user ON public.property_ownership_movements USING btree (property_id, user_id);

CREATE INDEX IF NOT EXISTS membership_activations_created_at_idx ON public.membership_activations USING btree (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS membership_activations_pkey ON public.membership_activations USING btree (id);

CREATE INDEX IF NOT EXISTS membership_activations_user_id_idx ON public.membership_activations USING btree (user_id);

CREATE INDEX IF NOT EXISTS profile_is_foundingf_member_idx ON public.profile USING btree (is_founding_member);

CREATE INDEX IF NOT EXISTS profile_membership_expires_at_idx ON public.profile USING btree (membership_expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS profile_referral_code_key ON public.profile USING btree (referral_code);

CREATE UNIQUE INDEX IF NOT EXISTS property_ownership_movements_pkey ON public.property_ownership_movements USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS referral_rewards_pkey ON public.referral_rewards USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS referrals_pkey ON public.referrals USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS user_vault_pkey ON public.user_vault USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS vault_transactions_pkey ON public.vault_transactions USING btree (id);

-- do $$ begin
--   alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";
-- exception when duplicate_object then null;
-- end $$;

do $$ begin
  alter table "public"."exit_window_orders" add constraint "exit_window_orders_pkey" PRIMARY KEY using index "exit_window_orders_pkey";
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "public"."exit_window_property_prices" add constraint "exit_window_property_prices_pkey" PRIMARY KEY using index "exit_window_property_prices_pkey";
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_pkey" PRIMARY KEY using index "exit_window_trades_pkey";
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "public"."exit_windows" add constraint "exit_windows_pkey" PRIMARY KEY using index "exit_windows_pkey";
exception when duplicate_object then null;
end $$;

-- do $$ begin
--   alter table "public"."membership_activations" add constraint "membership_activations_pkey" PRIMARY KEY using index "membership_activations_pkey";
-- exception when duplicate_object then null;
-- end $$;

do $$ begin
  alter table "public"."property_ownership_movements" add constraint "property_ownership_movements_pkey" PRIMARY KEY using index "property_ownership_movements_pkey";
exception when duplicate_object then null;
end $$;

-- do $$ begin
--   alter table "public"."referral_rewards" add constraint "referral_rewards_pkey" PRIMARY KEY using index "referral_rewards_pkey";
-- exception when duplicate_object then null;
-- end $$;

-- do $$ begin
--   alter table "public"."referrals" add constraint "referrals_pkey" PRIMARY KEY using index "referrals_pkey";
-- exception when duplicate_object then null;
-- end $$;

-- do $$ begin
--   alter table "public"."user_vault" add constraint "user_vault_pkey" PRIMARY KEY using index "user_vault_pkey";
-- exception when duplicate_object then null;
-- end $$;

-- do $$ begin
--   alter table "public"."vault_transactions" add constraint "vault_transactions_pkey" PRIMARY KEY using index "vault_transactions_pkey";
-- exception when duplicate_object then null;
-- end $$;

-- do $$ begin
--   alter table "public"."app_settings" add constraint "app_settings_key_key" UNIQUE using index "app_settings_key_key";
-- exception when duplicate_object then null;
-- end $$;

-- do $$ begin
--   alter table "public"."app_settings" add constraint "app_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES profile(id) not valid;
-- exception when duplicate_object then null;
-- end $$;

-- alter table "public"."app_settings" validate constraint "app_settings_updated_by_fkey";

-- do $$ begin
--   alter table "public"."applications" add constraint "applications_email_key" UNIQUE using index "applications_email_key";
-- exception when duplicate_object then null;
-- end $$;

do $$ begin
  alter table "public"."exit_window_orders" add constraint "exit_window_orders_amount_remaining_check" CHECK ((amount_remaining >= (0)::numeric)) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_orders" validate constraint "exit_window_orders_amount_remaining_check";

do $$ begin
  alter table "public"."exit_window_orders" add constraint "exit_window_orders_amount_total_check" CHECK ((amount_total > (0)::numeric)) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_orders" validate constraint "exit_window_orders_amount_total_check";

do $$ begin
  alter table "public"."exit_window_orders" add constraint "exit_window_orders_exit_window_id_fkey" FOREIGN KEY (exit_window_id) REFERENCES exit_windows(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_orders" validate constraint "exit_window_orders_exit_window_id_fkey";

do $$ begin
  alter table "public"."exit_window_orders" add constraint "exit_window_orders_property_id_fkey" FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_orders" validate constraint "exit_window_orders_property_id_fkey";

do $$ begin
  alter table "public"."exit_window_orders" add constraint "exit_window_orders_seller_user_id_fkey" FOREIGN KEY (seller_user_id) REFERENCES profile(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_orders" validate constraint "exit_window_orders_seller_user_id_fkey";

do $$ begin
  alter table "public"."exit_window_property_prices" add constraint "exit_window_property_prices_exit_price_check" CHECK ((exit_price > (0)::numeric)) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_property_prices" validate constraint "exit_window_property_prices_exit_price_check";

do $$ begin
  alter table "public"."exit_window_property_prices" add constraint "exit_window_property_prices_exit_window_id_fkey" FOREIGN KEY (exit_window_id) REFERENCES exit_windows(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_property_prices" validate constraint "exit_window_property_prices_exit_window_id_fkey";

do $$ begin
  alter table "public"."exit_window_property_prices" add constraint "exit_window_property_prices_exit_window_id_property_id_key" UNIQUE using index "exit_window_property_prices_exit_window_id_property_id_key";
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "public"."exit_window_property_prices" add constraint "exit_window_property_prices_property_id_fkey" FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_property_prices" validate constraint "exit_window_property_prices_property_id_fkey";

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_amount_check" CHECK ((amount > (0)::numeric)) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_trades" validate constraint "exit_window_trades_amount_check";

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_buyer_user_id_fkey" FOREIGN KEY (buyer_user_id) REFERENCES profile(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_trades" validate constraint "exit_window_trades_buyer_user_id_fkey";

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_fee_amount_check" CHECK ((fee_amount >= (0)::numeric)) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_trades" validate constraint "exit_window_trades_fee_amount_check";

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_order_id_fkey" FOREIGN KEY (order_id) REFERENCES exit_window_orders(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_trades" validate constraint "exit_window_trades_order_id_fkey";

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_property_id_fkey" FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_trades" validate constraint "exit_window_trades_property_id_fkey";

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_seller_proceeds_check" CHECK ((seller_proceeds >= (0)::numeric)) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_trades" validate constraint "exit_window_trades_seller_proceeds_check";

do $$ begin
  alter table "public"."exit_window_trades" add constraint "exit_window_trades_seller_user_id_fkey" FOREIGN KEY (seller_user_id) REFERENCES profile(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."exit_window_trades" validate constraint "exit_window_trades_seller_user_id_fkey";

do $$ begin
  alter table "public"."investment" add constraint "investment_vault_transaction_id_fkey" FOREIGN KEY (vault_transaction_id) REFERENCES vault_transactions(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."investment" validate constraint "investment_vault_transaction_id_fkey";

do $$ begin
  alter table "public"."membership_activations" add constraint "membership_activations_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES profile(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."membership_activations" validate constraint "membership_activations_approved_by_fkey";

do $$ begin
  alter table "public"."membership_activations" add constraint "membership_activations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."membership_activations" validate constraint "membership_activations_user_id_fkey";

-- do $$ begin
--   alter table "public"."profile" add constraint "profile_referral_code_key" UNIQUE using index "profile_referral_code_key";
-- exception when duplicate_object then null;
-- end $$;

do $$ begin
  alter table "public"."property" add constraint "property_submitted_by_fkey" FOREIGN KEY (submitted_by) REFERENCES profile(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."property" validate constraint "property_submitted_by_fkey";

do $$ begin
  alter table "public"."property_ownership_movements" add constraint "property_ownership_movements_property_id_fkey" FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."property_ownership_movements" validate constraint "property_ownership_movements_property_id_fkey";

do $$ begin
  alter table "public"."property_ownership_movements" add constraint "property_ownership_movements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."property_ownership_movements" validate constraint "property_ownership_movements_user_id_fkey";

do $$ begin
  alter table "public"."referral_rewards" add constraint "referral_rewards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profile(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."referral_rewards" validate constraint "referral_rewards_user_id_fkey";

do $$ begin
  alter table "public"."referrals" add constraint "referrals_application_id_fkey" FOREIGN KEY (application_id) REFERENCES applications(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."referrals" validate constraint "referrals_application_id_fkey";

do $$ begin
  alter table "public"."referrals" add constraint "referrals_referee_id_fkey" FOREIGN KEY (referee_id) REFERENCES profile(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."referrals" validate constraint "referrals_referee_id_fkey";

do $$ begin
  alter table "public"."referrals" add constraint "referrals_referrer_id_fkey" FOREIGN KEY (referrer_id) REFERENCES profile(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."referrals" validate constraint "referrals_referrer_id_fkey";

do $$ begin
  alter table "public"."user_vault" add constraint "user_vault_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profile(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."user_vault" validate constraint "user_vault_user_id_fkey";

do $$ begin
  alter table "public"."vault_transactions" add constraint "vault_transactions_property_id_fkey" FOREIGN KEY (property_id) REFERENCES property(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."vault_transactions" validate constraint "vault_transactions_property_id_fkey";

do $$ begin
  alter table "public"."vault_transactions" add constraint "vault_transactions_type_check" CHECK ((type = ANY (ARRAY['deposit'::text, 'deploy'::text, 'withdrawal'::text, 'exit_buy'::text, 'exit_sell'::text, 'exit_window_fee_receipt'::text, 'exit_window_platform_fee'::text]))) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."vault_transactions" validate constraint "vault_transactions_type_check";

do $$ begin
  alter table "public"."vault_transactions" add constraint "vault_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profile(id) not valid;
exception when duplicate_object then null;
end $$;

alter table "public"."vault_transactions" validate constraint "vault_transactions_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."current_ownership_view" as  SELECT user_id,
    property_id,
    sum(amount_delta) AS current_amount,
    max(created_at) AS latest_movement_at
   FROM property_ownership_movements pom
  GROUP BY user_id, property_id
 HAVING (sum(amount_delta) > (0)::numeric);


CREATE OR REPLACE FUNCTION public.generate_referral_code_from_email(email_address text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  prefix TEXT;
  code TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  -- Extract email prefix (part before @)
  prefix := LOWER(SPLIT_PART(email_address, '@', 1));
  
  -- Remove special characters, keep alphanumeric and dots
  code := REGEXP_REPLACE(prefix, '[^a-z0-9._-]', '', 'g');
  code := REGEXP_REPLACE(code, '[._-]+', '.', 'g');
  code := TRIM(BOTH '.' FROM code);
  
  -- Ensure code is not empty
  IF code = '' OR code IS NULL THEN
    code := 'user';
  END IF;
  
  -- Check if code already exists, append number if needed
  WHILE EXISTS (SELECT 1 FROM profile WHERE referral_code = code) AND counter < max_attempts LOOP
    code := code || FLOOR(RANDOM() * 10000)::TEXT;
    counter := counter + 1;
  END LOOP;
  
  -- Fallback if still exists
  IF EXISTS (SELECT 1 FROM profile WHERE referral_code = code) THEN
    code := code || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
  END IF;
  
  RETURN code;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_role_on_profile_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_role (id, role)
  VALUES (NEW.id, 'investor'::public.user_role_enum)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_profile_id UUID;
    rows_updated INTEGER;
BEGIN
    -- Find the user's profile ID by email
    SELECT id INTO user_profile_id
    FROM public.profile
    WHERE email = user_email;
    
    -- Check if user exists
    IF user_profile_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- Update the user's role to admin
    UPDATE public.user_role
    SET role = 'admin'::user_role_enum
    WHERE id = user_profile_id;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    -- Check if the update was successful
    IF rows_updated = 0 THEN
        RAISE NOTICE 'No role record found for user with email %', user_email;
        RETURN FALSE;
    END IF;
    
    RAISE NOTICE 'User % has been made admin successfully', user_email;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error making user admin: %', SQLERRM;
        RETURN FALSE;
END;
$function$
;

create or replace view "public"."owned_properties_view" as  WITH ledger_agg AS (
         SELECT property_ownership_movements.user_id,
            property_ownership_movements.property_id,
            sum(property_ownership_movements.amount_delta) AS current_amount,
            max(property_ownership_movements.created_at) AS latest_movement_at
           FROM property_ownership_movements
          GROUP BY property_ownership_movements.user_id, property_ownership_movements.property_id
        ), pending_agg AS (
         SELECT investment.user_id,
            investment.property_id,
            sum(investment.amount) AS pending_amt,
            max(investment.created_at) AS latest_pending_at
           FROM investment
          WHERE (investment.status = 'pending'::investment_status_enum)
          GROUP BY investment.user_id, investment.property_id
        ), all_pairs AS (
         SELECT ledger_agg.user_id,
            ledger_agg.property_id
           FROM ledger_agg
        UNION
         SELECT pending_agg.user_id,
            pending_agg.property_id
           FROM pending_agg
        )
 SELECT p.id,
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
    p.created_at,
    ap.user_id,
        CASE
            WHEN (COALESCE(la.current_amount, (0)::numeric) > (0)::numeric) THEN 'successful'::text
            ELSE 'pending'::text
        END AS status,
    COALESCE(la.current_amount, (0)::numeric) AS successful_investment,
    COALESCE(pa.pending_amt, (0)::numeric) AS pending_investment,
    round(((COALESCE(la.current_amount, (0)::numeric) / NULLIF(p.price, (0)::numeric)) * (100)::numeric), 2) AS ownership_percentage,
    round(((p.minimum_monthly_rent * COALESCE(la.current_amount, (0)::numeric)) / NULLIF(p.price, (0)::numeric)), 2) AS minimum_monthly_return,
    round(((p.maximum_monthly_rent * COALESCE(la.current_amount, (0)::numeric)) / NULLIF(p.price, (0)::numeric)), 2) AS maximum_monthly_return,
    COALESCE(la.latest_movement_at, pa.latest_pending_at) AS latest_investment_date
   FROM (((all_pairs ap
     JOIN property p ON ((p.id = ap.property_id)))
     LEFT JOIN ledger_agg la ON (((la.user_id = ap.user_id) AND (la.property_id = ap.property_id))))
     LEFT JOIN pending_agg pa ON (((pa.user_id = ap.user_id) AND (pa.property_id = ap.property_id))))
  WHERE ((COALESCE(la.current_amount, (0)::numeric) > (0)::numeric) OR (COALESCE(pa.pending_amt, (0)::numeric) > (0)::numeric));


CREATE OR REPLACE FUNCTION public.send_email_trigger()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    response extensions.http_response;
    result JSONB;
BEGIN
    -- Send GET request to the endpoint
    SELECT * INTO response
    FROM extensions.http(
        'GET',
        'https://www.vestafi.co/api/send-email',
        '{}'::JSONB,
        NULL,
        NULL
    );
    
    -- Return the response
    result := jsonb_build_object(
        'status', response.status,
        'content', response.content,
        'success', response.status BETWEEN 200 AND 299
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', true,
            'message', SQLERRM,
            'success', false
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_role_to_auth_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data IS NULL THEN 
          jsonb_build_object('role', NEW.role)
        ELSE
          raw_user_meta_data || jsonb_build_object('role', NEW.role)
      END
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$
;

grant delete on table "public"."app_settings" to "anon";

grant insert on table "public"."app_settings" to "anon";

grant references on table "public"."app_settings" to "anon";

grant select on table "public"."app_settings" to "anon";

grant trigger on table "public"."app_settings" to "anon";

grant truncate on table "public"."app_settings" to "anon";

grant update on table "public"."app_settings" to "anon";

grant delete on table "public"."app_settings" to "authenticated";

grant insert on table "public"."app_settings" to "authenticated";

grant references on table "public"."app_settings" to "authenticated";

grant select on table "public"."app_settings" to "authenticated";

grant trigger on table "public"."app_settings" to "authenticated";

grant truncate on table "public"."app_settings" to "authenticated";

grant update on table "public"."app_settings" to "authenticated";

grant delete on table "public"."app_settings" to "service_role";

grant insert on table "public"."app_settings" to "service_role";

grant references on table "public"."app_settings" to "service_role";

grant select on table "public"."app_settings" to "service_role";

grant trigger on table "public"."app_settings" to "service_role";

grant truncate on table "public"."app_settings" to "service_role";

grant update on table "public"."app_settings" to "service_role";

grant delete on table "public"."exit_window_orders" to "anon";

grant insert on table "public"."exit_window_orders" to "anon";

grant references on table "public"."exit_window_orders" to "anon";

grant select on table "public"."exit_window_orders" to "anon";

grant trigger on table "public"."exit_window_orders" to "anon";

grant truncate on table "public"."exit_window_orders" to "anon";

grant update on table "public"."exit_window_orders" to "anon";

grant delete on table "public"."exit_window_orders" to "authenticated";

grant insert on table "public"."exit_window_orders" to "authenticated";

grant references on table "public"."exit_window_orders" to "authenticated";

grant select on table "public"."exit_window_orders" to "authenticated";

grant trigger on table "public"."exit_window_orders" to "authenticated";

grant truncate on table "public"."exit_window_orders" to "authenticated";

grant update on table "public"."exit_window_orders" to "authenticated";

grant delete on table "public"."exit_window_orders" to "service_role";

grant insert on table "public"."exit_window_orders" to "service_role";

grant references on table "public"."exit_window_orders" to "service_role";

grant select on table "public"."exit_window_orders" to "service_role";

grant trigger on table "public"."exit_window_orders" to "service_role";

grant truncate on table "public"."exit_window_orders" to "service_role";

grant update on table "public"."exit_window_orders" to "service_role";

grant delete on table "public"."exit_window_property_prices" to "anon";

grant insert on table "public"."exit_window_property_prices" to "anon";

grant references on table "public"."exit_window_property_prices" to "anon";

grant select on table "public"."exit_window_property_prices" to "anon";

grant trigger on table "public"."exit_window_property_prices" to "anon";

grant truncate on table "public"."exit_window_property_prices" to "anon";

grant update on table "public"."exit_window_property_prices" to "anon";

grant delete on table "public"."exit_window_property_prices" to "authenticated";

grant insert on table "public"."exit_window_property_prices" to "authenticated";

grant references on table "public"."exit_window_property_prices" to "authenticated";

grant select on table "public"."exit_window_property_prices" to "authenticated";

grant trigger on table "public"."exit_window_property_prices" to "authenticated";

grant truncate on table "public"."exit_window_property_prices" to "authenticated";

grant update on table "public"."exit_window_property_prices" to "authenticated";

grant delete on table "public"."exit_window_property_prices" to "service_role";

grant insert on table "public"."exit_window_property_prices" to "service_role";

grant references on table "public"."exit_window_property_prices" to "service_role";

grant select on table "public"."exit_window_property_prices" to "service_role";

grant trigger on table "public"."exit_window_property_prices" to "service_role";

grant truncate on table "public"."exit_window_property_prices" to "service_role";

grant update on table "public"."exit_window_property_prices" to "service_role";

grant delete on table "public"."exit_window_trades" to "anon";

grant insert on table "public"."exit_window_trades" to "anon";

grant references on table "public"."exit_window_trades" to "anon";

grant select on table "public"."exit_window_trades" to "anon";

grant trigger on table "public"."exit_window_trades" to "anon";

grant truncate on table "public"."exit_window_trades" to "anon";

grant update on table "public"."exit_window_trades" to "anon";

grant delete on table "public"."exit_window_trades" to "authenticated";

grant insert on table "public"."exit_window_trades" to "authenticated";

grant references on table "public"."exit_window_trades" to "authenticated";

grant select on table "public"."exit_window_trades" to "authenticated";

grant trigger on table "public"."exit_window_trades" to "authenticated";

grant truncate on table "public"."exit_window_trades" to "authenticated";

grant update on table "public"."exit_window_trades" to "authenticated";

grant delete on table "public"."exit_window_trades" to "service_role";

grant insert on table "public"."exit_window_trades" to "service_role";

grant references on table "public"."exit_window_trades" to "service_role";

grant select on table "public"."exit_window_trades" to "service_role";

grant trigger on table "public"."exit_window_trades" to "service_role";

grant truncate on table "public"."exit_window_trades" to "service_role";

grant update on table "public"."exit_window_trades" to "service_role";

grant delete on table "public"."exit_windows" to "anon";

grant insert on table "public"."exit_windows" to "anon";

grant references on table "public"."exit_windows" to "anon";

grant select on table "public"."exit_windows" to "anon";

grant trigger on table "public"."exit_windows" to "anon";

grant truncate on table "public"."exit_windows" to "anon";

grant update on table "public"."exit_windows" to "anon";

grant delete on table "public"."exit_windows" to "authenticated";

grant insert on table "public"."exit_windows" to "authenticated";

grant references on table "public"."exit_windows" to "authenticated";

grant select on table "public"."exit_windows" to "authenticated";

grant trigger on table "public"."exit_windows" to "authenticated";

grant truncate on table "public"."exit_windows" to "authenticated";

grant update on table "public"."exit_windows" to "authenticated";

grant delete on table "public"."exit_windows" to "service_role";

grant insert on table "public"."exit_windows" to "service_role";

grant references on table "public"."exit_windows" to "service_role";

grant select on table "public"."exit_windows" to "service_role";

grant trigger on table "public"."exit_windows" to "service_role";

grant truncate on table "public"."exit_windows" to "service_role";

grant update on table "public"."exit_windows" to "service_role";

grant delete on table "public"."membership_activations" to "anon";

grant insert on table "public"."membership_activations" to "anon";

grant references on table "public"."membership_activations" to "anon";

grant select on table "public"."membership_activations" to "anon";

grant trigger on table "public"."membership_activations" to "anon";

grant truncate on table "public"."membership_activations" to "anon";

grant update on table "public"."membership_activations" to "anon";

grant delete on table "public"."membership_activations" to "authenticated";

grant insert on table "public"."membership_activations" to "authenticated";

grant references on table "public"."membership_activations" to "authenticated";

grant select on table "public"."membership_activations" to "authenticated";

grant trigger on table "public"."membership_activations" to "authenticated";

grant truncate on table "public"."membership_activations" to "authenticated";

grant update on table "public"."membership_activations" to "authenticated";

grant delete on table "public"."membership_activations" to "service_role";

grant insert on table "public"."membership_activations" to "service_role";

grant references on table "public"."membership_activations" to "service_role";

grant select on table "public"."membership_activations" to "service_role";

grant trigger on table "public"."membership_activations" to "service_role";

grant truncate on table "public"."membership_activations" to "service_role";

grant update on table "public"."membership_activations" to "service_role";

grant delete on table "public"."property_ownership_movements" to "anon";

grant insert on table "public"."property_ownership_movements" to "anon";

grant references on table "public"."property_ownership_movements" to "anon";

grant select on table "public"."property_ownership_movements" to "anon";

grant trigger on table "public"."property_ownership_movements" to "anon";

grant truncate on table "public"."property_ownership_movements" to "anon";

grant update on table "public"."property_ownership_movements" to "anon";

grant delete on table "public"."property_ownership_movements" to "authenticated";

grant insert on table "public"."property_ownership_movements" to "authenticated";

grant references on table "public"."property_ownership_movements" to "authenticated";

grant select on table "public"."property_ownership_movements" to "authenticated";

grant trigger on table "public"."property_ownership_movements" to "authenticated";

grant truncate on table "public"."property_ownership_movements" to "authenticated";

grant update on table "public"."property_ownership_movements" to "authenticated";

grant delete on table "public"."property_ownership_movements" to "service_role";

grant insert on table "public"."property_ownership_movements" to "service_role";

grant references on table "public"."property_ownership_movements" to "service_role";

grant select on table "public"."property_ownership_movements" to "service_role";

grant trigger on table "public"."property_ownership_movements" to "service_role";

grant truncate on table "public"."property_ownership_movements" to "service_role";

grant update on table "public"."property_ownership_movements" to "service_role";

grant delete on table "public"."referral_rewards" to "anon";

grant insert on table "public"."referral_rewards" to "anon";

grant references on table "public"."referral_rewards" to "anon";

grant select on table "public"."referral_rewards" to "anon";

grant trigger on table "public"."referral_rewards" to "anon";

grant truncate on table "public"."referral_rewards" to "anon";

grant update on table "public"."referral_rewards" to "anon";

grant delete on table "public"."referral_rewards" to "authenticated";

grant insert on table "public"."referral_rewards" to "authenticated";

grant references on table "public"."referral_rewards" to "authenticated";

grant select on table "public"."referral_rewards" to "authenticated";

grant trigger on table "public"."referral_rewards" to "authenticated";

grant truncate on table "public"."referral_rewards" to "authenticated";

grant update on table "public"."referral_rewards" to "authenticated";

grant delete on table "public"."referral_rewards" to "service_role";

grant insert on table "public"."referral_rewards" to "service_role";

grant references on table "public"."referral_rewards" to "service_role";

grant select on table "public"."referral_rewards" to "service_role";

grant trigger on table "public"."referral_rewards" to "service_role";

grant truncate on table "public"."referral_rewards" to "service_role";

grant update on table "public"."referral_rewards" to "service_role";

grant delete on table "public"."referrals" to "anon";

grant insert on table "public"."referrals" to "anon";

grant references on table "public"."referrals" to "anon";

grant select on table "public"."referrals" to "anon";

grant trigger on table "public"."referrals" to "anon";

grant truncate on table "public"."referrals" to "anon";

grant update on table "public"."referrals" to "anon";

grant delete on table "public"."referrals" to "authenticated";

grant insert on table "public"."referrals" to "authenticated";

grant references on table "public"."referrals" to "authenticated";

grant select on table "public"."referrals" to "authenticated";

grant trigger on table "public"."referrals" to "authenticated";

grant truncate on table "public"."referrals" to "authenticated";

grant update on table "public"."referrals" to "authenticated";

grant delete on table "public"."referrals" to "service_role";

grant insert on table "public"."referrals" to "service_role";

grant references on table "public"."referrals" to "service_role";

grant select on table "public"."referrals" to "service_role";

grant trigger on table "public"."referrals" to "service_role";

grant truncate on table "public"."referrals" to "service_role";

grant update on table "public"."referrals" to "service_role";

grant delete on table "public"."user_vault" to "anon";

grant insert on table "public"."user_vault" to "anon";

grant references on table "public"."user_vault" to "anon";

grant select on table "public"."user_vault" to "anon";

grant trigger on table "public"."user_vault" to "anon";

grant truncate on table "public"."user_vault" to "anon";

grant update on table "public"."user_vault" to "anon";

grant delete on table "public"."user_vault" to "authenticated";

grant insert on table "public"."user_vault" to "authenticated";

grant references on table "public"."user_vault" to "authenticated";

grant select on table "public"."user_vault" to "authenticated";

grant trigger on table "public"."user_vault" to "authenticated";

grant truncate on table "public"."user_vault" to "authenticated";

grant update on table "public"."user_vault" to "authenticated";

grant delete on table "public"."user_vault" to "service_role";

grant insert on table "public"."user_vault" to "service_role";

grant references on table "public"."user_vault" to "service_role";

grant select on table "public"."user_vault" to "service_role";

grant trigger on table "public"."user_vault" to "service_role";

grant truncate on table "public"."user_vault" to "service_role";

grant update on table "public"."user_vault" to "service_role";

grant delete on table "public"."vault_transactions" to "anon";

grant insert on table "public"."vault_transactions" to "anon";

grant references on table "public"."vault_transactions" to "anon";

grant select on table "public"."vault_transactions" to "anon";

grant trigger on table "public"."vault_transactions" to "anon";

grant truncate on table "public"."vault_transactions" to "anon";

grant update on table "public"."vault_transactions" to "anon";

grant delete on table "public"."vault_transactions" to "authenticated";

grant insert on table "public"."vault_transactions" to "authenticated";

grant references on table "public"."vault_transactions" to "authenticated";

grant select on table "public"."vault_transactions" to "authenticated";

grant trigger on table "public"."vault_transactions" to "authenticated";

grant truncate on table "public"."vault_transactions" to "authenticated";

grant update on table "public"."vault_transactions" to "authenticated";

grant delete on table "public"."vault_transactions" to "service_role";

grant insert on table "public"."vault_transactions" to "service_role";

grant references on table "public"."vault_transactions" to "service_role";

grant select on table "public"."vault_transactions" to "service_role";

grant trigger on table "public"."vault_transactions" to "service_role";

grant truncate on table "public"."vault_transactions" to "service_role";

grant update on table "public"."vault_transactions" to "service_role";


--   create policy "Enable read access for all users"
--   on "public"."applications"
--   as permissive
--   for select
--   to public
-- using (true);



  create policy "Authenticated can read open orders (for buy flow)"
  on "public"."exit_window_orders"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Seller or admin full access to exit_window_orders"
  on "public"."exit_window_orders"
  as permissive
  for all
  to authenticated
using (((seller_user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum))))))
with check (((seller_user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum))))));



  create policy "Admin only insert/update/delete exit_window_property_prices"
  on "public"."exit_window_property_prices"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum)))))
with check ((EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum)))));



  create policy "Authenticated can read exit_window_property_prices"
  on "public"."exit_window_property_prices"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admin can insert exit_window_trades"
  on "public"."exit_window_trades"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum)))));



  create policy "Participants or admin can read exit_window_trades"
  on "public"."exit_window_trades"
  as permissive
  for select
  to authenticated
using (((seller_user_id = auth.uid()) OR (buyer_user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum))))));



  create policy "Admin only insert/update/delete exit_windows"
  on "public"."exit_windows"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum)))))
with check ((EXISTS ( SELECT 1
   FROM user_role ur
  WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum)))));



  create policy "Authenticated can read exit_windows"
  on "public"."exit_windows"
  as permissive
  for select
  to authenticated
using (true);



--   create policy "users can update thier own profiles"
--   on "public"."investment"
--   as permissive
--   for update
--   to public
-- using ((user_id = auth.uid()))
-- with check ((user_id = auth.uid()));



--   create policy "Admins can update membership activations"
--   on "public"."membership_activations"
--   as permissive
--   for update
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can view all membership activations"
--   on "public"."membership_activations"
--   as permissive
--   for select
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Users can create membership activations"
--   on "public"."membership_activations"
--   as permissive
--   for insert
--   to public
-- with check ((auth.uid() = user_id));



--   create policy "Users can view own membership activations"
--   on "public"."membership_activations"
--   as permissive
--   for select
--   to public
-- using ((auth.uid() = user_id));



--   create policy "Admin can update profiles"
--   on "public"."profile"
--   as permissive
--   for update
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))))
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Enable read access for all users"
--   on "public"."profile"
--   as permissive
--   for select
--   to public
-- using (true);



--   create policy "Enable insert for authenticated users only"
--   on "public"."property"
--   as permissive
--   for insert
--   to authenticated
-- with check (true);



--   create policy "all users can view rental properties"
--   on "public"."property"
--   as permissive
--   for select
--   to public
-- using ((property_type = 'rental'::property_type_enum));



--   create policy "Admin can insert property_ownership_movements"
--   on "public"."property_ownership_movements"
--   as permissive
--   for insert
--   to authenticated
-- with check ((EXISTS ( SELECT 1
--    FROM user_role ur
--   WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum)))));



--   create policy "User can read own movements or admin all"
--   on "public"."property_ownership_movements"
--   as permissive
--   for select
--   to authenticated
-- using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
--    FROM user_role ur
--   WHERE ((ur.id = auth.uid()) AND (ur.role = 'admin'::user_role_enum))))));



--   create policy "Admins can delete referral rewards"
--   on "public"."referral_rewards"
--   as permissive
--   for delete
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can insert referral rewards"
--   on "public"."referral_rewards"
--   as permissive
--   for insert
--   to public
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can update referral rewards"
--   on "public"."referral_rewards"
--   as permissive
--   for update
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))))
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can view all referral rewards"
--   on "public"."referral_rewards"
--   as permissive
--   for select
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Users can view their own referral rewards"
--   on "public"."referral_rewards"
--   as permissive
--   for select
--   to public
-- using ((user_id = auth.uid()));



--   create policy "Admins can delete referrals"
--   on "public"."referrals"
--   as permissive
--   for delete
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can insert referrals"
--   on "public"."referrals"
--   as permissive
--   for insert
--   to public
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can update referrals"
--   on "public"."referrals"
--   as permissive
--   for update
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))))
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can view all referrals"
--   on "public"."referrals"
--   as permissive
--   for select
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Users can view their own referrals as referee"
--   on "public"."referrals"
--   as permissive
--   for select
--   to public
-- using ((referee_id = auth.uid()));



--   create policy "Users can view their own referrals as referrer"
--   on "public"."referrals"
--   as permissive
--   for select
--   to public
-- using ((referrer_id = auth.uid()));



--   create policy "Admins can delete vaults"
--   on "public"."user_vault"
--   as permissive
--   for delete
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can insert vaults"
--   on "public"."user_vault"
--   as permissive
--   for insert
--   to public
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can update vaults"
--   on "public"."user_vault"
--   as permissive
--   for update
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))))
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can view all vaults"
--   on "public"."user_vault"
--   as permissive
--   for select
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Enable insert for authenticated users only"
--   on "public"."user_vault"
--   as permissive
--   for insert
--   to public
-- with check (true);



--   create policy "Users can update their own vault"
--   on "public"."user_vault"
--   as permissive
--   for update
--   to public
-- using ((user_id = auth.uid()))
-- with check ((user_id = auth.uid()));



--   create policy "Users can view their own vault"
--   on "public"."user_vault"
--   as permissive
--   for select
--   to public
-- using ((user_id = auth.uid()));



--   create policy "Admins can delete transactions"
--   on "public"."vault_transactions"
--   as permissive
--   for delete
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can insert transactions"
--   on "public"."vault_transactions"
--   as permissive
--   for insert
--   to public
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can update transactions"
--   on "public"."vault_transactions"
--   as permissive
--   for update
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))))
-- with check ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Admins can view all transactions"
--   on "public"."vault_transactions"
--   as permissive
--   for select
--   to public
-- using ((EXISTS ( SELECT 1
--    FROM user_role
--   WHERE ((user_role.id = auth.uid()) AND (user_role.role = 'admin'::user_role_enum)))));



--   create policy "Enable insert for authenticated users only"
--   on "public"."vault_transactions"
--   as permissive
--   for insert
--   to authenticated
-- with check (true);



--   create policy "Users can insert their own transactions"
--   on "public"."vault_transactions"
--   as permissive
--   for insert
--   to public
-- with check ((user_id = auth.uid()));



--   create policy "Users can view their own transactions"
--   on "public"."vault_transactions"
--   as permissive
--   for select
--   to public
-- using ((user_id = auth.uid()));



--   create policy "users can update their own row"
--   on "public"."vault_transactions"
--   as permissive
--   for update
--   to authenticated
-- using ((user_id = auth.uid()))
-- with check ((user_id = auth.uid()));

