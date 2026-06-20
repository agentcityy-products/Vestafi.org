import { z } from 'zod';

export const ownershipPaymentMethods = ['bank_transfer', 'vault'] as const;

export const createOwnershipCheckoutSchema = z.object({
  propertyId: z.string().uuid(),
  ownershipAmount: z.number().positive(),
  paymentMethod: z.enum(ownershipPaymentMethods),
  proofImages: z.array(z.string()).default([]),
});

export const getMyOwnershipReservationsSchema = z.object({
  propertyId: z.string().uuid().optional(),
});

export type OwnershipPaymentMethod = (typeof ownershipPaymentMethods)[number];
