CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  user_profile_id uuid;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id
  INTO user_profile_id
  FROM public.profile
  WHERE email = user_email;

  IF user_profile_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.user_role
  SET role = 'admin'::public.user_role_enum
  WHERE id = user_profile_id;

  RETURN FOUND;
END;
$function$;

REVOKE ALL ON FUNCTION public.make_user_admin(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.make_user_admin(text) FROM anon;
REVOKE ALL ON FUNCTION public.make_user_admin(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.make_user_admin(text) TO service_role;

CREATE OR REPLACE FUNCTION public.sync_role_to_auth_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;

UPDATE auth.users AS users
SET raw_app_meta_data =
  COALESCE(users.raw_app_meta_data, '{}'::jsonb) ||
  jsonb_build_object('role', roles.role)
FROM public.user_role AS roles
WHERE roles.id = users.id;
