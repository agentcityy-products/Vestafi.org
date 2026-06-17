import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { GetListingsParams } from '@/schema/listing';
import { getListings } from '@/actions/listing';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { ListingsViewRow } from '@/types/dao';

export const useListings = ({
  page = 1,
  pageSize = 10,
  search = '',
}: GetListingsParams) => {
  return useQuery({
    queryKey: [QueryKeys.LISTINGS, { page, pageSize, search }],
    queryFn: () => getListings({ page, pageSize, search }),
    placeholderData: keepPreviousData,
  });
};

type GetListingByIdParams = {
  id: string;
  defaultData?: ListingsViewRow;
};

export const useListingById = ({ id, defaultData }: GetListingByIdParams) => {
  return useQuery({
    queryKey: [QueryKeys.LISTINGS, id],
    queryFn: authQuery(async ({ supabase }) => {
      const { data, error } = await supabase
        .from('listings_view')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);

      return data;
    }),
    initialData: defaultData,
  });
};
