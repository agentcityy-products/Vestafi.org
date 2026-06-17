import { z } from 'zod';

export const createMembershipActivationSchema = z.object({
  proof_images: z
    .array(z.string())
    .min(1, 'At least one payment proof is required'),
});

export const updateMembershipActivationStatusSchema = z.object({
  id: z.string().uuid('Invalid activation request ID'),
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z
    .string()
    .min(1, 'Rejection reason is required')
    .optional()
    .refine(
      (val) => {
        // If status is 'rejected', rejection_reason must be provided
        // This will be checked in the action itself
        return true;
      },
      {
        message: 'Rejection reason is required when rejecting an activation request',
      },
    ),
});

export const getMembershipActivationsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  search: z.string().optional(),
});

