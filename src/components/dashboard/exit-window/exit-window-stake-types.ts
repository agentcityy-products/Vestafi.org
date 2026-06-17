/** Row from getMyStakesForExitWindow (sell UI). */
export type ExitWindowStakeRow = {
  propertyId: string;
  propertyTitle: string | null;
  propertyImages?: string[] | null;
  propertyPrice: number;
  exitPrice: number;
  ownershipAmount: number;
  sellableAmount: number;
  city?: string | null;
  state?: string | null;
  minimumMonthlyRent?: number | null;
  maximumMonthlyRent?: number | null;
};
