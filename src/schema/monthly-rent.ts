import { z } from 'zod';

export const createMonthlyRentSchema = z.object({
  propertyId: z.string(),
  month: z.string(),
  totalRentCollected: z.number(),
});

export type CreateMonthlyRentSchema = z.infer<typeof createMonthlyRentSchema>;
