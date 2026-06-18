DROP POLICY IF EXISTS "Users can create their own profile"
ON public.profile;

CREATE POLICY "Users can create their own profile"
ON public.profile
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile"
ON public.profile;

CREATE POLICY "Users can update their own profile"
ON public.profile
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own profile or admin can view all"
ON public.profile;

CREATE POLICY "Users can view their own profile or admin can view all"
ON public.profile
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.user_role
    WHERE user_role.id = auth.uid()
      AND user_role.role = 'admin'::public.user_role_enum
  )
);

DROP POLICY IF EXISTS "Admin can update profiles"
ON public.profile;

CREATE POLICY "Admin can update profiles"
ON public.profile
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_role
    WHERE user_role.id = auth.uid()
      AND user_role.role = 'admin'::public.user_role_enum
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_role
    WHERE user_role.id = auth.uid()
      AND user_role.role = 'admin'::public.user_role_enum
  )
);
