import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

type UseWithdrawalRequestsProps = {
  page?: number;
  pageSize?: number;
};

export const useAllWithdrawalRequests = ({
  page = 1,
  pageSize = 10,
}: UseWithdrawalRequestsProps) => {
  return useQuery({
    queryKey: [QueryKeys.ALL_WITHDRAWAL_REQUESTS, { page, pageSize }],
    queryFn: authQuery(async ({ supabase }) => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('withdrawal_request')
        .select(
          `
              *,
              user:profile!withdrawal_request_user_id_fkey (
                *,
                bank:bank_info (*)
              )
            `,
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(from, to)
        .limit(pageSize);
      if (error) throw new Error(error.message);
      return { data, count };
    }),
    placeholderData: keepPreviousData,
  });
};

export const useMyWithdrawalRequests = ({
  page = 1,
  pageSize = 10,
}: UseWithdrawalRequestsProps) => {
  return useQuery({
    queryKey: [QueryKeys.USER_WITHDRAWAL_REQUESTS, { page, pageSize }],
    queryFn: authQuery(async ({ supabase, user }) => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('withdrawal_request')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)
        .limit(pageSize);
      if (error) throw new Error(error.message);
      return { data, count };
    }),
    placeholderData: keepPreviousData,
  });
};

export const useApprovedWithdrawals = () => {
  return useQuery({
    queryKey: [QueryKeys.APPROVED_WITHDRAWALS],
    queryFn: authQuery(async ({ supabase, user }) => {
      const { data, error } = await supabase
        .from('withdrawal_request')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid');
      if (error) throw new Error(error.message);

      const totalAmount =
        data?.reduce((acc, curr) => acc + (curr.amount ?? 0), 0) ?? 0;

      return totalAmount;
    }),
  });
};