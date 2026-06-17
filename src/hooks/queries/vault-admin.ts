import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { getVaultTransactionsSchema } from '@/schema/vault';
import { getAllUserVaults, getAllVaultTransactions } from '@/actions/vault';

import { QueryKeys } from '@/constants/query-keys';

import { VaultTransactionRow } from '@/types/dao';

type VaultTransactionWithRelations = VaultTransactionRow & {
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    bank_info?: {
      bank_name: string;
      account_number: string;
      account_name: string;
    } | null;
  } | null;
  property?: { title: string | null } | null;
};

type GetAllVaultTransactionsParams = z.infer<
  typeof getVaultTransactionsSchema
> & {
  userId?: string;
};

// Get all vault transactions (Admin only)
export const useAllVaultTransactions = (
  filters?: GetAllVaultTransactionsParams,
) => {
  return useQuery({
    queryKey: [QueryKeys.VAULT, 'admin', 'transactions', filters],
    queryFn: async (): Promise<VaultTransactionWithRelations[]> => {
      const result = await getAllVaultTransactions(filters || {});
      if (!result || !('data' in result) || !result.data) {
        throw new Error('Failed to fetch vault transactions');
      }
      // The action returns { success: true, data: [...] }
      // So result.data is { success: true, data: [...] }
      // And result.data.data is the actual array
      const actionData = result.data as { success: boolean; data: unknown };
      if (!actionData.data || !Array.isArray(actionData.data)) {
        throw new Error('Invalid data structure from vault transactions');
      }
      return actionData.data as unknown as VaultTransactionWithRelations[];
    },
  });
};

// Get all user vaults (Admin only)
export const useAllUserVaults = () => {
  return useQuery({
    queryKey: [QueryKeys.VAULT, 'admin', 'user-vaults'],
    queryFn: async () => {
      const result = await getAllUserVaults();
      if (!result || !('data' in result) || !result.data) {
        throw new Error('Failed to fetch user vaults');
      }
      return result.data;
    },
  });
};
