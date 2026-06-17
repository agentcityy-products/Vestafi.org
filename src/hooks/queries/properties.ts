import { useQuery } from '@tanstack/react-query';

import { getProperties } from '@/actions/properties';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { ListingWithRent } from '@/types/dao';

interface UsePropertiesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  initialProperties?: ListingWithRent[];
}

export const useProperties = ({
  page = 0,
  pageSize = 10,
  search = '',
  initialProperties,
}: UsePropertiesParams = {}) => {
  return useQuery({
    queryKey: [QueryKeys.PROPERTIES, { page, pageSize, search }],
    queryFn: () => getProperties({ page, pageSize, search }),
    initialData: {
      data: initialProperties ?? [],
      count: initialProperties?.length ?? 0,
      page,
      pageSize,
    },
  });
};

export const useOwnedProperties = () => {
  return useQuery({
    queryKey: [QueryKeys.OWNED_PROPERTIES],
    queryFn: authQuery(async ({ supabase, user }) => {
      const { data, error } = await supabase
        .from('owned_properties_view')
        .select('*')
        .eq('user_id', user.id)
        .order('latest_investment_date', { ascending: false });
      if (error) throw new Error(error.message);

      return data;
    }),
  });
};

export const useUserApprovedRentalProperties = () => {
  return useQuery({
    queryKey: [QueryKeys.USER_APPROVED_RENTAL_PROPERTIES],
    queryFn: authQuery(async ({ supabase, user }) => {
      const { data, count, error } = await supabase
        .from('property')
        .select('*', { count: 'exact' })
        .eq('submitted_by', user.id)
        .eq('property_type', 'rental')
        .eq('status', 'approved');
      if (error) throw new Error(error.message);

      return { data: data || [], count: count ?? 0 };
    }),
  });
};
