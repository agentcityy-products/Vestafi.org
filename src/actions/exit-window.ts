'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import {
  buyFromExitOrderSchema,
  cancelExitOrderSchema,
  createExitOrderSchema,
  exitWindowPropertyIdSchema,
  listExitOrdersSchema,
} from '@/schema/exit-window';
import { checkMembershipAccess } from '@/actions/membership';
import {
  getOrCreateUserVault,
  getOrCreateUserVaultAdmin,
} from '@/actions/vault';

import type { ExitWindowStakeRow } from '@/components/dashboard/exit-window/exit-window-stake-types';

import {
  getActiveExitWindow,
  getExitPrice,
  getExitWindowFeePercentage,
  getExitWindowFeeRecipientUserId,
  getExitWindowMinBuyAmount,
  getExitWindowMinSellAmount,
  getNextDraftExitWindow,
  getSellableAmount,
} from '@/lib/exit-window';
import { authActionClient } from '@/lib/server/safe-action';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  buyerPaymentWithSymmetricFee,
  platformFeeTotalSymmetric,
  sellerProceedsAfterSymmetricFee,
} from '@/utils/exit-window-pricing';
import Logger from '@/utils/logger';

import type { Database } from '@/types/supabase';

type ExitOrderDbRow = {
  exit_window_id: string;
  property_id: string;
  [key: string]: unknown;
};

async function attachExitWindowPricesToOrders(
  supabase: SupabaseClient<Database>,
  orders: ExitOrderDbRow[],
): Promise<(ExitOrderDbRow & { exit_window_exit_price: number | null })[]> {
  if (orders.length === 0) return [];
  const windowIds = [...new Set(orders.map((o) => o.exit_window_id))];
  const propertyIds = [...new Set(orders.map((o) => o.property_id))];
  const { data: priceRows } = await supabase
    .from('exit_window_property_prices')
    .select('exit_window_id, property_id, exit_price')
    .in('exit_window_id', windowIds)
    .in('property_id', propertyIds);
  const map = new Map<string, number>();
  for (const row of priceRows ?? []) {
    map.set(`${row.exit_window_id}:${row.property_id}`, Number(row.exit_price));
  }
  return orders.map((o) => ({
    ...o,
    exit_window_exit_price:
      map.get(`${o.exit_window_id}:${o.property_id}`) ?? null,
  }));
}

