'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, LockIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useVaultBalance } from '@/hooks/queries/vault';

import {
  buyFromExitOrder,
  getActiveExitWindowAction,
  getExitWindowLimitsAction,
  getExitWindowPropertyBuyInsightsAction,
  listOpenExitOrders,
} from '@/actions/exit-window';

import { BuyFlowProgress } from '@/components/dashboard/exit-window/buy-flow-progress';
import {
  estimatedMonthlyRentForStake,
  estimateYearlyRentalYieldPercent,
} from '@/components/dashboard/exit-window/exit-window-buy-rent';
import type { OrderWithExitPrice } from '@/components/dashboard/exit-window/exit-window-buy-types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import {
  buyerPaymentWithSymmetricFee,
  ownershipPercentOfStake,
  valueAtExitPrice,
} from '@/utils/exit-window-pricing';
import { formatCurrency } from '@/utils/number-functions';

import { QueryKeys } from '@/constants/query-keys';

import type { ListingsViewRow } from '@/types/dao';

type Step = 'orders' | 'select' | 'review' | 'success';

type BuyPropertyFlowProps = {
  property: ListingsViewRow;
  hasAccess: boolean;
};

type PurchaseSuccess = {
  tradeId: string;
  paymentAmount: number;
  amount: number;
  baseCashValue: number;
  feePct: number;
};

function progressIndex(step: Step, confirmOpen: boolean): number {
  if (step === 'success') return 5;
  if (confirmOpen) return 4;
  if (step === 'review') return 3;
  if (step === 'select') return 2;
  return 1;
}

function formatTxnId(tradeId: string): string {
  const short = tradeId.replace(/-/g, '').slice(0, 12);
  return `#TXN-${short}`;
}

