import { z } from 'zod';

export const opportunityTypes = ['prime', 'live', 'fractional'] as const;
export type OpportunityType = (typeof opportunityTypes)[number];

export const apartmentStatuses = [
  'draft',
  'acquiring',
  'operational',
  'prime-available',
  'live-active',
  'fractional-open',
  'fully-sold',
] as const;
export type ApartmentStatus = (typeof apartmentStatuses)[number];

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
    opportunity_type: z.enum(opportunityTypes),
    apartment_status: z.enum(apartmentStatuses).default('draft'),
    is_published: z.boolean().default(false),
    published_at: z.string().nullable().optional(),
    acquisition_cost: z.coerce.number().min(0).default(0),
    furnishing_cost: z.coerce.number().min(0).default(0),
    legal_setup_cost: z.coerce.number().min(0).default(0),
    operational_setup_cost: z.coerce.number().min(0).default(0),
    markup_amount: z.coerce.number().min(0).default(0),
    markup_percentage: z.coerce.number().min(0).max(100).default(0),
    listed_value: z.coerce.number().min(0).nullable().optional(),
    annual_yield_min: z.coerce.number().min(0).max(100).nullable().optional(),
    annual_yield_max: z.coerce.number().min(0).max(100).nullable().optional(),
    starting_ownership_amount: z.coerce.number().min(0).nullable().optional(),
    occupancy_percentage: z.coerce
      .number()
      .min(0)
      .max(100)
      .nullable()
      .optional(),
    earnings_active_since: z.string().nullable().optional(),
    last_distribution_at: z.string().nullable().optional(),
    next_distribution_at: z.string().nullable().optional(),
    apartment_features: z.array(z.string()).default([]),
    prime_highlights: z.array(z.string()).default([]),
    managed_by_vestafi: z.boolean().default(true),
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
