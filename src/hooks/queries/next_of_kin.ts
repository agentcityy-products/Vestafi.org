import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

export const useNextOfKin = ({ userId }: { userId?: string }) => {
  return useQuery({
    queryKey: ['next-of-kin', userId],
    queryFn: authQuery(async ({ supabase }) => {
      const { data, error } = await supabase
        .from('next_of_kin')
        .select('*')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    }),
    enabled: !!userId,
  });
};
