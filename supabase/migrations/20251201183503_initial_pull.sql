

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."application_status_enum" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."application_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."investment_status_enum" AS ENUM (
    'pending',
    'successful',
    'rejected'
);


ALTER TYPE "public"."investment_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'investor',
    'admin'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE TYPE "public"."withdrawal_status_enum" AS ENUM (
    'rejected',
    'pending',
    'paid'
);


ALTER TYPE "public"."withdrawal_status_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_role_on_profile_creation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_role (id, role)
  VALUES (NEW.id, 'investor'::public.user_role_enum)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_role_on_profile_creation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."make_user_admin"("user_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."make_user_admin"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_email_trigger"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."send_email_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_role_to_auth_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."sync_role_to_auth_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_applications_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_applications_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "phone_country_code" "text" NOT NULL,
    "location" "text" NOT NULL,
    "savings" "text" NOT NULL,
    "why_vestafi" "text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."application_status_enum" DEFAULT 'pending'::"public"."application_status_enum" NOT NULL,
    "meeting_link_sent" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


COMMENT ON TABLE "public"."applications" IS 'Applications for VESTAFI membership';



COMMENT ON COLUMN "public"."applications"."id" IS 'Primary key';



COMMENT ON COLUMN "public"."applications"."full_name" IS 'Applicant full name';



COMMENT ON COLUMN "public"."applications"."email" IS 'Applicant email address';



COMMENT ON COLUMN "public"."applications"."phone" IS 'Applicant phone number';



COMMENT ON COLUMN "public"."applications"."phone_country_code" IS 'Phone country code';



COMMENT ON COLUMN "public"."applications"."location" IS 'Where the applicant lives';



COMMENT ON COLUMN "public"."applications"."savings" IS 'Savings capability response';



COMMENT ON COLUMN "public"."applications"."why_vestafi" IS 'Reasons for joining VESTAFI (array of selected options)';



COMMENT ON COLUMN "public"."applications"."created_at" IS 'Timestamp when the application was created';



COMMENT ON COLUMN "public"."applications"."updated_at" IS 'Timestamp when the application was last updated';



CREATE TABLE IF NOT EXISTS "public"."bank_info" (
    "profile_id" "uuid" NOT NULL,
    "bank_name" "text" NOT NULL,
    "account_number" "text" NOT NULL,
    "account_name" "text" NOT NULL
);


ALTER TABLE "public"."bank_info" OWNER TO "postgres";


COMMENT ON TABLE "public"."bank_info" IS 'The bank info of the investor';



COMMENT ON COLUMN "public"."bank_info"."profile_id" IS 'Primary key and foreign key to profile.id';



COMMENT ON COLUMN "public"."bank_info"."bank_name" IS 'Name of the bank';



COMMENT ON COLUMN "public"."bank_info"."account_number" IS 'Bank account number';



COMMENT ON COLUMN "public"."bank_info"."account_name" IS 'Name on the bank account';



CREATE TABLE IF NOT EXISTS "public"."investment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "property_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."investment_status_enum" DEFAULT 'pending'::"public"."investment_status_enum" NOT NULL,
    "proof_images" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "receipt_url" "text"
);


ALTER TABLE "public"."investment" OWNER TO "postgres";


COMMENT ON TABLE "public"."investment" IS 'The investment made by the investor in a property';



COMMENT ON COLUMN "public"."investment"."id" IS 'Primary key';



COMMENT ON COLUMN "public"."investment"."user_id" IS 'Foreign key to profile.id';



COMMENT ON COLUMN "public"."investment"."property_id" IS 'Foreign key to property.id';



COMMENT ON COLUMN "public"."investment"."amount" IS 'Investment amount';



COMMENT ON COLUMN "public"."investment"."created_at" IS 'Timestamp when the investment was made';



CREATE TABLE IF NOT EXISTS "public"."monthly_rent" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "month" "date" NOT NULL,
    "total_rent_collected" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."monthly_rent" OWNER TO "postgres";


COMMENT ON TABLE "public"."monthly_rent" IS 'The monthly rent on each property which is added by the admin';



COMMENT ON COLUMN "public"."monthly_rent"."id" IS 'Primary key';



COMMENT ON COLUMN "public"."monthly_rent"."property_id" IS 'Foreign key to property.id';



COMMENT ON COLUMN "public"."monthly_rent"."month" IS 'Month of the rent collection';



COMMENT ON COLUMN "public"."monthly_rent"."total_rent_collected" IS 'Total rent collected for the month';



