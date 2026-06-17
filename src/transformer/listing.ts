import { isListingAccessible } from '@/controller/listing/listing-access';

import { ListingsViewRow } from '@/types/dao';

/**
 * Determines if a user has access to a listing based on their investment history
 * @param listing - The listing to check access for
 * @param totalInvested - The total amount the user has invested
 * @returns The listing with full details if access is granted, or a modified listing with restricted details if access is denied
 *
 * Access is granted if either:
 * 1. The listing allows first-time investors
 * 2. The user has invested at least the minimum required amount
 */
export const checkListingAccess = (
  listing: ListingsViewRow,
  totalInvested: number,
): ListingsViewRow => {
  if (isListingAccessible(listing, totalInvested)) return listing;

  return {
    ...listing,
    price: 0,
    total_investment: 10000000,
    maximum_monthly_rent: 100000,
    minimum_monthly_rent: 100000,
    address_line_1: 'Property Locked',
    address_line_2: 'Property Locked',
    city: 'Property Locked',
    state: 'Property Locked',
    country: 'Property Locked',
    zip_code: 'Property Locked',
  };
};

/**
 * Determines if a user has access to multiple listings based on their investment history
 * @param listings - Array of listings to check access for
 * @param totalInvested - The total amount the user has invested
 * @returns Array of listings with full details if access is granted, or modified listings with restricted details if access is denied
 *
 * Access is granted if either:
 * 1. The listing allows first-time investors
 * 2. The user has invested at least the minimum required amount
 */
export const checkListingsAccess = (
  listings: ListingsViewRow[],
  totalInvested: number,
): ListingsViewRow[] => {
  return listings.map((listing) => checkListingAccess(listing, totalInvested));
};
