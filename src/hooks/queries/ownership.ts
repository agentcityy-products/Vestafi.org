import { useQuery } from '@tanstack/react-query';

import { getMyOwnershipReservations } from '@/actions/ownership';

import { QueryKeys } from '@/constants/query-keys';

import { OwnershipReservationRow, PropertyRow } from '@/types/dao';

export type OwnershipReservationWithProperty = OwnershipReservationRow & {
  property: PropertyRow | null;
};

export function useOwnershipReservations() {
  return useQuery<OwnershipReservationWithProperty[]>({
    queryKey: [QueryKeys.OWNERSHIP_RESERVATIONS],
    queryFn: async () => {
      const result = await getMyOwnershipReservations({});
      if (!result?.data)
        throw new Error('Could not load ownership reservations');
      return result.data as OwnershipReservationWithProperty[];
    },
  });
}