CREATE TABLE IF NOT EXISTS "public"."property" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" numeric NOT NULL,
    "minimum_monthly_rent" numeric NOT NULL,
    "maximum_monthly_rent" numeric NOT NULL,
    "images" "text"[] NOT NULL,
    "address_line_1" "text" NOT NULL,
    "address_line_2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "country" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "allow_first_time_investors" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."property" OWNER TO "postgres";


COMMENT ON TABLE "public"."property" IS 'The property which is listed by the admin';



COMMENT ON COLUMN "public"."property"."id" IS 'Primary key';



COMMENT ON COLUMN "public"."property"."title" IS 'Property title';



COMMENT ON COLUMN "public"."property"."description" IS 'Property description';



COMMENT ON COLUMN "public"."property"."price" IS 'Property price';



COMMENT ON COLUMN "public"."property"."minimum_monthly_rent" IS 'Minimum monthly rent';



COMMENT ON COLUMN "public"."property"."maximum_monthly_rent" IS 'Maximum monthly rent';



COMMENT ON COLUMN "public"."property"."images" IS 'Array of property image URLs';



COMMENT ON COLUMN "public"."property"."address_line_1" IS 'Primary address line';



COMMENT ON COLUMN "public"."property"."address_line_2" IS 'Secondary address line';



COMMENT ON COLUMN "public"."property"."city" IS 'City';



COMMENT ON COLUMN "public"."property"."state" IS 'State';



COMMENT ON COLUMN "public"."property"."country" IS 'Country';



COMMENT ON COLUMN "public"."property"."zip_code" IS 'Zip code';



COMMENT ON COLUMN "public"."property"."created_at" IS 'Timestamp when the property was created';



COMMENT ON COLUMN "public"."property"."allow_first_time_investors" IS 'Indicates whether a property is available for investors who haven''t invested before';



CREATE OR REPLACE VIEW "public"."listings_view" AS
 SELECT "p"."id",
    "p"."title",
    "p"."description",
    "p"."price",
    "p"."minimum_monthly_rent",
    "p"."maximum_monthly_rent",
    "p"."images",
    "p"."address_line_1",
    "p"."address_line_2",
    "p"."city",
    "p"."state",
    "p"."country",
    "p"."zip_code",
    "p"."allow_first_time_investors",
    "p"."created_at",
    COALESCE("inv"."total_investment", (0)::numeric) AS "total_investment",
        CASE
            WHEN ("p"."price" > (0)::numeric) THEN ((COALESCE("inv"."total_investment", (0)::numeric) / "p"."price") * (100)::numeric)
            ELSE (0)::numeric
        END AS "investment_percentage",
    "rent"."average_rent_6_months"
   FROM (("public"."property" "p"
     LEFT JOIN ( SELECT "investment"."property_id",
            "sum"("investment"."amount") AS "total_investment"
           FROM "public"."investment"
          WHERE ("investment"."status" = ANY (ARRAY['successful'::"public"."investment_status_enum", 'pending'::"public"."investment_status_enum"]))
          GROUP BY "investment"."property_id") "inv" ON (("p"."id" = "inv"."property_id")))
     LEFT JOIN ( SELECT "monthly_rent"."property_id",
            "avg"("monthly_rent"."total_rent_collected") AS "average_rent_6_months"
           FROM "public"."monthly_rent"
          WHERE ("monthly_rent"."month" >= (CURRENT_DATE - '6 mons'::interval))
          GROUP BY "monthly_rent"."property_id") "rent" ON (("p"."id" = "rent"."property_id")));


ALTER TABLE "public"."listings_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monthly_return" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "month" "date" NOT NULL,
    "amount" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "property_id" "uuid",
    "user_id" "uuid"
);


ALTER TABLE "public"."monthly_return" OWNER TO "postgres";


COMMENT ON TABLE "public"."monthly_return" IS 'The monthly returns on each property for each investor distributed by the admin';



COMMENT ON COLUMN "public"."monthly_return"."id" IS 'Primary key';



COMMENT ON COLUMN "public"."monthly_return"."month" IS 'Month of the return distribution';



COMMENT ON COLUMN "public"."monthly_return"."amount" IS 'Amount distributed to the investor';



CREATE TABLE IF NOT EXISTS "public"."next_of_kin" (
    "id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "relationship" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "country_code" "text"
);


