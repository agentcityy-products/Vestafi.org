import { useQuery } from '@tanstack/react-query';

import { getAdminDashboardStats } from '@/actions/admin-dashboard';

import { QueryKeys } from '@/constants/query-keys';

export interface AdminDashboardStats {
  totalUsers: number;
  approvedUsers: number;
  totalDeployed: number;
  totalVaultBalance: number;
  totalReferrals: number;
  uniqueReferredUsers: number;
}

/**
 * Get admin dashboard statistics with real-time updates
 * Refetches every 30 seconds for real-time data
 */
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: [QueryKeys.ADMIN_DASHBOARD_STATS],
    queryFn: async (): Promise<AdminDashboardStats> => {
      const result = await getAdminDashboardStats();
      if (!result || !('data' in result) || !result.data) {
        throw new Error('Failed to fetch admin dashboard stats');
      }
      // The action returns { success: true, data: {...} }
      // So result.data is { success: true, data: {...} }
      const actionData = result.data as { success: boolean; data: AdminDashboardStats };
      if (!actionData || !actionData.data) {
        throw new Error('Invalid data structure from admin dashboard stats');
      }
      return actionData.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

