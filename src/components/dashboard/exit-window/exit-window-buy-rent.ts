import type { ListingsViewRow } from '@/types/dao';

/** Midpoint of admin rent range, scaled by stake / listing price (same idea as investment calculator). */
export function estimatedMonthlyRentForStake(
  stakeAmount: number,
  property: Pick<
    ListingsViewRow,
    'price' | 'minimum_monthly_rent' | 'maximum_monthly_rent'
  >,
): number | null {
  const price = property.price ?? 0;
  const minR = property.minimum_monthly_rent;
  const maxR = property.maximum_monthly_rent;
  if (!price || price <= 0 || minR == null || maxR == null) return null;
  const mid = (Number(minR) + Number(maxR)) / 2;
  return Math.round((stakeAmount / price) * mid);
}

/** Gross yearly yield from rent range vs listing price (for subtitle copy). */
export function estimateYearlyRentalYieldPercent(
  property: Pick<
    ListingsViewRow,
    'price' | 'minimum_monthly_rent' | 'maximum_monthly_rent'
  >,
): number | null {
  const price = property.price ?? 0;
  const minR = property.minimum_monthly_rent;
  const maxR = property.maximum_monthly_rent;
  if (!price || price <= 0 || minR == null || maxR == null) return null;
  const mid = (Number(minR) + Number(maxR)) / 2;
  return Math.round(((mid * 12 * 100) / price) * 10) / 10;
}
