import { useQuery } from '@tanstack/react-query';

import { getVaultBalance, getVaultTransactions } from '@/actions/vault';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { VaultTransactionRow } from '@/types/dao';

type VaultBalanceData = {
  balance: number;
  total_deposited: number;
  total_deployed: number;
};

// Get vault balance
export const useVaultBalance = () => {
  return useQuery<VaultBalanceData>({
    queryKey: [QueryKeys.VAULT, 'balance'],
    queryFn: async (): Promise<VaultBalanceData> => {
      const result = await getVaultBalance();
      if (!result || !('data' in result) || !result.data) {
        throw new Error('Failed to fetch vault balance');
      }
      // Extract data from the result object - TypeScript needs explicit assertion
      return result.data.data as unknown as VaultBalanceData;
    },
  });
};

type VaultTransactionWithProperty = VaultTransactionRow & {
  property?: { title: string | null; images?: string[] | null } | null;
};

// Get vault transactions with optional filters
export const useVaultTransactions = (filters?: {
  type?: 'deposit' | 'deploy' | 'withdrawal';
  status?: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<VaultTransactionWithProperty[]>({
    queryKey: [QueryKeys.VAULT, 'transactions', filters],
    queryFn: async (): Promise<VaultTransactionWithProperty[]> => {
      const result = await getVaultTransactions(filters || {});
      if (!result || !('data' in result) || !result.data) {
        throw new Error('Failed to fetch vault transactions');
      }
      // Extract data from the result object - TypeScript needs explicit assertion
      return result.data.data as unknown as VaultTransactionWithProperty[];
    },
  });
};

// Legacy hook for vault view (keeping for backward compatibility)
export const useVault = () => {
  return useQuery({
    queryKey: [QueryKeys.VAULT],
    queryFn: authQuery(async ({ supabase, user }) => {
      const { data, error } = await supabase
        .from('vault_view')
        .select('*')
        .eq('profile_id', user.id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }),
  });
};
