'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import {
  getActiveExitWindowAction,
  listOpenExitOrders,
} from '@/actions/exit-window';

import { BuyFlowProgress } from '@/components/dashboard/exit-window/buy-flow-progress';
import {
  groupExitOrdersByProperty,
  propertyTitleInitials,
} from '@/components/dashboard/exit-window/exit-window-buy-aggregate';
import type { OrderWithExitPrice } from '@/components/dashboard/exit-window/exit-window-buy-types';
import { ExitWindowClosedNotice } from '@/components/dashboard/exit-window/exit-window-closed-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

export type { OrderWithExitPrice } from '@/components/dashboard/exit-window/exit-window-buy-types';

export function ExitWindowBuyContent() {
  const { data: window, isFetching: windowLoading } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'active'],
    queryFn: async () => {
      const r = await getActiveExitWindowAction();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.window ?? null;
    },
    refetchOnWindowFocus: false,
  });

  const { data: openOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'open-orders', window?.id],
    queryFn: async () => {
      const r = await listOpenExitOrders({
        exitWindowId: window!.id,
      });
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.orders ?? [];
    },
    enabled: !!window?.id,
    refetchOnWindowFocus: false,
  });

  const openOrders = (openOrdersData ?? []) as unknown as OrderWithExitPrice[];
  const grouped = groupExitOrdersByProperty(openOrders);

  const closesIn =
    window?.end_at != null
      ? formatDistanceToNow(new Date(window.end_at), { addSuffix: true })
      : null;

  if (windowLoading || ordersLoading) {
    return (
      <div className='mx-auto max-w-lg space-y-4'>
        <Skeleton className='h-24 w-full rounded-xl' />
        <Skeleton className='h-40 w-full rounded-xl' />
      </div>
    );
  }

  if (!window) {
    return <ExitWindowClosedNotice />;
  }

  if (grouped.length === 0) {
    return (
      <div className='mx-auto max-w-lg rounded-xl border border-dashed p-12 text-center'>
        <h3 className='text-lg font-semibold tracking-tight'>
          No stakes available
        </h3>
        <p className='text-muted-foreground mt-2 text-sm'>
          There are currently no open sell orders in this exit window. Check
          back later.
        </p>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-lg space-y-6'>
      <BuyFlowProgress currentStep={0} />

      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>
            Exit Window: Buy stakes
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            {grouped.length} propert
            {grouped.length === 1 ? 'y' : 'ies'} with available stakes
            {closesIn != null && ` · Window closes ${closesIn}`}
          </p>
        </div>
        <Badge className='shrink-0 border border-[#C0DD97] bg-[#EAF3DE] font-semibold text-[#27500A] hover:bg-[#EAF3DE]'>
          OPEN
        </Badge>
      </div>

      <div className='space-y-3'>
        {grouped.map((g) => {
          const title = g.property.title ?? 'Property';
          const loc = [g.property.city, g.property.state]
            .filter(Boolean)
            .join(', ');
          const initials = propertyTitleInitials(title);
          const listing = g.property.price ?? 0;
          const exitP = g.exitPrice;
          const idx = grouped.indexOf(g) % 2;

          return (
            <div
              key={g.propertyId}
              className='rounded-xl border border-border bg-card p-5 shadow-sm'
            >
              <div className='mb-3 flex items-center gap-2.5'>
                <div
                  className={cn(
                    'flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold',
                    idx === 0
                      ? 'bg-[#EAF3DE] text-[#27500A]'
                      : 'bg-[#E6F1FB] text-[#0C447C]',
                  )}
                >
                  {initials}
                </div>
                <div className='min-w-0'>
                  <div className='text-sm font-semibold leading-tight'>
                    {title}
                  </div>
                  {loc ? (
                    <div className='text-muted-foreground text-xs'>{loc}</div>
                  ) : null}
                </div>
              </div>
              <div className='mb-3 flex flex-wrap gap-1.5'>
                <span className='rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground'>
                  Listing: {formatCurrency(listing)}
                </span>
                {exitP != null && (
                  <span className='rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground'>
                    Exit: {formatCurrency(exitP)}
                  </span>
                )}
                <span className='rounded-full border border-[#C0DD97] bg-[#EAF3DE] px-2 py-0.5 text-[11px] font-medium text-[#27500A]'>
                  {formatCurrency(g.totalStakeAvailable)} available
                </span>
                <span className='rounded-full border border-[#B5D4F4] bg-[#E6F1FB] px-2 py-0.5 text-[11px] font-medium text-[#0C447C]'>
                  {g.sellOrderCount} sell order
                  {g.sellOrderCount === 1 ? '' : 's'}
                </span>
              </div>
              <Button
                asChild
                className='w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
              >
                <Link href={paths.dashboard.exitWindow.buyProperty(g.propertyId)}>
                  View available stakes →
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
