import { z } from 'zod';

import { Constants } from '@/types/supabase';

/**
 * @deprecated Direct investment creation is deprecated.
 * All new investments should go through the vault system using deployFromVault action.
 * This schema is kept for backward compatibility only.
 */
export const createInvestmentSchema = z.object({
  propertyId: z.string(),
  amount: z.number(),
  paymentProofs: z.array(z.string()).optional(), // Made optional as vault deployments don't need payment proofs
});

export const updateInvestmentStatusSchema = z.object({
  id: z.string(),
  status: z.enum(Constants.public.Enums.investment_status_enum),
});
