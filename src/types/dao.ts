import { Database } from './supabase';

// * Enums types
export type UserRoleEnum = Database['public']['Enums']['user_role_enum'];
export type WithdrawalStatus =
  Database['public']['Enums']['withdrawal_status_enum'];
export type ApplicationStatus =
  Database['public']['Enums']['application_status_enum'];
export type InvestmentStatus =
  Database['public']['Enums']['investment_status_enum'];
export type RankType = Database['public']['Enums']['rank_types'];
export type OpportunityType = 'prime' | 'live' | 'fractional';

// * Row types
export type PropertyRow = Database['public']['Tables']['property']['Row'];
export type BankInfoRow = Database['public']['Tables']['bank_info']['Row'];
export type InvestmentRow = Database['public']['Tables']['investment']['Row'];
export type MonthlyRentRow =
  Database['public']['Tables']['monthly_rent']['Row'];
export type MonthlyReturnRow =
  Database['public']['Tables']['monthly_return']['Row'];
export type ProfileRow = Database['public']['Tables']['profile']['Row'];
export type UserRoleRow = Database['public']['Tables']['user_role']['Row'];
export type WithdrawalRequestRow =
  Database['public']['Tables']['withdrawal_request']['Row'];
export type ApplicationRow =
  Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert =
  Database['public']['Tables']['applications']['Insert'];
export type ApplicationUpdate =
  Database['public']['Tables']['applications']['Update'];
export type ReferralRow = Database['public']['Tables']['referrals']['Row'];
export type ReferralInsert =
  Database['public']['Tables']['referrals']['Insert'];
export type ReferralUpdate =
  Database['public']['Tables']['referrals']['Update'];
export type ReferralRewardRow =
  Database['public']['Tables']['referral_rewards']['Row'];
export type ReferralRewardInsert =
  Database['public']['Tables']['referral_rewards']['Insert'];
export type ReferralRewardUpdate =
  Database['public']['Tables']['referral_rewards']['Update'];
export type UserVaultRow = Database['public']['Tables']['user_vault']['Row'];
export type VaultTransactionRow =
  Database['public']['Tables']['vault_transactions']['Row'];

// * Insert types
export type BankInfoInsert =
  Database['public']['Tables']['bank_info']['Insert'];
export type InvestmentInsert =
  Database['public']['Tables']['investment']['Insert'];
export type MonthlyRentInsert =
  Database['public']['Tables']['monthly_rent']['Insert'];
export type MonthlyReturnInsert =
  Database['public']['Tables']['monthly_return']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profile']['Insert'];
export type UserRoleInsert =
  Database['public']['Tables']['user_role']['Insert'];
export type WithdrawalRequestInsert =
  Database['public']['Tables']['withdrawal_request']['Insert'];
export type UserVaultInsert =
  Database['public']['Tables']['user_vault']['Insert'];
export type VaultTransactionInsert =
  Database['public']['Tables']['vault_transactions']['Insert'];
export type MembershipActivationInsert =
  Database['public']['Tables']['membership_activations']['Insert'];

// * Update types
export type BankInfoUpdate =
  Database['public']['Tables']['bank_info']['Update'];
export type InvestmentUpdate =
  Database['public']['Tables']['investment']['Update'];
export type MonthlyRentUpdate =
  Database['public']['Tables']['monthly_rent']['Update'];
export type MonthlyReturnUpdate =
  Database['public']['Tables']['monthly_return']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profile']['Update'];
export type UserRoleUpdate =
  Database['public']['Tables']['user_role']['Update'];
export type WithdrawalRequestUpdate =
  Database['public']['Tables']['withdrawal_request']['Update'];
export type UserVaultUpdate =
  Database['public']['Tables']['user_vault']['Update'];
export type VaultTransactionUpdate =
  Database['public']['Tables']['vault_transactions']['Update'];

// * View types
export type VaultViewRow = Database['public']['Views']['vault_view']['Row'];
export type ListingsViewRow =
  Database['public']['Views']['listings_view']['Row'];
export type OwnedPropertiesViewRow =
  Database['public']['Views']['owned_properties_view']['Row'];

// * Composite Types
export type PropertyWithRent = PropertyRow & {
  rents: MonthlyRentRow[];
};
export type ListingWithRent = ListingsViewRow & {
  rents: MonthlyRentRow[];
};
export type WithdrawalRequestWithUserDetails = WithdrawalRequestRow & {
  user: ProfileRow & { bank: BankInfoRow | null };
};

export type PropertyWithProfile = PropertyRow & {
  profile: Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'email'> | null;
};
export type MonthlyReturnWithPropertyAndUser = MonthlyReturnRow & {
  property: PropertyRow;
  user: ProfileRow;
};