ALTER TABLE "public"."next_of_kin" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."owned_properties_view" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "title",
    NULL::"text" AS "description",
    NULL::numeric AS "price",
    NULL::numeric AS "minimum_monthly_rent",
    NULL::numeric AS "maximum_monthly_rent",
    NULL::"text"[] AS "images",
    NULL::"text" AS "address_line_1",
    NULL::"text" AS "address_line_2",
    NULL::"text" AS "city",
    NULL::"text" AS "state",
    NULL::"text" AS "country",
    NULL::"text" AS "zip_code",
    NULL::timestamp with time zone AS "created_at",
    NULL::"uuid" AS "user_id",
    NULL::"text" AS "status",
    NULL::numeric AS "successful_investment",
    NULL::numeric AS "pending_investment",
    NULL::numeric AS "ownership_percentage",
    NULL::numeric AS "minimum_monthly_return",
    NULL::numeric AS "maximum_monthly_return",
    NULL::timestamp with time zone AS "latest_investment_date";


ALTER TABLE "public"."owned_properties_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "country_code" "text" NOT NULL
);


ALTER TABLE "public"."profile" OWNER TO "postgres";


COMMENT ON TABLE "public"."profile" IS 'The profile of the investor';



COMMENT ON COLUMN "public"."profile"."id" IS 'Primary key and foreign key to auth.users.id';



COMMENT ON COLUMN "public"."profile"."email" IS 'User email address';



COMMENT ON COLUMN "public"."profile"."first_name" IS 'User first name';



COMMENT ON COLUMN "public"."profile"."last_name" IS 'User last name';



COMMENT ON COLUMN "public"."profile"."phone" IS 'User phone number';



COMMENT ON COLUMN "public"."profile"."created_at" IS 'Timestamp when the profile was created';



CREATE TABLE IF NOT EXISTS "public"."user_role" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "role" "public"."user_role_enum" DEFAULT 'investor'::"public"."user_role_enum" NOT NULL
);


ALTER TABLE "public"."user_role" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."withdrawal_request" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "status" "public"."withdrawal_status_enum" DEFAULT 'pending'::"public"."withdrawal_status_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payment_proof_url" "text",
    "rejection_reason" "text"
);


ALTER TABLE "public"."withdrawal_request" OWNER TO "postgres";


COMMENT ON TABLE "public"."withdrawal_request" IS 'The withdrawal request made by the investor for the amount which they have in their vault';



COMMENT ON COLUMN "public"."withdrawal_request"."id" IS 'Primary key';



COMMENT ON COLUMN "public"."withdrawal_request"."user_id" IS 'Foreign key to profile.id';



COMMENT ON COLUMN "public"."withdrawal_request"."amount" IS 'Withdrawal amount';



COMMENT ON COLUMN "public"."withdrawal_request"."status" IS 'Status of the withdrawal request';



COMMENT ON COLUMN "public"."withdrawal_request"."created_at" IS 'Timestamp when the withdrawal request was created';



COMMENT ON COLUMN "public"."withdrawal_request"."updated_at" IS 'Timestamp when the withdrawal request was last updated';



CREATE OR REPLACE VIEW "public"."vault_view" WITH ("security_invoker"='on') AS
 SELECT "p"."id" AS "profile_id",
    COALESCE("earnings"."total_earnings", (0)::numeric) AS "total_earnings",
    COALESCE("withdrawals"."total_withdrawn", (0)::numeric) AS "total_withdrawn",
    (COALESCE("earnings"."total_earnings", (0)::numeric) - COALESCE("withdrawals"."total_withdrawn", (0)::numeric)) AS "total_amount_in_vault"
   FROM (("public"."profile" "p"
     LEFT JOIN ( SELECT "monthly_return"."user_id",
            "sum"("monthly_return"."amount") AS "total_earnings"
           FROM "public"."monthly_return"
          GROUP BY "monthly_return"."user_id") "earnings" ON (("earnings"."user_id" = "p"."id")))
     LEFT JOIN ( SELECT "withdrawal_request"."user_id",
            "sum"(
                CASE
                    WHEN ("withdrawal_request"."status" = 'paid'::"public"."withdrawal_status_enum") THEN "withdrawal_request"."amount"
                    ELSE (0)::numeric
                END) AS "total_withdrawn"
           FROM "public"."withdrawal_request"
          GROUP BY "withdrawal_request"."user_id") "withdrawals" ON (("withdrawals"."user_id" = "p"."id")));


