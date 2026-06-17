import * as z from 'zod';

export const getListingsSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(10),
  search: z.string().default(''),
});

export const getListingByIdSchema = z.object({
  id: z.string().min(1, 'Listing ID is required'),
});

export type GetListingsParams = z.infer<typeof getListingsSchema>;
export type GetListingByIdParams = z.infer<typeof getListingByIdSchema>;
