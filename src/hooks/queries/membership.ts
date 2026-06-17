import { useQuery } from '@tanstack/react-query';

import { useLoggedInUser } from '@/hooks/queries/profile';

import { getUserMembershipStatus } from '@/actions/membership';

import { QueryKeys } from '@/constants/query-keys';

export interface UserMembershipStatus {
  isFoundingMember: boolean;
  membershipExpiresAt: string | null;
  hasAccess: boolean;
  needsActivation: boolean;
  isExpired: boolean;
  membershipEnabled: boolean;
  annualFee: number;
  pendingActivations: Array<{
    id: string;
    created_at: string;
  }>;
}

/**
 * Get current user's membership status
 */
export const useUserMembershipStatus = () => {
  return useQuery({
    queryKey: [QueryKeys.USER_MEMBERSHIP_STATUS],
    queryFn: async (): Promise<UserMembershipStatus> => {
      const result = await getUserMembershipStatus();
      if (!result || !('data' in result) || !result.data) {
        throw new Error('Failed to fetch membership status');
      }
      const actionData = result.data as {
        success: boolean;
        isFoundingMember: boolean;
        membershipExpiresAt: string | null;
        hasAccess: boolean;
        needsActivation: boolean;
        isExpired: boolean;
        membershipEnabled: boolean;
        annualFee: number;
        pendingActivations: Array<{ id: string; created_at: string }>;
      };
      return {
        isFoundingMember: actionData.isFoundingMember,
        membershipExpiresAt: actionData.membershipExpiresAt,
        hasAccess: actionData.hasAccess,
        needsActivation: actionData.needsActivation,
        isExpired: actionData.isExpired,
        membershipEnabled: actionData.membershipEnabled,
        annualFee: actionData.annualFee,
        pendingActivations: actionData.pendingActivations,
      };
    },
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to check membership access for the current user
 * Returns convenient access flags and membership status
 */
export function useMembershipAccess() {
  const { data: user } = useLoggedInUser();
  const { data: membershipStatus, isLoading } = useUserMembershipStatus();

  const isAdmin = user?.role === 'admin';
  const hasAccess =
    isAdmin ||
    membershipStatus?.hasAccess ||
    false;

  return {
    hasAccess,
    isFoundingMember: membershipStatus?.isFoundingMember || false,
    membershipExpiresAt: membershipStatus?.membershipExpiresAt || null,
    isExpired: membershipStatus?.isExpired || false,
    membershipEnabled: membershipStatus?.membershipEnabled ?? true,
    needsActivation: !isAdmin && (membershipStatus?.needsActivation || false),
    isLoading: isLoading || !membershipStatus,
    pendingActivations: membershipStatus?.pendingActivations || [],
  };
}

