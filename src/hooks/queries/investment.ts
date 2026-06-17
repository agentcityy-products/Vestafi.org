import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMyStakes, getTotalInvested } from '@/actions/investment';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { InvestmentStatus } from '@/types/dao';

type UseInvestmentsProps = {
  status?: InvestmentStatus[];
};

export const useInvestments = ({
  status = ['pending', 'successful'],
}: UseInvestmentsProps) => {
  return useQuery({
    queryKey: [QueryKeys.INVESTMENTS, status],
    queryFn: authQuery(
      async ({ supabase }) => {
        const { data, error } = await supabase
          .from('investment')
          .select('*, property:property_id(*), user:user_id(*)')
          .in('status', status)
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
      },
      { userType: ['admin'] },
    ),
    placeholderData: keepPreviousData,
  });
};

export const useTotalInvested = () => {
  return useQuery({
    queryKey: [QueryKeys.TOTAL_INVESTED],
    queryFn: () => getTotalInvested(),
  });
};

export const useInvestmentsByUser = () => {
  return useQuery({
    queryKey: [QueryKeys.INVESTMENTS, 'by-user'],
    queryFn: authQuery(async ({ supabase, user }) => {
      const { data, error } = await supabase
        .from('investment')
        .select('*, property:property_id(*), user:user_id(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    }),
    initialData: [],
  });
};

export const useMyStakes = () => {
  return useQuery({
    queryKey: [QueryKeys.MY_STAKES],
    queryFn: () => getMyStakes(),
    initialData: [],
  });
};
