import { useQuery } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { getAllRentalProperties } from '@/actions/admin-rental-properties';
import {
  getRentalProperties,
  getRentalPropertyCities,
  getRentalPropertyStates,
} from '@/actions/rental-properties';

import { QueryKeys } from '@/constants/query-keys';

type UseRentalPropertiesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string | string[];
  country?: string;
  minPrice?: number;
  maxPrice?: number;
};

type UseAdminRentalPropertiesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
};

export const useRentalProperties = (params: UseRentalPropertiesParams = {}) => {
  return useQuery({
    queryKey: [QueryKeys.RENTAL_PROPERTIES, params],
    queryFn: () => getRentalProperties(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminRentalProperties = (
  params: UseAdminRentalPropertiesParams = {},
) => {
  const getAllRentalPropertiesAction = useAction(getAllRentalProperties);

  return useQuery({
    queryKey: [QueryKeys.ADMIN_RENTAL_PROPERTIES, params],
    queryFn: async () => {
      const result = await getAllRentalPropertiesAction.executeAsync({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search,
        status: params.status,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (!result?.data) {
        throw new Error('Failed to fetch rental properties');
      }

      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useRentalPropertyCities = () => {
  return useQuery({
    queryKey: [QueryKeys.RENTAL_PROPERTY_CITIES],
    queryFn: () => getRentalPropertyCities(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useRentalPropertyStates = () => {
  return useQuery({
    queryKey: [QueryKeys.RENTAL_PROPERTY_STATES],
    queryFn: () => getRentalPropertyStates(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
