import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

/**
 * Get total rental income balance for the current user
 * This is the sum of all monthly_return amounts minus all paid withdrawals
 * @returns Total available balance earned from rent
 */
export const useRentalIncomeBalance = () => {
  return useQuery({
    queryKey: [QueryKeys.RENTAL_INCOME_BALANCE],
    queryFn: authQuery(async ({ supabase, user }) => {
      // Get all monthly returns for the user
      const { data: monthlyReturns, error: returnsError } = await supabase
        .from('monthly_return')
        .select('amount')
        .eq('user_id', user.id);

      if (returnsError) throw new Error(returnsError.message);

      // Sum all monthly return amounts
      const totalEarned =
        monthlyReturns?.reduce((acc, curr) => acc + (curr.amount ?? 0), 0) ?? 0;

      // Get all paid withdrawals for the user
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_request')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      if (withdrawalsError) throw new Error(withdrawalsError.message);

      // Sum all withdrawal amounts
      const totalWithdrawn =
        withdrawals?.reduce((acc, curr) => acc + (curr.amount ?? 0), 0) ?? 0;

      // Calculate net balance
      const balance = totalEarned - totalWithdrawn;

      return balance;
    }),
  });
};

