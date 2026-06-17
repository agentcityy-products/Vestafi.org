import type { OrderWithExitPrice } from '@/components/dashboard/exit-window/exit-window-buy-types';

export type PropertyOrderGroup = {
  propertyId: string;
  property: NonNullable<OrderWithExitPrice['property']>;
  exitPrice: number | null;
  orders: OrderWithExitPrice[];
  totalStakeAvailable: number;
  sellOrderCount: number;
};

/** One row per property: pooled liquidity + order count (1 seller ≈ 1 order). */
export function groupExitOrdersByProperty(
  orders: OrderWithExitPrice[],
): PropertyOrderGroup[] {
  const map = new Map<string, PropertyOrderGroup>();
  for (const o of orders) {
    const pid = o.property_id;
    if (!o.property?.id) continue;
    const existing = map.get(pid);
    if (!existing) {
      map.set(pid, {
        propertyId: pid,
        property: o.property,
        exitPrice: o.exit_window_exit_price,
        orders: [o],
        totalStakeAvailable: o.amount_remaining,
        sellOrderCount: 1,
      });
    } else {
      existing.orders.push(o);
      existing.totalStakeAvailable += o.amount_remaining;
      existing.sellOrderCount += 1;
      if (existing.exitPrice == null && o.exit_window_exit_price != null) {
        existing.exitPrice = o.exit_window_exit_price;
      }
    }
  }
  return Array.from(map.values());
}

export function propertyTitleInitials(title: string | null | undefined): string {
  if (!title?.trim()) return '?';
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return parts[0].slice(0, 2).toUpperCase();
}