ALTER TABLE "public"."vault_view" OWNER TO "postgres";


ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_info"
    ADD CONSTRAINT "bank_info_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."investment"
    ADD CONSTRAINT "investment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_rent"
    ADD CONSTRAINT "monthly_rent_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_return"
    ADD CONSTRAINT "monthly_return_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."next_of_kin"
    ADD CONSTRAINT "next_of_kin_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_role"
    ADD CONSTRAINT "profile_role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property"
    ADD CONSTRAINT "property_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."withdrawal_request"
    ADD CONSTRAINT "withdrawal_request_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE VIEW "public"."owned_properties_view" WITH ("security_invoker"='on') AS
 SELECT "p"."id",
    "p"."title",
    "p"."description",
    "p"."price",
    "p"."minimum_monthly_rent",
    "p"."maximum_monthly_rent",
    "p"."images",
    "p"."address_line_1",
    "p"."address_line_2",
    "p"."city",
    "p"."state",
    "p"."country",
    "p"."zip_code",
    "p"."created_at",
    "i_user"."user_id",
        CASE
            WHEN ("count"(
            CASE
                WHEN ("i_user"."status" = 'successful'::"public"."investment_status_enum") THEN 1
                ELSE NULL::integer
            END) > 0) THEN 'successful'::"text"
            ELSE 'pending'::"text"
        END AS "status",
    COALESCE("sum"(
        CASE
            WHEN ("i_user"."status" = 'successful'::"public"."investment_status_enum") THEN "i_user"."amount"
            ELSE (0)::numeric
        END), (0)::numeric) AS "successful_investment",
    COALESCE("sum"(
        CASE
            WHEN ("i_user"."status" = 'pending'::"public"."investment_status_enum") THEN "i_user"."amount"
            ELSE (0)::numeric
        END), (0)::numeric) AS "pending_investment",
    "round"(((COALESCE("sum"(
        CASE
            WHEN ("i_user"."status" = 'successful'::"public"."investment_status_enum") THEN "i_user"."amount"
            ELSE (0)::numeric
        END), (0)::numeric) / "p"."price") * (100)::numeric), 2) AS "ownership_percentage",
    "round"((("p"."minimum_monthly_rent" * COALESCE("sum"(
        CASE
            WHEN ("i_user"."status" = 'successful'::"public"."investment_status_enum") THEN "i_user"."amount"
            ELSE (0)::numeric
        END), (0)::numeric)) / "p"."price"), 2) AS "minimum_monthly_return",
    "round"((("p"."maximum_monthly_rent" * COALESCE("sum"(
        CASE
            WHEN ("i_user"."status" = 'successful'::"public"."investment_status_enum") THEN "i_user"."amount"
            ELSE (0)::numeric
        END), (0)::numeric)) / "p"."price"), 2) AS "maximum_monthly_return",
    "max"("i_user"."created_at") AS "latest_investment_date"
   FROM ("public"."property" "p"
     JOIN "public"."investment" "i_user" ON (("p"."id" = "i_user"."property_id")))
  WHERE ("i_user"."status" = ANY (ARRAY['successful'::"public"."investment_status_enum", 'pending'::"public"."investment_status_enum"]))
  GROUP BY "p"."id", "i_user"."user_id";



CREATE OR REPLACE TRIGGER "create_user_role_trigger" AFTER INSERT ON "public"."profile" FOR EACH ROW EXECUTE FUNCTION "public"."create_user_role_on_profile_creation"();



CREATE OR REPLACE TRIGGER "sync_role_to_auth_trigger" AFTER INSERT OR UPDATE OF "role" ON "public"."user_role" FOR EACH ROW EXECUTE FUNCTION "public"."sync_role_to_auth_metadata"();



CREATE OR REPLACE TRIGGER "update_applications_updated_at_trigger" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_applications_updated_at"();



