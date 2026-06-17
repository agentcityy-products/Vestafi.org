import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

export const useProfile = () => {
  return useQuery({
    queryKey: [QueryKeys.PROFILE],
    queryFn: authQuery(async ({ supabase, user }) => {
      const { data, error } = await supabase
        .from('profile')
        .select('*, bank_info(*), next_of_kin(*)')
        .eq('id', user.id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }),
  });
};

export const useLoggedInUser = () => {
  return useQuery({
    queryKey: [QueryKeys.LOGGED_IN_USER],
    queryFn: authQuery(async ({ user }) => {
      return user;
    }),
    retry: false,
  });
};