export const createExitOrder = authActionClient
  .schema(createExitOrderSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { exitWindowId, propertyId, amount } = parsedInput;

    const hasAccess = await checkMembershipAccess(authUser.user.id);
    if (!hasAccess)
      throw new Error('Only approved members can sell during the exit window');

    const window = await supabase
      .from('exit_windows')
      .select('*')
      .eq('id', exitWindowId)
      .eq('status', 'active')
      .single();
    if (window.error || !window.data)
      throw new Error('Exit window not found or not active');
    const w = window.data;
    const now = new Date();
    if (new Date(w.start_at) > now || new Date(w.end_at) < now) {
      throw new Error('Exit window is not currently open');
    }

    const sellable = await getSellableAmount(
      authUser.user.id,
      propertyId,
      exitWindowId,
    );
    if (sellable < amount) {
      throw new Error(
        `Sellable amount (${sellable}) is less than requested amount. You may already have open orders for this property.`,
      );
    }

    const minSell = await getExitWindowMinSellAmount();
    if (amount < minSell) {
      throw new Error(
        `Minimum stake to list is ${minSell.toLocaleString()} UGX (set by admin).`,
      );
    }

    const { data: order, error } = await supabase
      .from('exit_window_orders')
      .insert({
        exit_window_id: exitWindowId,
        property_id: propertyId,
        seller_user_id: authUser.user.id,
        amount_total: amount,
        amount_remaining: amount,
        status: 'open',
        expires_at: w.end_at,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    Logger.info('Exit order created', {
      orderId: order.id,
      userId: authUser.user.id,
      amount,
    });
    return { success: true, orderId: order.id };
  });

export const buyFromExitOrder = authActionClient
  .schema(buyFromExitOrderSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { authUser } = ctx;
    const { orderId, amount } = parsedInput;

    const hasAccess = await checkMembershipAccess(authUser.user.id);
    if (!hasAccess)
      throw new Error('Only approved members can buy during the exit window');

    const supabase = await createSupabaseServerClient();
    const adminSupabase = await createSupabaseAdminClient();

    const { data: order, error: orderError } = await supabase
      .from('exit_window_orders')
      .select('*, exit_windows(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw new Error('Order not found');
    if (order.seller_user_id === authUser.user.id)
      throw new Error('You cannot buy from your own order');
    if (!['open', 'partially_filled'].includes(order.status))
      throw new Error('Order is not available');
    if (order.amount_remaining < amount)
      throw new Error(`Only ${order.amount_remaining} remaining on this order`);

    const w = order.exit_windows as {
      id: string;
      start_at: string;
      end_at: string;
      status: string;
    };
    const now = new Date();
    if (
      w.status !== 'active' ||
      new Date(w.start_at) > now ||
      new Date(w.end_at) < now
    ) {
      throw new Error('Exit window is not currently open');
    }

    const { data: property } = await supabase
      .from('property')
      .select('price')
      .eq('id', order.property_id)
      .single();
    if (!property?.price || property.price <= 0)
      throw new Error('Property price not found');
    const exitPrice = await getExitPrice(w.id, order.property_id);
    if (exitPrice == null || exitPrice <= 0)
      throw new Error('Exit price not set for this property in this window');

    const propertyPrice = Number(property.price);
    const baseCashValue =
      Math.round(amount * (exitPrice / propertyPrice) * 100) / 100;

    const minBuy = await getExitWindowMinBuyAmount();
    if (amount < minBuy) {
      throw new Error(
        `Minimum stake to buy is ${minBuy.toLocaleString()} UGX (set by admin).`,
      );
    }

    const feePct = await getExitWindowFeePercentage();
    const buyerPayment = buyerPaymentWithSymmetricFee(baseCashValue, feePct);
    const sellerProceeds = sellerProceedsAfterSymmetricFee(
      baseCashValue,
      feePct,
    );
    const platformFeeTotal = platformFeeTotalSymmetric(baseCashValue, feePct);

    const buyerVault = await getOrCreateUserVault(authUser.user.id);
    if (buyerVault.balance < buyerPayment)
      throw new Error(
        `Insufficient vault balance. You need ${buyerPayment.toLocaleString()} UGX (includes ${feePct}% fee on top of value at exit price).`,
      );

    const tradeId = crypto.randomUUID();

    const { error: orderUpdateError } = await adminSupabase
      .from('exit_window_orders')
      .update({
        amount_remaining: order.amount_remaining - amount,
        status:
          order.amount_remaining - amount <= 0 ? 'filled' : 'partially_filled',
      })
      .eq('id', orderId);

    if (orderUpdateError) throw new Error(orderUpdateError.message);

    const { error: tradeError } = await adminSupabase
      .from('exit_window_trades')
      .insert({
        id: tradeId,
        order_id: orderId,
        property_id: order.property_id,
        seller_user_id: order.seller_user_id,
        buyer_user_id: authUser.user.id,
        amount,
        fee_amount: platformFeeTotal,
        seller_proceeds: sellerProceeds,
      });

    if (tradeError) {
      await adminSupabase
        .from('exit_window_orders')
        .update({
          amount_remaining: order.amount_remaining,
          status: order.status,
        })
        .eq('id', orderId);
      throw new Error(tradeError.message);
    }

    const { error: movSellerError } = await adminSupabase
      .from('property_ownership_movements')
      .insert({
        property_id: order.property_id,
        user_id: order.seller_user_id,
        amount_delta: -amount,
        reason: 'secondary_trade',
        ref_id: tradeId,
      });
    if (movSellerError) {
      Logger.error('Failed to insert seller movement', {
        error: movSellerError,
      });
      await adminSupabase.from('exit_window_trades').delete().eq('id', tradeId);
      await adminSupabase
        .from('exit_window_orders')
        .update({
          amount_remaining: order.amount_remaining,
          status: order.status,
        })
        .eq('id', orderId);
      throw new Error('Failed to record trade');
    }

    const { error: movBuyerError } = await adminSupabase
      .from('property_ownership_movements')
      .insert({
        property_id: order.property_id,
        user_id: authUser.user.id,
        amount_delta: amount,
        reason: 'secondary_trade',
        ref_id: tradeId,
      });
    if (movBuyerError) {
      Logger.error('Failed to insert buyer movement', { error: movBuyerError });
      await adminSupabase
        .from('property_ownership_movements')
        .delete()
        .eq('ref_id', tradeId);
      await adminSupabase.from('exit_window_trades').delete().eq('id', tradeId);
      await adminSupabase
        .from('exit_window_orders')
        .update({
          amount_remaining: order.amount_remaining,
          status: order.status,
        })
        .eq('id', orderId);
      throw new Error('Failed to record trade');
    }

    const buyerTxId = crypto.randomUUID();
    const { error: buyerTxError } = await adminSupabase
      .from('vault_transactions')
      .insert({
        id: buyerTxId,
        user_id: authUser.user.id,
        type: 'exit_buy',
        amount: buyerPayment,
        property_id: order.property_id,
        status: 'approved',
      });
    if (buyerTxError) {
      Logger.error('Failed to create buyer vault tx', { error: buyerTxError });
      await adminSupabase
        .from('property_ownership_movements')
        .delete()
        .eq('ref_id', tradeId);
      await adminSupabase.from('exit_window_trades').delete().eq('id', tradeId);
      await adminSupabase
        .from('exit_window_orders')
        .update({
          amount_remaining: order.amount_remaining,
          status: order.status,
        })
        .eq('id', orderId);
      throw new Error('Failed to debit vault');
    }
    const { error: buyerVaultUpdateError } = await adminSupabase
      .from('user_vault')
      .update({
        balance: buyerVault.balance - buyerPayment,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authUser.user.id);
    if (buyerVaultUpdateError) {
      Logger.error('Failed to debit buyer vault', {
        error: buyerVaultUpdateError,
      });
      throw new Error(buyerVaultUpdateError.message);
    }

    const sellerVault = await getOrCreateUserVaultAdmin(order.seller_user_id);
    const sellerTxId = crypto.randomUUID();
    const { error: sellerTxError } = await adminSupabase
      .from('vault_transactions')
      .insert({
        id: sellerTxId,
        user_id: order.seller_user_id,
        type: 'exit_sell',
        amount: sellerProceeds,
        property_id: order.property_id,
        status: 'approved',
      });
    if (sellerTxError) {
      await adminSupabase
        .from('vault_transactions')
        .delete()
        .eq('id', buyerTxId);
      await adminSupabase
        .from('user_vault')
        .update({
          balance: buyerVault.balance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', authUser.user.id);
      await adminSupabase
        .from('property_ownership_movements')
        .delete()
        .eq('ref_id', tradeId);
      await adminSupabase.from('exit_window_trades').delete().eq('id', tradeId);
      await adminSupabase
        .from('exit_window_orders')
        .update({
          amount_remaining: order.amount_remaining,
          status: order.status,
        })
        .eq('id', orderId);
      throw new Error('Failed to credit seller vault');
    }
    const { error: sellerVaultUpdateError } = await adminSupabase
      .from('user_vault')
      .update({
        balance: (sellerVault.balance ?? 0) + sellerProceeds,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', order.seller_user_id);

    if (sellerVaultUpdateError) {
      Logger.error('Failed to credit seller vault', {
        error: sellerVaultUpdateError,
      });
      throw new Error(sellerVaultUpdateError.message);
    }

    if (platformFeeTotal > 0) {
      const feeTxId = crypto.randomUUID();
      const recipientId = await getExitWindowFeeRecipientUserId();
      if (recipientId) {
        try {
          const recipientVault = await getOrCreateUserVaultAdmin(recipientId);
          const { error: feeTxErr } = await adminSupabase
            .from('vault_transactions')
            .insert({
              id: feeTxId,
              user_id: recipientId,
              type: 'exit_window_fee_receipt',
              amount: platformFeeTotal,
              property_id: order.property_id,
              status: 'approved',
            });
          if (feeTxErr) throw feeTxErr;
          const { error: feeBalErr } = await adminSupabase
            .from('user_vault')
            .update({
              balance: (recipientVault.balance ?? 0) + platformFeeTotal,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', recipientId);
          if (feeBalErr) throw feeBalErr;
        } catch (err) {
          Logger.error(
            'Exit window fee recipient credit failed; recording platform fee only',
            {
              err,
              platformFeeTotal,
            },
          );
          await adminSupabase.from('vault_transactions').insert({
            id: crypto.randomUUID(),
            user_id: null,
            type: 'exit_window_platform_fee',
            amount: platformFeeTotal,
            property_id: order.property_id,
            status: 'approved',
          });
        }
      } else {
        await adminSupabase.from('vault_transactions').insert({
          id: feeTxId,
          user_id: null,
          type: 'exit_window_platform_fee',
          amount: platformFeeTotal,
          property_id: order.property_id,
          status: 'approved',
        });
      }
    }

    Logger.info('Exit window buy completed', {
      tradeId,
      orderId,
      amount,
      buyerId: authUser.user.id,
    });
    return {
      success: true,
      tradeId,
      amount,
      sellerProceeds,
      /** Total debited from buyer vault (base + buyer-side fee). */
      paymentAmount: buyerPayment,
      buyerPayment,
      baseCashValue,
      feeAmount: platformFeeTotal,
    };
  });

export const listOpenExitOrders = authActionClient
  .schema(listExitOrdersSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { exitWindowId, propertyId, status } = parsedInput;

    let query = supabase
      .from('exit_window_orders')
      .select(
        '*, property:property_id(id, title, price, images, city, state), exit_windows(id, start_at, end_at, status)',
      )
      .gt('amount_remaining', 0)
      .in('status', ['open', 'partially_filled']);

    if (exitWindowId) query = query.eq('exit_window_id', exitWindowId);
    if (propertyId) query = query.eq('property_id', propertyId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });
    if (error) throw new Error(error.message);
    const orders = await attachExitWindowPricesToOrders(
      supabase,
      (data ?? []) as ExitOrderDbRow[],
    );
    return { orders };
  });

export const listMyExitOrders = authActionClient.action(async ({ ctx }) => {
  const { supabase, authUser } = ctx;
  const { data, error } = await supabase
    .from('exit_window_orders')
    .select(
      '*, property:property_id(id, title, price, images, city, state), exit_windows(id, start_at, end_at, status)',
    )
    .eq('seller_user_id', authUser.user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const orders = await attachExitWindowPricesToOrders(
    supabase,
    (data ?? []) as ExitOrderDbRow[],
  );
  return { orders };
});

export const cancelExitOrder = authActionClient
  .schema(cancelExitOrderSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { orderId } = parsedInput;

    const { data: order, error: fetchError } = await supabase
      .from('exit_window_orders')
      .select('*')
      .eq('id', orderId)
      .eq('seller_user_id', authUser.user.id)
      .single();

    if (fetchError || !order) throw new Error('Order not found');
    if (!['open', 'partially_filled'].includes(order.status))
      throw new Error('Order cannot be cancelled');

    const { error: updateError } = await supabase
      .from('exit_window_orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (updateError) throw new Error(updateError.message);
    return { success: true };
  });

/** Get active exit window for UI (null if none). */
export const getActiveExitWindowAction = authActionClient.action(async () => {
  const window = await getActiveExitWindow();
  return { window };
});

/** Exit window fee % from app_settings (for buyer/seller UI). */
export const getExitWindowFeePercentageAction = authActionClient.action(
  async () => {
    const feePercentage = await getExitWindowFeePercentage();
    return { feePercentage };
  },
);

/** Min sell/buy amounts and fee for exit-window UI. */
export const getExitWindowLimitsAction = authActionClient.action(async () => {
  const [
    feePercentage,
    minSellAmount,
    minBuyAmount,
  ] = await Promise.all([
    getExitWindowFeePercentage(),
    getExitWindowMinSellAmount(),
    getExitWindowMinBuyAmount(),
  ]);
  return { feePercentage, minSellAmount, minBuyAmount };
});

/** Next draft window for “closed” messaging. */
export const getNextDraftExitWindowAction = authActionClient.action(
  async () => {
    const nextDraft = await getNextDraftExitWindow();
    return { nextDraft };
  },
);

/**
 * Rent + distribution stats for exit-window buy UI (uses service role for
 * monthly_rent / monthly_return aggregates; same basis as listings_view rent).
 */
export const getExitWindowPropertyBuyInsightsAction = authActionClient
  .schema(exitWindowPropertyIdSchema)
  .action(async ({ parsedInput }) => {
    const { propertyId } = parsedInput;
    const admin = await createSupabaseAdminClient();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const { data: rentRows } = await admin
      .from('monthly_rent')
      .select('month, total_rent_collected')
      .eq('property_id', propertyId)
      .gte('month', cutoffStr)
      .order('month', { ascending: false });

    const avgMonthlyRentCollected =
      rentRows && rentRows.length > 0
        ? rentRows.reduce(
            (s, r) => s + Number(r.total_rent_collected),
            0,
          ) / rentRows.length
        : null;

    const { data: returnRows } = await admin
      .from('monthly_return')
      .select('month, amount')
      .eq('property_id', propertyId)
      .gte('month', cutoffStr);

    const byMonth = new Map<string, number>();
    for (const row of returnRows ?? []) {
      const m = row.month as string;
      const key = m.length >= 7 ? m.slice(0, 7) : m;
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(row.amount));
    }
    const monthTotals = [...byMonth.values()];
    const avgMonthlyInvestorDistribution =
      monthTotals.length > 0
        ? monthTotals.reduce((a, b) => a + b, 0) / monthTotals.length
        : null;

    return {
      avgMonthlyRentCollectedLast3Months: avgMonthlyRentCollected,
      avgMonthlyInvestorDistributionLast3Months: avgMonthlyInvestorDistribution,
    };
  });

/** Get sellable stakes for current user in the active window (for create-order UI). */
export const getMyStakesForExitWindow = authActionClient.action(
  async ({ ctx }) => {
    const { supabase, authUser } = ctx;
    const window = await getActiveExitWindow();
    if (!window) return { stakes: [] };

    const { data: movements } = await supabase
      .from('property_ownership_movements')
      .select('property_id, amount_delta')
      .eq('user_id', authUser.user.id);

    const byProperty = (movements ?? []).reduce(
      (acc, row) => {
        acc[row.property_id] =
          (acc[row.property_id] ?? 0) + Number(row.amount_delta);
        return acc;
      },
      {} as Record<string, number>,
    );
    const propertyIds = Object.keys(byProperty).filter(
      (id) => byProperty[id] > 0,
    );
    if (propertyIds.length === 0) return { stakes: [] };

    const { data: openOrders } = await supabase
      .from('exit_window_orders')
      .select('property_id, amount_total')
      .eq('seller_user_id', authUser.user.id)
      .eq('exit_window_id', window.id)
      .in('status', ['open', 'partially_filled']);

    const committedByProperty = (openOrders ?? []).reduce(
      (acc, row) => {
        acc[row.property_id] =
          (acc[row.property_id] ?? 0) + Number(row.amount_total);
        return acc;
      },
      {} as Record<string, number>,
    );

    const { data: prices } = await supabase
      .from('exit_window_property_prices')
      .select('property_id, exit_price')
      .eq('exit_window_id', window.id)
      .in('property_id', propertyIds);

    const priceMap = (prices ?? []).reduce(
      (acc, row) => {
        acc[row.property_id] = row.exit_price;
        return acc;
      },
      {} as Record<string, number>,
    );

    const { data: properties } = await supabase
      .from('property')
      .select(
        'id, title, price, images, city, state, minimum_monthly_rent, maximum_monthly_rent',
      )
      .in('id', propertyIds);

    const stakes: ExitWindowStakeRow[] = (properties ?? [])
      .filter((p) => priceMap[p.id] != null)
      .map((p) => {
        const ownership = byProperty[p.id] ?? 0;
        const committed = committedByProperty[p.id] ?? 0;
        const sellable = Math.max(0, ownership - committed);
        const exitPrice = priceMap[p.id]!;
        return {
          propertyId: p.id,
          propertyTitle: p.title,
          propertyImages: p.images,
          propertyPrice: p.price,
          city: p.city,
          state: p.state,
          minimumMonthlyRent: p.minimum_monthly_rent,
          maximumMonthlyRent: p.maximum_monthly_rent,
          exitPrice,
          ownershipAmount: ownership,
          sellableAmount: sellable,
        };
      })
      .filter((s) => s.sellableAmount > 0);

    return { stakes };
  },
);
