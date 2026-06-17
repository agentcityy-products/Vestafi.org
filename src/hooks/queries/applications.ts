import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { ApplicationStatus } from '@/types/dao';

type UseApplicationsParams = {
  status: ApplicationStatus;
  page?: number;
  pageSize?: number;
  search?: string;
};

export const useApplications = ({
  status,
  page = 1,
  pageSize = 10,
  search,
}: UseApplicationsParams) => {
  return useQuery({
    queryKey: [QueryKeys.APPLICATIONS, status, { page, pageSize, search }],
    queryFn: authQuery(async ({ supabase }) => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      console.log(from, to);

      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .eq('status', status);

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
        );
      }

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { data, count };
    }),
  });
};