CREATE OR REPLACE TRIGGER "update_next_of_kin_updated_at" BEFORE UPDATE ON "public"."next_of_kin" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."bank_info"
    ADD CONSTRAINT "bank_info_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investment"
    ADD CONSTRAINT "investment_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."investment"
    ADD CONSTRAINT "investment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."monthly_rent"
    ADD CONSTRAINT "monthly_rent_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."monthly_return"
    ADD CONSTRAINT "monthly_return_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."monthly_return"
    ADD CONSTRAINT "monthly_return_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."next_of_kin"
    ADD CONSTRAINT "next_of_kin_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_role"
    ADD CONSTRAINT "profile_role_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."withdrawal_request"
    ADD CONSTRAINT "withdrawal_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Admin can select any next of kin" ON "public"."next_of_kin" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_role" "ur"
  WHERE (("ur"."id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Admin can update investment" ON "public"."investment" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Anyone can insert applications" ON "public"."applications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can view properties" ON "public"."property" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable all for users based on user_id" ON "public"."next_of_kin" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Only admin can create monthly rent" ON "public"."monthly_rent" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Only admin can create monthly returns" ON "public"."monthly_return" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Only admin can create properties" ON "public"."property" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Only admin can delete properties" ON "public"."property" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Only admin can update applications" ON "public"."applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Only admin can update properties" ON "public"."property" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Only admin can view applications" ON "public"."applications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Only admin can view monthly rent" ON "public"."monthly_rent" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum")))));



CREATE POLICY "Select own role" ON "public"."user_role" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can create their own bank info" ON "public"."bank_info" FOR INSERT WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own investments" ON "public"."investment" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own profile" ON "public"."profile" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can create their own withdrawal requests" ON "public"."withdrawal_request" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own bank info" ON "public"."bank_info" FOR UPDATE USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."profile" FOR UPDATE USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can update their own withdrawal requests or admin can upd" ON "public"."withdrawal_request" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum"))))));



CREATE POLICY "Users can view their own bank info or admin can view all" ON "public"."bank_info" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum"))))));



CREATE POLICY "Users can view their own investments or admin can view all" ON "public"."investment" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum"))))));



CREATE POLICY "Users can view their own profile or admin can view all" ON "public"."profile" FOR SELECT USING ((("id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum"))))));



CREATE POLICY "Users can view their own returns or admin can view all" ON "public"."monthly_return" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum"))))));



CREATE POLICY "Users can view their own withdrawal requests or admin can view " ON "public"."withdrawal_request" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_role"
  WHERE (("user_role"."id" = "auth"."uid"()) AND ("user_role"."role" = 'admin'::"public"."user_role_enum"))))));



ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bank_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."investment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monthly_rent" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monthly_return" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."next_of_kin" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_role" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."withdrawal_request" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;













































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;











































































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;












SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;







































GRANT ALL ON FUNCTION "public"."create_user_role_on_profile_creation"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_role_on_profile_creation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_role_on_profile_creation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."make_user_admin"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."make_user_admin"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."make_user_admin"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_email_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_email_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_email_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_role_to_auth_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_role_to_auth_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_role_to_auth_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_applications_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_applications_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_applications_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."bank_info" TO "anon";
GRANT ALL ON TABLE "public"."bank_info" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_info" TO "service_role";



GRANT ALL ON TABLE "public"."investment" TO "anon";
GRANT ALL ON TABLE "public"."investment" TO "authenticated";
GRANT ALL ON TABLE "public"."investment" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_rent" TO "anon";
GRANT ALL ON TABLE "public"."monthly_rent" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_rent" TO "service_role";



GRANT ALL ON TABLE "public"."property" TO "anon";
GRANT ALL ON TABLE "public"."property" TO "authenticated";
GRANT ALL ON TABLE "public"."property" TO "service_role";



GRANT ALL ON TABLE "public"."listings_view" TO "anon";
GRANT ALL ON TABLE "public"."listings_view" TO "authenticated";
GRANT ALL ON TABLE "public"."listings_view" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_return" TO "anon";
GRANT ALL ON TABLE "public"."monthly_return" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_return" TO "service_role";



GRANT ALL ON TABLE "public"."next_of_kin" TO "anon";
GRANT ALL ON TABLE "public"."next_of_kin" TO "authenticated";
GRANT ALL ON TABLE "public"."next_of_kin" TO "service_role";



GRANT ALL ON TABLE "public"."owned_properties_view" TO "anon";
GRANT ALL ON TABLE "public"."owned_properties_view" TO "authenticated";
GRANT ALL ON TABLE "public"."owned_properties_view" TO "service_role";



GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";



GRANT ALL ON TABLE "public"."user_role" TO "anon";
GRANT ALL ON TABLE "public"."user_role" TO "authenticated";
GRANT ALL ON TABLE "public"."user_role" TO "service_role";



GRANT ALL ON TABLE "public"."withdrawal_request" TO "anon";
GRANT ALL ON TABLE "public"."withdrawal_request" TO "authenticated";
GRANT ALL ON TABLE "public"."withdrawal_request" TO "service_role";



GRANT ALL ON TABLE "public"."vault_view" TO "anon";
GRANT ALL ON TABLE "public"."vault_view" TO "authenticated";
GRANT ALL ON TABLE "public"."vault_view" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
