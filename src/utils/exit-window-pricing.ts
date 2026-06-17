/**
 * Exit-window secondary pricing: stake amount (ledger) × (exit_price / listing price) = cash paid.
 * Listing `property.price` is unchanged; exit price is only for this window.
 */

export function valueAtExitPrice(
  stakeAmount: number,
  propertyListingPrice: number,
  exitPrice: number,
): number {
  if (!propertyListingPrice || propertyListingPrice <= 0) return stakeAmount;
  return Math.round((stakeAmount * (exitPrice / propertyListingPrice)) * 100) / 100;
}

/** One side of the symmetric fee: fee% of base cash value at exit. */
export function feeAmountForPayment(
  baseCashValue: number,
  feePercentage: number,
): number {
  return Math.round(((baseCashValue * feePercentage) / 100) * 100) / 100;
}

/**
 * Cash at exit price for the stake (base) before per-side fees.
 * Buyer pays base × (1 + fee%/100); seller receives base × (1 − fee%/100).
 * Platform total ≈ 2 × fee% of base.
 */
export function buyerPaymentWithSymmetricFee(
  baseCashValue: number,
  feePercentage: number,
): number {
  return (
    Math.round(baseCashValue * (1 + feePercentage / 100) * 100) / 100
  );
}

export function sellerProceedsAfterSymmetricFee(
  baseCashValue: number,
  feePercentage: number,
): number {
  return (
    Math.round(baseCashValue * (1 - feePercentage / 100) * 100) / 100
  );
}

/** Total platform take for one trade (buyer premium + seller deduction). */
export function platformFeeTotalSymmetric(
  baseCashValue: number,
  feePercentage: number,
): number {
  const buyer = buyerPaymentWithSymmetricFee(baseCashValue, feePercentage);
  const seller = sellerProceedsAfterSymmetricFee(baseCashValue, feePercentage);
  return Math.round((buyer - seller) * 100) / 100;
}

/** @deprecated Use sellerProceedsAfterSymmetricFee */
export function sellerProceedsAfterFee(
  paymentAmount: number,
  feePercentage: number,
): number {
  return sellerProceedsAfterSymmetricFee(paymentAmount, feePercentage);
}

export function ownershipPercentOfStake(
  stakeAmount: number,
  propertyListingPrice: number,
): number {
  if (!propertyListingPrice || propertyListingPrice <= 0) return 0;
  return Math.round((stakeAmount / propertyListingPrice) * 10000) / 100;
}
