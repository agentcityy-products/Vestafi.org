import * as z from 'zod';

export const nextOfKinSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').nullable(),
  phone: z
    .string()
    .regex(/^\d{7,11}$/, 'Phone number must be 7-11 digits')
    .nullable(),
  country_code: z.string().length(2, 'Country code is required').nullable(),
  address: z.string().min(1, 'Address is required').nullable(),
  relationship: z.string().min(1, 'Relationship is required'),
});

export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\d{7,11}$/, 'Phone number must be 7-11 digits'),
  country_code: z.string().length(2, 'Country code is required'),
  // * bank details
  bank_name: z.string().min(1, 'Bank name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  account_name: z.string().min(1, 'Account name is required'),
  next_of_kin: nextOfKinSchema.optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
