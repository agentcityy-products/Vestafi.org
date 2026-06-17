import { z } from 'zod';

export const propertyFormSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(2, {
      message: 'Title must be at least 2 characters.',
    }),
    description: z.string().min(10, {
      message: 'Description must be at least 10 characters.',
    }),
    price: z.coerce.number().positive({
      message: 'Price must be a positive number.',
    }),
    minimum_monthly_rent: z.coerce.number().positive({
      message: 'Minimum monthly rent must be a positive number.',
    }),
    maximum_monthly_rent: z.coerce.number().positive({
      message: 'Maximum monthly rent must be a positive number.',
    }),
    address_line_1: z.string().min(2, {
      message: 'Address line 1 is required.',
    }),
    address_line_2: z.string().nullable().optional(),
    city: z.string().min(2, {
      message: 'City is required.',
    }),
    state: z.string().min(2, {
      message: 'State is required.',
    }),
    zip_code: z.string().min(2, {
      message: 'Zip code is required.',
    }),
    country: z.string().min(2, {
      message: 'Country is required.',
    }),
    images: z.array(z.string()).min(1, {
      message: 'At least one image is required.',
    }),
    allow_first_time_investors: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // min rent must be less than max rent
      return data.minimum_monthly_rent < data.maximum_monthly_rent;
    },
    {
      message: 'Minimum monthly rent must be less than maximum monthly rent.',
      path: ['minimum_monthly_rent'],
    },
  );

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
