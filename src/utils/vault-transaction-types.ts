/**
 * Labels and styles for `vault_transactions.type` (must stay in sync with DB CHECK).
 */
const LABELS: Record<string, string> = {
  deposit: 'Deposit',
  deploy: 'Deployment',
  withdrawal: 'Withdrawal',
  exit_buy: 'Exit window — buy stake',
  exit_sell: 'Exit window — sale proceeds',
  exit_window_fee_receipt: 'Exit window — fee (recipient)',
  exit_window_platform_fee: 'Exit window — platform fee',
};

/** Tailwind text color classes for admin table type column */
const COLORS: Record<string, string> = {
  deposit: 'text-blue-600',
  deploy: 'text-green-600',
  withdrawal: 'text-orange-600',
  exit_buy: 'text-violet-600',
  exit_sell: 'text-emerald-600',
  exit_window_fee_receipt: 'text-amber-600',
  exit_window_platform_fee: 'text-slate-600',
};

export function getVaultTransactionTypeLabel(
  type: string | null | undefined,
): string {
  if (type == null || type === '') return 'Unknown';
  if (LABELS[type]) return LABELS[type];
  return type.replace(/_/g, ' ');
}

export function getVaultTransactionTypeDisplay(type: string | null | undefined): {
  label: string;
  color: string;
} {
  const key = type ?? '';
  return {
    label: getVaultTransactionTypeLabel(type),
    color: COLORS[key] ?? 'text-muted-foreground',
  };
}

/** All values allowed by DB + schema (for zod / filters) */
export const VAULT_TRANSACTION_TYPE_VALUES = [
  'deposit',
  'deploy',
  'withdrawal',
  'exit_buy',
  'exit_sell',
  'exit_window_fee_receipt',
  'exit_window_platform_fee',
] as const;

export type VaultTransactionTypeValue =
  (typeof VAULT_TRANSACTION_TYPE_VALUES)[number];
