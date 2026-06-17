'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

const DEFAULT_EXIT_WINDOW_FEE_PERCENTAGE = 1.5;
const DEFAULT_EXIT_WINDOW_MIN_AMOUNT = 1;

/**
 * Get exit window fee percentage from app_settings (default 1.5).
 */
export async function getExitWindowFeePercentage(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'exit_window_fee_percentage')
    .single();

  if (!data?.value) return DEFAULT_EXIT_WINDOW_FEE_PERCENTAGE;
  const v = data.value as number | string;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : DEFAULT_EXIT_WINDOW_FEE_PERCENTAGE;
}

/**
 * Optional profile UUID that receives exit-window fees into their vault (platform treasury).
 * If unset, fee is still recorded as `exit_window_platform_fee` vault_transactions (user_id null).
 */
async function getNumericAppSetting(
  key: string,
  fallback: number,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (!data?.value) return fallback;
  const v = data.value as number | string;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Minimum stake amount (UGX) for a sell order during an exit window. */
export async function getExitWindowMinSellAmount(): Promise<number> {
  return getNumericAppSetting(
    'exit_window_min_sell_amount',
    DEFAULT_EXIT_WINDOW_MIN_AMOUNT,
  );
}

/** Minimum stake amount (UGX) for a buy during an exit window. */
export async function getExitWindowMinBuyAmount(): Promise<number> {
  return getNumericAppSetting(
    'exit_window_min_buy_amount',
    DEFAULT_EXIT_WINDOW_MIN_AMOUNT,
  );
}

export async function getExitWindowFeeRecipientUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'exit_window_fee_recipient_user_id')
    .maybeSingle();
  if (!data?.value) return null;
  const v = data.value as string;
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

/**
 * Get the currently active exit window (status = active and now between start_at and end_at).
 */
export async function getActiveExitWindow() {
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('exit_windows')
    .select('*')
    .eq('status', 'active')
    .lte('start_at', now)
    .gte('end_at', now)
    .order('end_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** Next scheduled draft window (earliest start), for “closed” messaging. */
export async function getNextDraftExitWindow() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('exit_windows')
    .select('id, start_at, end_at')
    .eq('status', 'draft')
    .order('start_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get exit price for a property in a given window (from exit_window_property_prices).
 */
export async function getExitPrice(
  exitWindowId: string,
  propertyId: string,
): Promise<number | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('exit_window_property_prices')
    .select('exit_price')
    .eq('exit_window_id', exitWindowId)
    .eq('property_id', propertyId)
    .single();

  if (error || !data) return null;
  return data.exit_price;
}

/**
 * Get current ownership amount for a user in a property (sum of amount_delta from property_ownership_movements).
 */
export async function getOwnershipAmount(
  userId: string,
  propertyId: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('property_ownership_movements')
    .select('amount_delta')
    .eq('user_id', userId)
    .eq('property_id', propertyId);

  if (error) throw new Error(error.message);
  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount_delta), 0);
  return total;
}

/**
 * Get total amount already committed in open/partially_filled orders for this user and property in this window.
 * (Full order size is reserved; sellable = ownership - this value.)
 */
export async function getOpenOrderAmountForUserProperty(
  userId: string,
  propertyId: string,
  exitWindowId: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('exit_window_orders')
    .select('amount_total')
    .eq('seller_user_id', userId)
    .eq('property_id', propertyId)
    .eq('exit_window_id', exitWindowId)
    .in('status', ['open', 'partially_filled']);

  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount_total), 0);
}

/**
 * Sellable amount = ownership amount minus amount already in open orders for this window.
 */
export async function getSellableAmount(
  userId: string,
  propertyId: string,
  exitWindowId: string,
): Promise<number> {
  const [ownership, inOpenOrders] = await Promise.all([
    getOwnershipAmount(userId, propertyId),
    getOpenOrderAmountForUserProperty(userId, propertyId, exitWindowId),
  ]);
  return Math.max(0, ownership - inOpenOrders);
}
