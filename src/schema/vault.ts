import { z } from 'zod';

import { VAULT_TRANSACTION_TYPE_VALUES } from '@/utils/vault-transaction-types';

export const createVaultDepositSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  proof_images: z
    .array(z.string())
    .min(1, 'At least one proof image is required'),
});

export const deployFromVaultSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

export const updateVaultTransactionStatusSchema = z.object({
  id: z.string().min(1, 'Transaction ID is required'),
  status: z.enum(['pending', 'approved', 'rejected']),
  rejection_reason: z.string().optional(),
});

export const getVaultTransactionsSchema = z.object({
  type: z.enum(VAULT_TRANSACTION_TYPE_VALUES).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const createVaultWithdrawalSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
});