export function BuyPropertyFlow({ property, hasAccess }: BuyPropertyFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const propertyId = property.id!;
  const [step, setStep] = useState<Step>('orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseSuccess | null>(
    null,
  );

  const { data: window } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'active'],
    queryFn: async () => {
      const r = await getActiveExitWindowAction();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.window ?? null;
    },
    refetchOnWindowFocus: false,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'open-orders', window?.id, propertyId],
    queryFn: async () => {
      const r = await listOpenExitOrders({
        exitWindowId: window!.id,
        propertyId,
      });
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return (r.data?.orders ?? []) as unknown as OrderWithExitPrice[];
    },
    enabled: !!window?.id && !!propertyId,
    refetchOnWindowFocus: false,
  });

  const { data: limitsData } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'limits'],
    queryFn: async () => {
      const r = await getExitWindowLimitsAction();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data;
    },
    refetchOnWindowFocus: false,
  });

  const { data: insights } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'buy-insights', propertyId],
    queryFn: async () => {
      const r = await getExitWindowPropertyBuyInsightsAction({ propertyId });
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data;
    },
    enabled: !!propertyId,
    refetchOnWindowFocus: false,
  });

  const { data: vaultData, isLoading: vaultLoading } = useVaultBalance();
  const vaultBalance = vaultData?.balance ?? 0;

  const feePct = limitsData?.feePercentage ?? 1.5;
  const minBuyAmount = limitsData?.minBuyAmount ?? 1;

  const exitPrice = orders[0]?.exit_window_exit_price ?? null;
  const propertyPrice = property.price ?? 0;

  const yearlyYield = estimateYearlyRentalYieldPercent(property);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const stakeAmount = selectedOrder?.amount_remaining ?? 0;
  const baseCashValue =
    exitPrice != null && propertyPrice > 0 && stakeAmount > 0
      ? valueAtExitPrice(stakeAmount, propertyPrice, exitPrice)
      : null;
  const buyerTotal =
    baseCashValue != null
      ? buyerPaymentWithSymmetricFee(baseCashValue, feePct)
      : null;
  const buyerSideFee =
    baseCashValue != null && buyerTotal != null
      ? Math.round((buyerTotal - baseCashValue) * 100) / 100
      : null;
  const ownershipPct =
    propertyPrice > 0 && stakeAmount > 0
      ? ownershipPercentOfStake(stakeAmount, propertyPrice)
      : null;
  const estMonthlyRent = estimatedMonthlyRentForStake(stakeAmount, property);

  const shortfall =
    buyerTotal != null && !vaultLoading && vaultBalance < buyerTotal
      ? buyerTotal - vaultBalance
      : null;

  const orderMeetsMin =
    selectedOrder != null && selectedOrder.amount_remaining >= minBuyAmount;

  const buyAction = useAction(buyFromExitOrder, {
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXIT_WINDOWS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VAULT] });
      const d = res.data as
        | {
            tradeId?: string;
            paymentAmount?: number;
            amount?: number;
            baseCashValue?: number;
          }
        | undefined;
      if (
        d?.tradeId &&
        d.paymentAmount != null &&
        d.amount != null &&
        d.baseCashValue != null
      ) {
        setPurchaseResult({
          tradeId: d.tradeId,
          paymentAmount: d.paymentAmount,
          amount: d.amount,
          baseCashValue: d.baseCashValue,
          feePct,
        });
        setConfirmOpen(false);
        setStep('success');
        toast.success('Stake purchased successfully');
      }
    },
    onError: (e: { error?: { serverError?: string } }) => {
      toast.error(e?.error?.serverError ?? 'Failed to complete purchase');
    },
  });

  const handleConfirmPurchase = () => {
    if (!selectedOrder || !orderMeetsMin || !hasAccess) return;
    buyAction.execute({
      orderId: selectedOrder.id,
      amount: selectedOrder.amount_remaining,
    });
  };

  const locationLine = [property.city, property.state]
    .filter(Boolean)
    .join(', ');

  const distributionNotice =
    insights?.avgMonthlyInvestorDistributionLast3Months != null &&
    insights.avgMonthlyInvestorDistributionLast3Months > 0;

  if (ordersLoading) {
    return (
      <div className='mx-auto max-w-lg space-y-4 py-4'>
        <div className='h-8 animate-pulse rounded bg-muted' />
        <div className='h-40 animate-pulse rounded-xl bg-muted' />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='mx-auto max-w-lg rounded-xl border border-dashed p-8 text-center'>
        <p className='text-muted-foreground text-sm'>
          No open sell orders for this property in the current exit window.
        </p>
        <Button asChild className='mt-4' variant='outline'>
          <Link href='/dashboard/exit-window/buy'>Back to all properties</Link>
        </Button>
      </div>
    );
  }

  if (step === 'success' && purchaseResult) {
    return (
      <div className='mx-auto max-w-lg'>
        <BuyFlowProgress currentStep={5} />
        <div className='rounded-xl border border-border bg-card p-6 text-center shadow-sm'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3DE]'>
            <Check className='h-7 w-7 text-[#1EB45A]' strokeWidth={2.5} />
          </div>
          <h2 className='text-lg font-bold tracking-tight'>
            Stake purchased successfully
          </h2>
          <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
            You now co-own a part of {property.title}.
            <br />
            Your rental returns start from the next distribution cycle.
          </p>
          <div className='mt-4 rounded-lg bg-muted/60 p-4 text-left text-sm'>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Property</span>
              <span className='font-semibold'>
                {property.title}
                {locationLine ? `, ${locationLine}` : ''}
              </span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Ownership received</span>
              <span className='font-semibold text-[#27500A]'>
                {ownershipPercentOfStake(
                  purchaseResult.amount,
                  propertyPrice,
                ).toFixed(2)}
                %
              </span>
            </div>
            {estMonthlyRent != null && (
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Est. monthly rental return
                </span>
                <span className='font-semibold text-[#27500A]'>
                  {formatCurrency(
                    estimatedMonthlyRentForStake(
                      purchaseResult.amount,
                      property,
                    ) ?? 0,
                  )}
                </span>
              </div>
            )}
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Amount paid</span>
              <span className='font-semibold'>
                {formatCurrency(purchaseResult.paymentAmount)}
              </span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Transaction ID</span>
              <span className='font-mono text-[11px] text-muted-foreground'>
                {formatTxnId(purchaseResult.tradeId)}
              </span>
            </div>
          </div>
          <p className='text-muted-foreground mt-4 rounded-lg border border-border bg-muted/30 p-3 text-left text-xs leading-relaxed'>
            The seller has been notified. Your ownership has been recorded. A
            confirmation may be sent to your email.
          </p>
          <Button
            className='mt-4 w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
            onClick={() => router.push('/dashboard/exit-window/buy')}
          >
            Back to Exit Window
          </Button>
          <Button asChild variant='outline' className='mt-2 w-full'>
            <Link href='/dashboard/contributions'>View my contributions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-lg'>
      <BuyFlowProgress currentStep={progressIndex(step, confirmOpen)} />

      {(step === 'orders' || step === 'select') && (
        <>
          {step === 'orders' ? (
            <Link
              href='/dashboard/exit-window/buy'
              className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-xs'
            >
              <ArrowLeft className='h-3.5 w-3.5' />
              Back to all properties
            </Link>
          ) : (
            <button
              type='button'
              onClick={() => {
                setStep('orders');
                setSelectedOrderId(null);
              }}
              className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-xs'
            >
              <ArrowLeft className='h-3.5 w-3.5' />
              Change order
            </button>
          )}
          <h1 className='text-lg font-semibold tracking-tight'>
            {property.title} — available stakes
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            {orders.length} sell order{orders.length === 1 ? '' : 's'}
            {exitPrice != null && ` · Exit valuation ${formatCurrency(exitPrice)}`}
            {yearlyYield != null && ` · Rental return: ${yearlyYield}% yearly`}
          </p>

          {!hasAccess && (
            <Alert
              variant='destructive'
              className='mt-4 border-none bg-destructive/10 text-destructive'
            >
              <LockIcon className='h-4 w-4' />
              <AlertDescription className='ml-2 text-sm'>
                Active membership is required to purchase stakes.
              </AlertDescription>
            </Alert>
          )}

          <div className='mt-6 space-y-2'>
            {orders.map((o) => {
              const stake = o.amount_remaining;
              const own = ownershipPercentOfStake(stake, propertyPrice);
              const estRent = estimatedMonthlyRentForStake(stake, property);
              const isSelected = selectedOrderId === o.id;
              const dim =
                step === 'select' && selectedOrderId != null && !isSelected;

              return (
                <div
                  key={o.id}
                  className={cn(
                    'flex items-center justify-between rounded-[10px] border px-4 py-3 transition-colors',
                    isSelected &&
                      step === 'select' &&
                      'border-2 border-[#1EB45A] bg-[#EAF3DE]',
                    dim && 'pointer-events-none opacity-[0.38]',
                    !isSelected && step === 'select' && 'border-border',
                    !dim && !isSelected && 'border-border',
                  )}
                >
                  <div>
                    <div className='text-sm font-semibold'>
                      {formatCurrency(stake)}
                    </div>
                    <div className='text-muted-foreground mt-0.5 text-[11px]'>
                      {own.toFixed(2)}% ownership
                      {estRent != null
                        ? ` · Est. ${formatCurrency(estRent)}/mo rental`
                        : ''}
                    </div>
                  </div>
                  {step === 'orders' && (
                    <button
                      type='button'
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white',
                        'bg-[#1EB45A] hover:bg-[#18a04e]',
                        !hasAccess && 'cursor-not-allowed opacity-50',
                      )}
                      disabled={!hasAccess}
                      onClick={() => {
                        if (!hasAccess) return;
                        setSelectedOrderId(o.id);
                        setStep('select');
                      }}
                    >
                      Select
                    </button>
                  )}
                  {step === 'select' && isSelected && (
                    <span className='rounded-full bg-[#0A0E17] px-3.5 py-1.5 text-[11px] font-semibold text-white'>
                      Selected ✓
                    </span>
                  )}
                  {step === 'select' && !isSelected && (
                    <span className='text-muted-foreground text-[11px]'>
                      —
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className='text-muted-foreground mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed'>
            All prices are set at the current exit valuation.
            {distributionNotice
              ? ' Rental return estimates incorporate recent investor distributions (monthly_return) from this property over the last three months, alongside the published rent range (monthly_rent / listings).'
              : ' When recent distribution history is limited, estimates use the property rent range from listings (minimum_monthly_rent / maximum_monthly_rent).'}
          </p>

          {step === 'select' && selectedOrder && (
            <div className='mt-4 space-y-2'>
              {!orderMeetsMin && (
                <p className='text-destructive text-xs'>
                  This order is below the minimum stake to buy (
                  {formatCurrency(minBuyAmount)}). Choose another listing.
                </p>
              )}
              <Button
                className='w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
                disabled={!selectedOrderId || !orderMeetsMin}
                onClick={() => setStep('review')}
              >
                Review fee breakdown →
              </Button>
            </div>
          )}
        </>
      )}

      {step === 'review' && selectedOrder && baseCashValue != null && buyerTotal != null && (
        <>
          <button
            type='button'
            onClick={() => setStep('select')}
            className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-xs'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Change order
          </button>
          {!hasAccess && (
            <Alert
              variant='destructive'
              className='mb-4 border-none bg-destructive/10 text-destructive'
            >
              <LockIcon className='h-4 w-4' />
              <AlertDescription className='ml-2 text-sm'>
                Active membership is required to purchase stakes.
              </AlertDescription>
            </Alert>
          )}
          <h1 className='text-lg font-semibold tracking-tight'>
            Review your purchase
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            {property.title} · {formatCurrency(selectedOrder.amount_remaining)} stake
          </p>

          <div className='mt-6 rounded-[10px] border border-border bg-card p-4 text-sm'>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>
                Stake value at exit price
              </span>
              <span className='font-semibold'>{formatCurrency(baseCashValue)}</span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>
                Platform fee ({feePct}% buyer side)
              </span>
              <span className='font-semibold text-[#A32D2D]'>
                + {formatCurrency(buyerSideFee ?? 0)}
              </span>
            </div>
            <div className='my-2 h-px bg-border' />
            <div className='flex justify-between py-1'>
              <span className='font-semibold'>Total you pay</span>
              <span className='text-base font-bold'>{formatCurrency(buyerTotal)}</span>
            </div>
            <div className='my-2 h-px bg-border' />
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Ownership you receive</span>
              <span className='font-semibold text-[#27500A]'>
                {ownershipPct?.toFixed(2)}%
              </span>
            </div>
            {estMonthlyRent != null && (
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Est. monthly rental return
                </span>
                <span className='font-semibold text-[#27500A]'>
                  {formatCurrency(estMonthlyRent)}
                </span>
              </div>
            )}
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Property</span>
              <span className='font-semibold'>{property.title}</span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Payment source</span>
              <span className='font-semibold'>My Vault</span>
            </div>
          </div>

          {shortfall != null && shortfall > 0 && (
            <p className='text-muted-foreground mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed'>
              Your vault balance is {formatCurrency(vaultBalance)}. You will need
              to deposit {formatCurrency(shortfall)} before this purchase can
              complete. Funds are deducted from your vault instantly on
              confirmation.
            </p>
          )}

          <Button
            className='mt-4 w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
            disabled={
              !hasAccess ||
              !orderMeetsMin ||
              vaultLoading ||
              (buyerTotal != null && vaultBalance < buyerTotal) ||
              buyAction.isExecuting
            }
            onClick={() => setConfirmOpen(true)}
          >
            Confirm purchase →
          </Button>
          <Button
            variant='outline'
            className='mt-2 w-full'
            onClick={() => setStep('select')}
          >
            Go back
          </Button>
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='max-w-md rounded-xl border-border sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>One last check</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            You are about to buy a{' '}
            <strong>{ownershipPct?.toFixed(2)}% stake</strong> in{' '}
            {property.title} for{' '}
            <strong>{formatCurrency(buyerTotal ?? 0)}</strong> (including the{' '}
            {feePct}% platform fee). This action cannot be undone once confirmed.
          </p>
          <div className='rounded-lg bg-muted/60 p-3 text-sm'>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Property</span>
              <span className='font-semibold'>{property.title}</span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Ownership</span>
              <span className='font-semibold'>{ownershipPct?.toFixed(2)}%</span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Total charged</span>
              <span className='font-semibold'>
                {formatCurrency(buyerTotal ?? 0)}
              </span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Payment from</span>
              <span className='font-semibold'>My Vault</span>
            </div>
          </div>
          <DialogFooter className='flex-col gap-2 sm:flex-col'>
            <Button
              className='w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
              disabled={
                buyAction.isExecuting ||
                !hasAccess ||
                !orderMeetsMin ||
                (buyerTotal != null && vaultBalance < buyerTotal)
              }
              onClick={handleConfirmPurchase}
            >
              {buyAction.isExecuting ? 'Processing…' : 'Yes, complete purchase'}
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setConfirmOpen(false)}
            >
              No, go back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
