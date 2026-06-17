import { useQuery } from '@tanstack/react-query';

import { getAllMembershipActivations } from '@/actions/membership';

import { QueryKeys } from '@/constants/query-keys';

export interface MembershipActivationWithUser {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  proof_images: string[] | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  approved_by_user: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface GetAllMembershipActivationsParams {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
}

/**
 * Get all membership activations (Admin)
 */
export const useAdminMembershipActivations = (
  params: GetAllMembershipActivationsParams = {},
) => {
  return useQuery({
    queryKey: [
      QueryKeys.ADMIN_MEMBERSHIP_ACTIVATIONS,
      params.page,
      params.pageSize,
      params.status,
      params.search,
    ],
    queryFn: async (): Promise<MembershipActivationWithUser[]> => {
      const result = await getAllMembershipActivations({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        status: params.status,
        search: params.search,
      });
      if (!result || !('data' in result) || !result.data) {
        throw new Error('Failed to fetch membership activations');
      }
      const actionData = result.data as {
        success: boolean;
        data: MembershipActivationWithUser[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      };
      return actionData.data;
    },
    refetchOnWindowFocus: true,
  });
};

