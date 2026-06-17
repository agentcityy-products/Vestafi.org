import { z } from 'zod';

export const rentalPropertyFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  price: z.coerce.number().positive({
    message: 'Price per night must be a positive number.',
  }),
  price_usd: z.coerce.number().optional(), // Read-only, calculated field
  address_line_1: z.string().min(2, {
    message: 'Address line 1 is required.',
  }),
  address_line_2: z.string().nullable().optional(),
  city: z.string().min(2, {
    message: 'City is required.',
  }),
  country: z.string().min(2, {
    message: 'Country is required.',
  }),
  images: z.array(z.string()).min(4, {
    message: 'At least 4 images are required.',
  }),
  owns_or_authorized: z.boolean().refine((val) => val === true, {
    message:
      'You must confirm that you own or are authorized to manage this apartment.',
  }),
  agrees_to_review: z.boolean().refine((val) => val === true, {
    message: 'You must agree to Zenolius/Vestafi review and verification.',
  }),
  ownership_proof: z.array(z.string()).optional(),
});

export type RentalPropertyFormValues = z.infer<typeof rentalPropertyFormSchema>;

// Schema for admin editing rental properties (excludes images, ownership_proof, and boolean confirmations)
export const updateRentalPropertySchema = z.object({
  propertyId: z.string().uuid(),
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  price: z.coerce.number().positive({
    message: 'Price per night must be a positive number.',
  }),
  address_line_1: z.string().min(2, {
    message: 'Address line 1 is required.',
  }),
  address_line_2: z.string().nullable().optional(),
  city: z.string().min(2, {
    message: 'City is required.',
  }),
  state: z.string().nullable().optional(),
  country: z.string().min(2, {
    message: 'Country is required.',
  }),
  zip_code: z.string().nullable().optional(),
});

export type UpdateRentalPropertyValues = z.infer<typeof updateRentalPropertySchema>;