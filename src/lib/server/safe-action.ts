import { createSafeActionClient } from 'next-safe-action';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { createSupabaseAdminClient } from '../supabase/admin';

export const safeActionClient = createSafeActionClient({
  defaultValidationErrorsShape: 'flattened',
  handleServerError: (error) => error.message,
});

export const authActionClient = safeActionClient.use(async ({ next }) => {
  const supabase = await createSupabaseServerClient();
  const { data: authUser, error } = await supabase.auth.getUser();
  if (error || !authUser) throw new Error('Unauthorized');
  return next({ ctx: { supabase, authUser } });
});

export const adminActionClient = authActionClient.use(async ({ next }) => {
  const supabase = await createSupabaseServerClient();
  const { data: authUser, error } = await supabase.auth.getUser();
  if (error || !authUser) throw new Error('Unauthorized');

  const { data: userRole, error: roleError } = await supabase
    .from('user_role')
    .select('role')
    .eq('id', authUser.user.id)
    .single();

  if (roleError || userRole?.role !== 'admin')
    throw new Error('Unauthorized');

  return next({ ctx: { supabase, authUser } });
});

export const serviceRoleActionClient = adminActionClient.use(
  async ({ next }) => {
    const supabase = await createSupabaseAdminClient();
    return next({ ctx: { supabase } });
  },
);
