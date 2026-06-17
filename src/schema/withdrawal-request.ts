import { z } from 'zod';

import { Constants } from '@/types/supabase';

export const createWithdrawalRequestSchema = z.object({
  amount: z.number().min(1),
});

export const updateWithdrawalRequestSchema = z.object({
  id: z.string(),
  status: z.enum(Constants.public.Enums.withdrawal_status_enum),
  rejection_reason: z.string().optional(),
  payment_proof_url: z.string().optional(),
});
