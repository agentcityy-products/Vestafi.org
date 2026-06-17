'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getActiveExitWindowAction, getMyStakesForExitWindow } from '@/actions/exit-window';

import { estimatedMonthlyRentForStake } from '@/components/dashboard/exit-window/exit-window-buy-rent';
import { ExitWindowClosedNotice } from '@/components/dashboard/exit-window/exit-window-closed-notice';
import { ExitWindowMySellOrders } from '@/components/dashboard/exit-window/exit-window-my-sell-orders';
import { rentPropsFromStake } from '@/components/dashboard/exit-window/exit-window-sell-rent';
import type { ExitWindowStakeRow } from '@/components/dashboard/exit-window/exit-window-stake-types';
import { SellFlowProgress } from '@/components/dashboard/exit-window/sell-flow-progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ownershipPercentOfStake } from '@/utils/exit-window-pricing';
import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

export function ExitWindowSellContent() {
  /** Tab state: 'list' = browse properties, 'orders' = My sell orders. */
  const [tab, setTab] = useState('list');

  const { data: activeExitWindow, isFetching: windowLoading } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'active'],
    queryFn: async () => {
      const r = await getActiveExitWindowAction();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.window ?? null;
    },
    refetchOnWindowFocus: false,
  });

  /** Open "My sell orders" when URL hash is `#my-orders` (must use browser `window`, not `activeExitWindow`). */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncTabFromHash = () => {
      if (window.location.hash === '#my-orders') setTab('orders');
    };
    syncTabFromHash();
    window.addEventListener('hashchange', syncTabFromHash);
    return () => window.removeEventListener('hashchange', syncTabFromHash);
  }, []);

  const { data: stakesData, isLoading: stakesLoading } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'my-stakes', activeExitWindow?.id],
    queryFn: async (): Promise<ExitWindowStakeRow[]> => {
      const r = await getMyStakesForExitWindow();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.stakes ?? [];
    },
    enabled: !!activeExitWindow?.id,
    refetchOnWindowFocus: false,
  });
  const stakes = stakesData ?? [];

  if (windowLoading || stakesLoading) {
    return (
      <div className='mx-auto max-w-lg space-y-4'>
        <Skeleton className='h-24 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
      </div>
    );
  }

  if (!activeExitWindow) {
    return <ExitWindowClosedNotice />;
  }

  const closesLine = format(new Date(activeExitWindow.end_at), 'PPp');

  return (
    <div className='mx-auto max-w-lg space-y-6'>
      <Tabs value={tab} onValueChange={setTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='list'>List stake</TabsTrigger>
          <TabsTrigger value='orders'>My sell orders</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='mt-6 space-y-6'>
          <SellFlowProgress currentStep={0} />

          <div className='flex items-start justify-between gap-3'>
            <div>
              <h2 className='text-lg font-semibold tracking-tight'>
                Exit Window: Sell stakes
              </h2>
              <p className='text-muted-foreground mt-1 text-sm'>
                Select a property to list your stake for sale
              </p>
            </div>
            <Badge className='shrink-0 border border-[#C0DD97] bg-[#EAF3DE] font-semibold text-[#27500A] hover:bg-[#EAF3DE]'>
              OPEN
            </Badge>
          </div>

          <p className='text-muted-foreground text-xs leading-relaxed'>
            Window closes {closesLine} · When a buyer matches, funds go straight
            to your vault.
          </p>

          {stakes.length === 0 ? (
            <div className='rounded-xl border border-dashed p-8 text-center'>
              <p className='text-muted-foreground text-sm'>
                You have no sellable stakes in this window, or no exit price is
                set for your properties.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {stakes.map((s) => {
                const mainImage =
                  s.propertyImages && s.propertyImages.length > 0
                    ? s.propertyImages[0]
                    : '/placeholder-property.jpg';
                const loc = [s.city, s.state].filter(Boolean).join(', ');
                const estRent = estimatedMonthlyRentForStake(
                  s.ownershipAmount,
                  rentPropsFromStake(s),
                );

                return (
                  <div
                    key={s.propertyId}
                    className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'
                  >
                    <div className='relative h-[200px] w-full overflow-hidden'>
                      <img
                        src={mainImage}
                        alt={s.propertyTitle ?? ''}
                        className='h-full w-full object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-b from-[#0A0E17]/10 to-[#0A0E17]/65' />
                      <div className='absolute left-3 top-3 flex flex-wrap gap-1.5'>
                        <span className='rounded-full bg-[#1EB45A] px-2.5 py-1 text-[11px] font-semibold text-white'>
                          {formatCurrency(s.ownershipAmount)} stake
                        </span>
                        <span className='rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#0A0E17]'>
                          {ownershipPercentOfStake(
                            s.ownershipAmount,
                            s.propertyPrice,
                          ).toFixed(2)}
                          % ownership
                        </span>
                      </div>
                      <div className='absolute bottom-3 left-3.5 right-3.5'>
                        <div className='text-base font-semibold leading-snug text-white drop-shadow-sm'>
                          {s.propertyTitle}
                        </div>
                        {loc ? (
                          <div className='mt-1 flex items-center gap-1 text-xs text-white/80'>
                            <MapPin className='h-3 w-3 shrink-0' />
                            {loc}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className='space-y-3 p-4'>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='rounded-lg bg-muted/60 px-3 py-2'>
                          <div className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                            Listing value
                          </div>
                          <div className='text-sm font-semibold'>
                            {formatCurrency(s.propertyPrice)}
                          </div>
                        </div>
                        <div className='rounded-lg bg-muted/60 px-3 py-2'>
                          <div className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                            Exit valuation
                          </div>
                          <div className='text-sm font-semibold text-[#27500A]'>
                            {formatCurrency(s.exitPrice)}
                          </div>
                        </div>
                        <div className='rounded-lg bg-muted/60 px-3 py-2'>
                          <div className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                            Your stake value
                          </div>
                          <div className='text-sm font-semibold text-[#27500A]'>
                            {formatCurrency(s.ownershipAmount)}
                          </div>
                        </div>
                        <div className='rounded-lg bg-muted/60 px-3 py-2'>
                          <div className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                            Est. monthly rental
                          </div>
                          <div className='text-sm font-semibold text-[#27500A]'>
                            {estRent != null ? formatCurrency(estRent) : '—'}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={paths.dashboard.exitWindow.sellProperty(
                          s.propertyId,
                        )}
                        className='block w-full rounded-lg bg-[#1EB45A] py-2.5 text-center text-[13px] font-semibold text-white transition-colors hover:bg-[#18a04e]'
                      >
                        List stake for sale →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className='text-muted-foreground rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed'>
            If your order is not fully matched before the window closes on{' '}
            {closesLine}, your stake returns to your account automatically. No
            action needed on your part.
          </p>
        </TabsContent>

        <TabsContent value='orders' className='mt-6'>
          <div id='my-orders' className='scroll-mt-24'>
            <ExitWindowMySellOrders />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
