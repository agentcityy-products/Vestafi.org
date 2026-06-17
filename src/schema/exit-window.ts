import { z } from 'zod';

export const exitWindowStatusEnum = z.enum(['draft', 'active', 'ended']);

export const createExitWindowSchema = z.object({
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
});
export const updateExitWindowSchema = z.object({
  id: z.string().uuid(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  status: exitWindowStatusEnum.optional(),
});
export const setExitWindowPropertyPricesSchema = z.object({
  exit_window_id: z.string().uuid(),
  prices: z.array(
    z.object({ property_id: z.string().uuid(), exit_price: z.number().min(0.01) }),
  ),
});

export const createExitOrderSchema = z.object({
  exitWindowId: z.string().uuid(),
  propertyId: z.string().uuid(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

export const buyFromExitOrderSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

export const listExitOrdersSchema = z.object({
  exitWindowId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  status: z.enum(['open', 'partially_filled']).optional(),
});

export const cancelExitOrderSchema = z.object({
  orderId: z.string().uuid(),
});

/** Property-scoped exit-window buy UI (rent / distribution stats). */
export const exitWindowPropertyIdSchema = z.object({
  propertyId: z.string().uuid(),
});
