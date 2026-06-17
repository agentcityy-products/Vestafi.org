'use server';

import { adminActionClient } from '@/lib/server/safe-action';

/**
 * Get admin dashboard statistics
 */
export const getAdminDashboardStats = adminActionClient.action(async ({ ctx }) => {
  const { supabase } = ctx;

  // 1. Total signed up users (count from profile table)
  const { count: totalUsers, error: usersError } = await supabase
    .from('profile')
    .select('*', { count: 'exact', head: true });

  if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`);

  // 2. Approved users (count from applications where status = 'approved')
  const { count: approvedUsers, error: approvedError } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  if (approvedError)
    throw new Error(`Failed to fetch approved users: ${approvedError.message}`);

  // 3. Amount deployed to apartments (sum from investment where status = 'successful')
  const { data: investments, error: investmentsError } = await supabase
    .from('investment')
    .select('amount')
    .eq('status', 'successful');

  if (investmentsError)
    throw new Error(`Failed to fetch investments: ${investmentsError.message}`);

  const totalDeployed =
    investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  // 4. Amount in Vault (sum from user_vault.balance)
  const { data: vaults, error: vaultsError } = await supabase
    .from('user_vault')
    .select('balance');

  if (vaultsError)
    throw new Error(`Failed to fetch vault balances: ${vaultsError.message}`);

  const totalVaultBalance =
    vaults?.reduce((sum, vault) => sum + (vault.balance || 0), 0) || 0;

  // 5. Total Referred users (both total referrals and unique referred users)
  const { data: referrals, error: referralsError } = await supabase
    .from('referrals')
    .select('referee_id');

  if (referralsError)
    throw new Error(`Failed to fetch referrals: ${referralsError.message}`);

  const totalReferrals = referrals?.length || 0;
  // Count unique referred users (distinct referee_id, excluding nulls)
  const uniqueReferredUsers = new Set(
    referrals?.filter((r) => r.referee_id).map((r) => r.referee_id),
  ).size;

  return {
    success: true,
    data: {
      totalUsers: totalUsers || 0,
      approvedUsers: approvedUsers || 0,
      totalDeployed,
      totalVaultBalance,
      totalReferrals,
      uniqueReferredUsers,
    },
  };
});

