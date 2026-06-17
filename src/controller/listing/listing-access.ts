import { businessConfig } from '@/config/app';

import { ListingsViewRow } from '@/types/dao';

export const isListingAccessible = (
  listing: ListingsViewRow,
  totalInvested: number,
) => {
  return (
    listing.allow_first_time_investors ||
    totalInvested >= businessConfig.minInvestmentAmount
  );
};
