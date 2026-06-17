/** Open sell order row with joined listing + exit price (from listOpenExitOrders). */
export type OrderWithExitPrice = {
  id: string;
  property_id: string;
  amount_remaining: number;
  amount_total: number;
  status: string;
  exit_window_exit_price: number | null;
  property: {
    id: string;
    title: string | null;
    price: number;
    images?: string[] | null;
    city?: string | null;
    state?: string | null;
  } | null;
};
