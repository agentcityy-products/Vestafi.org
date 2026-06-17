import { useQuery } from '@tanstack/react-query';

import { getAdminNotification } from '@/actions/app-settings';

import { type AdminNotification } from '@/config/app';
import { QueryKeys } from '@/constants/query-keys';

/**
 * Get active admin notification (if exists and not expired)
 */
export const useAdminNotification = () => {
  return useQuery({
    queryKey: [QueryKeys.ADMIN_NOTIFICATION],
    queryFn: async (): Promise<AdminNotification | null> => {
      const result = await getAdminNotification({});
      if (!result || !('data' in result) || !result.data) {
        return null;
      }
      // The action returns { success: true, data: AdminNotification | null }
      const actionData = result.data as {
        success: boolean;
        data: AdminNotification | null;
      };
      if (!actionData || !actionData.success) {
        return null;
      }
      return actionData.data;
    },
    refetchInterval: 60000, // Refetch every minute to check expiration
    refetchOnWindowFocus: true,
  });
};

