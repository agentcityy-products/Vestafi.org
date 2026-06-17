import { useQuery } from '@tanstack/react-query';

import {
  getAllReferralRewards,
  getAllReferrals,
  getReferralStats,
  getUserReferralCode,
  getUserReferrals,
} from '@/actions/referrals';

import { QueryKeys } from '@/constants/query-keys';

export function useReferralCode() {
  return useQuery({
    queryKey: [QueryKeys.REFERRALS, 'code'],
    queryFn: async () => {
      const result = await getUserReferralCode();
      if (!result?.data) return null;
      return result.data.referral_code;
    },
  });
}

export function useReferralStats() {
  return useQuery({
    queryKey: [QueryKeys.REFERRALS, 'stats'],
    queryFn: async () => {
      const result = await getReferralStats();
      if (!result?.data) return null;
      return result.data;
    },
  });
}

export function useUserReferrals(status?: 'pending' | 'approved' | 'invested') {
  return useQuery({
    queryKey: [QueryKeys.REFERRALS, 'list', status],
    queryFn: async () => {
      const result = await getUserReferrals({ status });
      if (!result?.data) return [];
      return result.data.referrals || [];
    },
  });
}

export function useAllReferrals(
  referrerId?: string,
  status?: 'pending' | 'approved' | 'invested',
) {
  return useQuery({
    queryKey: [QueryKeys.REFERRALS, 'admin', 'all', referrerId, status],
    queryFn: async () => {
      const result = await getAllReferrals({ referrer_id: referrerId, status });
      if (!result?.data) return [];
      return result.data.referrals || [];
    },
  });
}

export function useAllReferralRewards() {
  return useQuery({
    queryKey: [QueryKeys.REFERRALS, 'admin', 'rewards'],
    queryFn: async () => {
      const result = await getAllReferralRewards();
      if (!result?.data) return [];
      return result.data.rewards || [];
    },
  });
}
