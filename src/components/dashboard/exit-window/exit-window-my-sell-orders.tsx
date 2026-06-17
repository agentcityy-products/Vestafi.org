'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import {
  cancelExitOrder,
  getExitWindowFeePercentageAction,
  listMyExitOrders,
} from '@/actions/exit-window';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { cn } from '@/lib/utils';
import {
  sellerProceedsAfterSymmetricFee,
  valueAtExitPrice,
} from '@/utils/exit-window-pricing';
import { formatCurrency } from '@/utils/number-functions';

import { QueryKeys } from '@/constants/query-keys';

type OrderWithExitPrice = {
  id: string;
  exit_window_exit_price: number | null;
  property: {
    title: string | null;
    price: number;
    images?: string[] | null;
  } | null;
  amount_total: number;
  amount_remaining: number;
  status: string;
};

export function ExitWindowMySellOrders() {
  const queryClient = useQueryClient();

  const { data: myOrdersData } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'my-orders'],
    queryFn: async () => {
      const r = await listMyExitOrders();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.orders ?? [];
    },
    refetchOnWindowFocus: false,
  });
  const myOrders = (myOrdersData ?? []) as unknown as OrderWithExitPrice[];

  const { data: feePctData } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'fee-pct'],
    queryFn: async () => {
      const r = await getExitWindowFeePercentageAction();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.feePercentage ?? 1.5;
    },
    refetchOnWindowFocus: false,
  });
  const feePct = feePctData ?? 1.5;

  const getActionErrorMessage = (e: unknown) =>
    (e as { error?: { serverError?: string } })?.error?.serverError;

  const cancelOrderAction = useAction(cancelExitOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXIT_WINDOWS] });
      toast.success('Order cancelled');
    },
    onError: (e) =>
      toast.error(getActionErrorMessage(e) ?? 'Failed to cancel'),
  });

  return (
    <Card className='scroll-mt-24'>
      <CardHeader>
        <CardTitle>My sell orders</CardTitle>
      </CardHeader>
      <CardContent>
        {myOrders.length === 0 ? (
          <p className='text-muted-foreground'>You have no sell orders.</p>
        ) : (
          <ul className='space-y-2'>
            {myOrders.map((o) => {
              const progress =
                o.amount_total > 0
                  ? ((o.amount_total - o.amount_remaining) / o.amount_total) *
                    100
                  : 0;
              const propPrice = o.property?.price ?? 0;
              const exitP = o.exit_window_exit_price;
              const remainingPay =
                exitP != null && propPrice > 0
                  ? valueAtExitPrice(o.amount_remaining, propPrice, exitP)
                  : null;
              const remainingYou =
                remainingPay != null
                  ? sellerProceedsAfterSymmetricFee(remainingPay, feePct)
                  : null;
              return (
                <li
                  key={o.id}
                  className='flex flex-col items-start justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center'
                >
                  <div className='min-w-0 flex-1'>
                    <div className='mb-3 flex items-center gap-3'>
                      <h4 className='line-clamp-1 text-base font-semibold'>
                        {o.property?.title ?? 'Property'}
                      </h4>
                      <Badge
                        variant={
                          o.status === 'open'
                            ? 'default'
                            : o.status === 'partially_filled'
                              ? 'secondary'
                              : 'outline'
                        }
                        className='text-[10px] capitalize'
                      >
                        {o.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className='flex flex-col gap-4 sm:flex-row'>
                      <div className='flex aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted'>
                        {o.property?.images && o.property.images.length > 0 ? (
                          <img
                            src={o.property.images[0]}
                            alt='Property'
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center bg-accent text-xs text-muted-foreground'>
                            No Image
                          </div>
                        )}
                      </div>
                      <div className='flex-1 space-y-1 text-sm text-muted-foreground'>
                        <p>
                          <strong className='text-foreground'>
                            {formatCurrency(o.amount_remaining)}
                          </strong>{' '}
                          stake of {formatCurrency(o.amount_total)} remaining
                        </p>
                        {remainingPay != null && remainingYou != null && (
                          <p className='text-xs'>
                            Buyers pay up to{' '}
                            <strong className='text-foreground'>
                              {formatCurrency(remainingPay)}
                            </strong>{' '}
                            for what&apos;s left; you receive ~{' '}
                            <strong>{formatCurrency(remainingYou)}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 flex w-full flex-col gap-3 sm:mt-0 sm:w-64 sm:items-end'>
                    <div className='w-full space-y-2 text-right'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>Filled</span>
                        <span className='font-medium'>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                        <div
                          className={cn(
                            'h-full bg-primary transition-all',
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    {['open', 'partially_filled'].includes(o.status) && (
                      <Button
                        variant='destructive'
                        size='sm'
                        className='mt-2 w-full text-xs sm:w-auto'
                        disabled={cancelOrderAction.isExecuting}
                        onClick={() =>
                          cancelOrderAction.execute({ orderId: o.id })
                        }
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
