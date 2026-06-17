import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

type UseMonthlyReturnsParams = {
  page?: number;
  pageSize?: number;
};

export const useMonthlyReturns = ({
  page = 0,
  pageSize = 10,
}: UseMonthlyReturnsParams = {}) => {
  return useQuery({
    queryKey: [QueryKeys.MONTHLY_RETURNS, { page, pageSize }],
    queryFn: authQuery(async (ctx) => {
      const { supabase, user } = ctx;

      // Add pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('monthly_return')
        .select('*, property:owned_properties_view(*)', { count: 'exact' })
        .eq('user_id', user.id)
        .range(from, to)
        .order('created_at', { ascending: false })
        .limit(pageSize);

      if (error) throw new Error(error.message);

      return {
        data,
        count: count || 0,
        page,
        pageSize,
      };
    }),
    initialData: {
      data: [],
      count: 0,
      page,
      pageSize,
    },
    placeholderData: keepPreviousData,
  });
};

export const useExportAllMonthlyReturns = () => {
  return useQuery({
    queryKey: [QueryKeys.EXPORT_MONTHLY_RETURNS],
    queryFn: authQuery(async (ctx) => {
      const { supabase } = ctx;

      const { data, error } = await supabase
        .from('monthly_return')
        .select('*, property:property!inner(*), user:profile!inner(*)')
        .order('created_at', { ascending: false });
      console.log('rent export data', data);
      if (error) throw new Error(error.message);

      return data;
    }),
  });
};
