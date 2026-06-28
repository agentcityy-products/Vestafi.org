import { z } from 'zod';

import { countries } from '@/constants/countries';

// Age range options
export const ageRangeOptions = [
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45-54', label: '45–54' },
  { value: '55+', label: '55+' },
] as const;

// Monthly income options (in UGX)
export const monthlyIncomeOptions = [
  { value: 'below-1m', label: 'Below 1M UGX' },
  { value: '1m-2.2m', label: '1M - 2.2M UGX' },
  { value: '2.2m-5m', label: '2.2M - 5M UGX' },
  { value: '5m-10m', label: '5M - 10M UGX' },
  { value: 'above-10m', label: 'Above 10M UGX' },
] as const;

// Contribution capacity options (in UGX)
export const contributionCapacityOptions = [
  { value: 'below-1m', label: 'Below 1M UGX' },
  { value: '1.5m-3.5m', label: '1.5M - 3.5M UGX' },
  { value: '3.5m-11.5m', label: '3.5M - 11.5M UGX' },
  { value: '11.5m-33m', label: '11.5M - 33M UGX' },
  { value: '33m-100m', label: '33M - 100M UGX' },
] as const;

// Contribution frequency options (in UGX)
export const contributionFrequencyOptions = [
  {
    value: 'monthly-consistency',
    label: 'Monthly (I want consistency)',
  },
  {
    value: 'monthly-1m',
    label: 'I can commit to 1M UGX/month',
  },
  {
    value: 'biweekly-1m',
    label: 'I can commit to 1M UGX every 2 weeks',
  },
  {
    value: 'bigger-amounts',
    label: 'I want to own bigger amounts in each apartment',
  },
] as const;

// Goals options
export const goalsOptions = [
  { value: 'rental-income', label: 'Generate rental income' },
  { value: 'long-term-wealth', label: 'Build long-term wealth' },
  { value: 'financial-circle', label: 'Belong to a powerful financial circle' },
] as const;

export const ownershipPathOptions = [
  {
    value: 'prime',
    label: 'Buy an entire apartment',
    description: 'I am interested in Vestafi Prime full apartment ownership.',
  },
  {
    value: 'live',
    label: 'Own into an apartment already earning rent',
    description: 'I am interested in Vestafi Live operational apartments.',
  },
  {
    value: 'fractional',
    label: 'Join others to acquire an apartment together',
    description:
      'I am interested in Vestafi Fractional collaborative ownership.',
  },
  {
    value: 'not-sure',
    label: 'I am not sure yet',
    description: 'I want Vestafi to guide me toward the best path.',
  },
] as const;

// Investment timeline options
export const investmentTimelineOptions = [
  { value: '6-months', label: '6 months' },
  { value: '1-year', label: '1 year' },
  { value: '2-3-years', label: '2–3 years' },
  { value: '5-plus-years', label: '5+ years' },
  { value: 'as-long-as-value', label: 'For as long as VESTAFI offers value.' },
] as const;

// Joining as options
export const joiningAsOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'group', label: 'Group' },
  { value: 'family', label: 'Family' },
  { value: 'investment-club', label: 'Small investment club' },
] as const;

// Referral source options
export const referralSourceOptions = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
] as const;

// Legacy location options (kept for backward compatibility)
export const locationOptions = [
  {
    value: 'kampala',
    label: 'Kampala - The capital city',
    description: 'Living in or around Kampala',
  },
  {
    value: 'inside-uganda',
    label: 'Inside Uganda - Outside Kampala',
    description: 'Other cities and regions within Uganda',
  },
  {
    value: 'outside-uganda',
    label: 'Outside Uganda - Diaspora',
    description: 'Living abroad but connected to Uganda',
  },
] as const;

// Legacy savings options (kept for backward compatibility)
export const savingsOptions = [
  {
    value: 'yes_save_more',
    label: 'Yes, I have UGX 1M+ ready to deploy now',
    description: 'Ready to start earning rental income immediately',
  },
  {
    value: 'working_toward_it',
    label: 'I can save UGX 1M+ within 2-3 months',
    description: 'Currently building my investment capital',
  },
  {
    value: 'not_for_me',
    label: 'I want to learn first, then commit financially',
    description: 'Interested but need to understand the process',
  },
] as const;

// Legacy why VESTAFI options (kept for backward compatibility)
export const whyVestafiOptions = [
  {
    value: 'silent_wealth',
    label: 'I believe in silent wealth, not loud hustle.',
  },
  {
    value: 'feels_different',
    label: "I'm not sure, but something about this feels different.",
  },
  {
    value: 'looking_for_circle',
    label: "I've been looking for a circle like this all along.",
  },
  {
    value: 'own_not_rent',
    label: 'I want to own the city - not rent forever.',
  },
] as const;

// Helper function to determine category based on contribution capacity (UGX)
export function determineCategory(
  contributionCapacity: string | null | undefined,
): 1 | 2 | 3 | null {
  if (!contributionCapacity) return null;

  // Category 1: Below 1M UGX (rejected)
  if (contributionCapacity === 'below-1m') return 1;

  // Category 2: 1M - 11.5M UGX (regular members)
  if (
    contributionCapacity === '1.5m-3.5m' ||
    contributionCapacity === '3.5m-11.5m'
  )
    return 2;

  // Category 3: Above 11.5M UGX (Elite Circle)
  if (
    contributionCapacity === '11.5m-33m' ||
    contributionCapacity === '33m-100m'
  )
    return 3;

  return null;
}

// Country names for validation
const countryNames = new Set<string>(countries.map((c) => c.name));

export const applicationFormSchema = z.object({
  // Section 1: Personal Information
  email: z.string().email('Please enter a valid email address'),
  full_name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().min(1, 'Please enter your phone number'),
  phone_country_code: z.string().min(1, 'Please select a country code'),
  country: z
    .string()
    .min(1, 'Please select your country of residence')
    .refine((val: string) => countryNames.has(val), {
      message: 'Please select a valid country',
    }),
  age_range: z.string().min(1, 'Please select your age range'),

  // Section 2: Financial Identity
  monthly_income: z.string().min(1, 'Please select your monthly income range'),
  contribution_capacity: z
    .string()
    .min(1, 'Please select your contribution capacity'),
  contribution_frequency: z
    .string()
    .min(1, 'Please select your contribution frequency'),

  // Section 3: Goals & Mindset
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  preferred_ownership_path: z
    .string()
    .min(1, 'Please select your preferred ownership path'),
  investment_timeline: z
    .string()
    .min(1, 'Please select your investment timeline'),

  // Section 4: Behavior & Trust
  webinar_willing: z.boolean({
    required_error: 'Please indicate if you are willing to attend the webinar',
  }),
  joining_as: z.string().min(1, 'Please select how you are joining'),
  referral_source: z.string().min(1, 'Please select how you heard about us'),

  // Legacy fields (optional for backward compatibility)
  savings: z.string().optional(),
  why_vestafi: z.array(z.string()).optional(),

  // System fields (set by server, not user input)
  category: z.number().int().min(1).max(3).optional(),
  referred_by: z.string().optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
