import type { ExitWindowStakeRow } from '@/components/dashboard/exit-window/exit-window-stake-types';

import type { ListingsViewRow } from '@/types/dao';

/** Map stake row to listings_view-shaped rent fields for shared rent helpers. */
export function rentPropsFromStake(
  stake: ExitWindowStakeRow,
): Pick<
  ListingsViewRow,
  'price' | 'minimum_monthly_rent' | 'maximum_monthly_rent'
> {
  return {
    price: stake.propertyPrice,
    minimum_monthly_rent: stake.minimumMonthlyRent ?? null,
    maximum_monthly_rent: stake.maximumMonthlyRent ?? null,
  };
}
