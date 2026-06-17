'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  createExitOrder,
  getActiveExitWindowAction,
  getExitWindowFeePercentageAction,
  getExitWindowLimitsAction,
  getMyStakesForExitWindow,
} from '@/actions/exit-window';

import { estimatedMonthlyRentForStake } from '@/components/dashboard/exit-window/exit-window-buy-rent';
import { rentPropsFromStake } from '@/components/dashboard/exit-window/exit-window-sell-rent';
import type { ExitWindowStakeRow } from '@/components/dashboard/exit-window/exit-window-stake-types';
import { SellFlowProgress } from '@/components/dashboard/exit-window/sell-flow-progress';
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
  feeAmountForPayment,
  ownershipPercentOfStake,
  sellerProceedsAfterSymmetricFee,
  valueAtExitPrice,
} from '@/utils/exit-window-pricing';
import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

type Step = 'amount' | 'review' | 'success';

type SuccessSnapshot = {
  orderId: string;
  ledgerStakeListed: number;
  baseCashValue: number;
  youReceive: number;
  platformFeeSeller: number;
  stakeRemainingLedger: number;
  ownershipRetainPct: number;
  estRentAfter: number | null;
};

type SellPropertyFlowProps = {
  propertyId: string;
};

function progressIndex(step: Step, confirmOpen: boolean): number {
  if (step === 'success') return 4;
  if (confirmOpen) return 3;
  if (step === 'review') return 2;
  return 1;
}

function formatOrderRef(orderId: string): string {
  const compact = orderId.replace(/-/g, '').slice(0, 12);
  return `#SL-${compact}`;
}

export function SellPropertyFlow({ propertyId }: SellPropertyFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('amount');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sellAmount, setSellAmount] = useState('');
  const [successSnapshot, setSuccessSnapshot] = useState<SuccessSnapshot | null>(
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

  const { data: stakes = [], isLoading: stakesLoading } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'my-stakes', window?.id],
    queryFn: async () => {
      const r = await getMyStakesForExitWindow();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return (r.data?.stakes ?? []) as ExitWindowStakeRow[];
    },
    enabled: !!window?.id,
    refetchOnWindowFocus: false,
  });

  const stake = useMemo(
    () => stakes.find((s) => s.propertyId === propertyId) ?? null,
    [stakes, propertyId],
  );

  const { data: feePct = 1.5 } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS, 'fee-pct'],
    queryFn: async () => {
      const r = await getExitWindowFeePercentageAction();
      if (!r) throw new Error('No response');
      if (r.serverError) throw new Error(r.serverError);
      return r.data?.feePercentage ?? 1.5;
    },
    enabled: !!window?.id,
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
    enabled: !!window?.id,
    refetchOnWindowFocus: false,
  });
  const minSellAmount = limitsData?.minSellAmount ?? 1;

  const amt = Number(sellAmount);
  const propertyPrice = stake?.propertyPrice ?? 0;
  const exitP = stake?.exitPrice ?? 0;
  const sellable = stake?.sellableAmount ?? 0;
  const ownership = stake?.ownershipAmount ?? 0;

  const inputValid =
    stake != null &&
    Number.isFinite(amt) &&
    amt >= minSellAmount &&
    amt <= sellable &&
    amt > 0;

  const baseCashValue =
    inputValid && propertyPrice > 0 && exitP > 0
      ? valueAtExitPrice(amt, propertyPrice, exitP)
      : null;

  const youReceive =
    baseCashValue != null
      ? sellerProceedsAfterSymmetricFee(baseCashValue, feePct)
      : null;

  const platformFeeSeller =
    baseCashValue != null && youReceive != null
      ? feeAmountForPayment(baseCashValue, feePct)
      : null;

  const stakeRemainingLedger =
    inputValid && stake ? Math.max(0, ownership - amt) : null;

  const ownershipSellingPct =
    inputValid && propertyPrice > 0
      ? ownershipPercentOfStake(amt, propertyPrice)
      : null;

  const ownershipRetainPct =
    stakeRemainingLedger != null && propertyPrice > 0
      ? ownershipPercentOfStake(stakeRemainingLedger, propertyPrice)
      : null;

  const pctSellingOfYourStake =
    inputValid && ownership > 0 ? (amt / ownership) * 100 : 0;

  const pctKeepingOfYourStake = Math.max(0, 100 - pctSellingOfYourStake);

  const estRentAfter =
    stake && stakeRemainingLedger != null
      ? estimatedMonthlyRentForStake(
          stakeRemainingLedger,
          rentPropsFromStake(stake),
        )
      : null;

  const createOrderAction = useAction(createExitOrder, {
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXIT_WINDOWS] });
      const id = (res.data as { orderId?: string } | undefined)?.orderId;
      if (
        id &&
        stake &&
        baseCashValue != null &&
        youReceive != null &&
        platformFeeSeller != null &&
        stakeRemainingLedger != null &&
        ownershipRetainPct != null
      ) {
        setSuccessSnapshot({
          orderId: id,
          ledgerStakeListed: amt,
          baseCashValue,
          youReceive,
          platformFeeSeller,
          stakeRemainingLedger,
          ownershipRetainPct,
          estRentAfter: estimatedMonthlyRentForStake(
            stakeRemainingLedger,
            rentPropsFromStake(stake),
          ),
        });
        setConfirmOpen(false);
        setStep('success');
        toast.success('Your order is live');
      }
    },
    onError: (e: { error?: { serverError?: string } }) => {
      toast.error(e?.error?.serverError ?? 'Failed to create order');
    },
  });

  const locationLine = stake
    ? [stake.city, stake.state].filter(Boolean).join(', ')
    : '';

  if (stakesLoading) {
    return (
      <div className='mx-auto max-w-lg space-y-4 py-4'>
        <div className='h-8 animate-pulse rounded bg-muted' />
        <div className='h-48 animate-pulse rounded-xl bg-muted' />
      </div>
    );
  }

  if (!stake || !window) {
    return (
      <div className='mx-auto max-w-lg rounded-xl border border-dashed p-8 text-center'>
        <p className='text-muted-foreground text-sm'>
          We couldn&apos;t find sellable stakes for this property in the
          current exit window.
        </p>
        <Button asChild className='mt-4' variant='outline'>
          <Link href={paths.dashboard.exitWindow.sell}>Back to my stakes</Link>
        </Button>
      </div>
    );
  }

  if (step === 'success' && successSnapshot && stake && window) {
    const snap = successSnapshot;
    return (
      <div className='mx-auto max-w-lg'>
        <SellFlowProgress currentStep={4} />
        <div className='rounded-xl border border-border bg-card p-5 shadow-sm'>
          <div className='success-wrap text-center'>
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3DE]'>
              <Check className='h-7 w-7 text-[#1EB45A]' strokeWidth={2.5} />
            </div>
            <h2 className='text-xl font-bold tracking-tight'>
              Your order is live
            </h2>
            <p className='text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed'>
              Your stake is now listed in the Exit Window.
              <br />
              When a buyer matches, {formatCurrency(snap.youReceive)} goes straight
              into your vault.
            </p>

            <div className='mt-4 flex gap-3 rounded-[10px] border border-[#B5D4F4] bg-[#E6F1FB] p-4 text-left'>
              <span className='bg-[#0A0E17] shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold text-white'>
                My sell orders
              </span>
              <p className='text-[#0C447C] text-xs leading-relaxed'>
                Your order is now visible on the Sell tab under &quot;My sell
                orders&quot;. <strong>Status: Open · 0% filled.</strong> You can
                cancel it at any time before it fills.
              </p>
            </div>

            <div className='mt-4 rounded-lg bg-muted/60 p-4 text-left text-sm'>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Property</span>
                <span className='font-semibold'>{stake.propertyTitle}</span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Stake listed (ledger)</span>
                <span className='font-semibold'>
                  {formatCurrency(snap.ledgerStakeListed)}
                </span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>You receive on match</span>
                <span className='font-semibold text-[#27500A]'>
                  {formatCurrency(snap.youReceive)}
                </span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Stake retained</span>
                <span className='font-semibold'>
                  {formatCurrency(snap.stakeRemainingLedger)} (
                  {snap.ownershipRetainPct.toFixed(2)}%)
                </span>
              </div>
              {snap.estRentAfter != null && (
                <div className='flex justify-between py-1'>
                  <span className='text-muted-foreground'>
                    Est. rental return going forward
                  </span>
                  <span className='font-semibold text-[#27500A]'>
                    {formatCurrency(snap.estRentAfter)}/mo
                  </span>
                </div>
              )}
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Window closes</span>
                <span className='font-semibold'>
                  {format(new Date(window.end_at), 'PPp')}
                </span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Order ID</span>
                <span className='font-mono text-[11px] text-muted-foreground'>
                  {formatOrderRef(snap.orderId)}
                </span>
              </div>
            </div>

            <p className='text-muted-foreground mt-4 rounded-lg border border-border bg-muted/30 p-3 text-left text-xs leading-relaxed'>
              If your order is not fully matched before the window closes, your
              remaining stake returns to your account automatically. A
              confirmation may be sent to your email.
            </p>

            <Button
              className='mt-4 w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
              onClick={() => router.push(paths.dashboard.exitWindow.sell)}
            >
              Back to Exit Window
            </Button>
            <Button asChild variant='outline' className='mt-2 w-full'>
              <Link href='/dashboard/exit-window/sell#my-orders'>
                View my sell orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-lg'>
      <SellFlowProgress currentStep={progressIndex(step, confirmOpen)} />

      {step === 'amount' && (
        <>
          <Link
            href={paths.dashboard.exitWindow.sell}
            className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-xs'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Back to my stakes
          </Link>
          <h1 className='text-lg font-semibold tracking-tight'>
            {stake.propertyTitle}
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            How much of your stake do you want to sell?
          </p>

          <div
            className={cn(
              'mt-6 rounded-xl border-2 border-[#1EB45A] bg-card p-4',
            )}
          >
            <div className='mb-3 flex justify-between gap-2'>
              <div>
                <div className='text-sm font-semibold'>Your current stake</div>
                <div className='text-muted-foreground text-xs'>
                  {locationLine ? `${locationLine} · ` : ''}Exit valuation:{' '}
                  {formatCurrency(exitP)}
                </div>
              </div>
              <span className='border border-[#C0DD97] bg-[#EAF3DE] shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-[#27500A]'>
                {formatCurrency(stake.ownershipAmount)}
              </span>
            </div>
            <div className='flex flex-wrap gap-1.5'>
              <span className='rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px]'>
                {ownershipPercentOfStake(
                  stake.ownershipAmount,
                  propertyPrice,
                ).toFixed(2)}
                % ownership
              </span>
              {estimatedMonthlyRentForStake(
                stake.ownershipAmount,
                rentPropsFromStake(stake),
              ) != null && (
                <span className='rounded-full border border-[#C0DD97] bg-[#EAF3DE] px-2 py-0.5 text-[11px] font-medium text-[#27500A]'>
                  Est.{' '}
                  {formatCurrency(
                    estimatedMonthlyRentForStake(
                      stake.ownershipAmount,
                      rentPropsFromStake(stake),
                    )!,
                  )}
                  /mo rental
                </span>
              )}
            </div>
          </div>

          <div className='mt-5'>
            <label className='text-sm font-medium'>Amount to sell (USh)</label>
            <input
              type='number'
              className='mt-1.5 w-full rounded-lg border-[1.5px] border-border px-3.5 py-2.5 text-[15px] font-semibold transition-colors focus:border-[#1EB45A] focus:outline-none'
              min={minSellAmount}
              max={sellable}
              step={1}
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              placeholder='0'
            />
            <p className='text-muted-foreground mt-1.5 text-xs'>
              Min: {formatCurrency(minSellAmount)} · Max:{' '}
              {formatCurrency(sellable)}
            </p>
          </div>

          {baseCashValue != null && youReceive != null && platformFeeSeller != null && (
            <div className='mt-4 rounded-[10px] border border-border bg-muted/50 p-4 text-sm'>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Ledger stake listed</span>
                <span className='font-semibold'>{formatCurrency(amt)}</span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Stake value at exit price
                </span>
                <span className='font-semibold'>
                  {formatCurrency(baseCashValue)}
                </span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Platform fee ({feePct}% seller side)
                </span>
                <span className='font-semibold text-[#A32D2D]'>
                  − {formatCurrency(platformFeeSeller)}
                </span>
              </div>
              <div className='my-2 h-px bg-border' />
              <div className='flex justify-between py-1'>
                <span className='font-semibold'>You receive when matched</span>
                <span className='text-base font-bold text-[#27500A]'>
                  {formatCurrency(youReceive)}
                </span>
              </div>
              <div className='my-2 h-px bg-border' />
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Stake remaining after sale
                </span>
                <span className='font-semibold text-[#27500A]'>
                  {stakeRemainingLedger != null &&
                    `${formatCurrency(stakeRemainingLedger)} (${ownershipRetainPct?.toFixed(2)}%)`}
                </span>
              </div>
            </div>
          )}

          {inputValid && (
            <div className='mt-4'>
              <div className='text-muted-foreground mb-1 flex justify-between text-[11px]'>
                <span>Selling: {pctSellingOfYourStake.toFixed(1)}%</span>
                <span>Keeping: {pctKeepingOfYourStake.toFixed(1)}%</span>
              </div>
              <div className='flex h-2 overflow-hidden rounded bg-border'>
                <div
                  className='h-full bg-[#E24B4A] transition-[width]'
                  style={{
                    width: `${Math.min(100, pctSellingOfYourStake)}%`,
                  }}
                />
                <div className='h-full flex-1 bg-[#1EB45A]' />
              </div>
            </div>
          )}

          <Button
            className='mt-5 w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
            disabled={!inputValid}
            onClick={() => setStep('review')}
          >
            Review fee breakdown →
          </Button>
        </>
      )}

      {step === 'review' &&
        inputValid &&
        baseCashValue != null &&
        youReceive != null &&
        platformFeeSeller != null && (
          <>
            <button
              type='button'
              onClick={() => setStep('amount')}
              className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-xs'
            >
              <ArrowLeft className='h-3.5 w-3.5' />
              Change amount
            </button>
            <h1 className='text-lg font-semibold tracking-tight'>
              Review your sell order
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              {stake.propertyTitle} · {formatCurrency(amt)} stake
            </p>

            <div className='mt-6 rounded-[10px] border border-border bg-card p-4 text-sm'>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Stake value at exit price
                </span>
                <span className='font-semibold'>
                  {formatCurrency(baseCashValue)}
                </span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Platform fee ({feePct}% seller side)
                </span>
                <span className='font-semibold text-[#A32D2D]'>
                  − {formatCurrency(platformFeeSeller)}
                </span>
              </div>
              <div className='my-2 h-px bg-border' />
              <div className='flex justify-between py-1'>
                <span className='text-base font-semibold'>You receive when matched</span>
                <span className='text-base font-bold text-[#27500A]'>
                  {formatCurrency(youReceive)}
                </span>
              </div>
              <div className='my-2 h-px bg-border' />
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>
                  Ownership you are selling
                </span>
                <span className='font-semibold'>
                  {ownershipSellingPct?.toFixed(2)}% of {stake.propertyTitle}
                </span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Ownership you retain</span>
                <span className='font-semibold text-[#27500A]'>
                  {ownershipRetainPct?.toFixed(2)}% (
                  {formatCurrency(stakeRemainingLedger ?? 0)} stake)
                </span>
              </div>
              {estRentAfter != null && (
                <div className='flex justify-between py-1'>
                  <span className='text-muted-foreground'>
                    Rental return after sale
                  </span>
                  <span className='font-semibold text-[#27500A]'>
                    Est. {formatCurrency(estRentAfter)}/mo
                  </span>
                </div>
              )}
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>Funds delivered to</span>
                <span className='font-semibold'>My Vault (on match)</span>
              </div>
            </div>

            <p className='text-muted-foreground mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed'>
              Settlement is instant when a buyer matches your order. Funds go
              directly into your vault. If the window closes before your order is
              fully matched, your remaining stake returns automatically.
            </p>

            <Button
              className='mt-4 w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
              onClick={() => setConfirmOpen(true)}
            >
              List for sale →
            </Button>
            <Button
              variant='outline'
              className='mt-2 w-full'
              onClick={() => setStep('amount')}
            >
              Go back
            </Button>
          </>
        )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='max-w-md rounded-xl'>
          <DialogHeader>
            <DialogTitle>Confirm your sell order</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            You are listing{' '}
            <strong>{formatCurrency(amt)}</strong> of your stake in{' '}
            {stake.propertyTitle}. You will receive{' '}
            <strong>{formatCurrency(youReceive ?? 0)}</strong> after the
            platform fee when a buyer matches. Your listing goes live immediately
            in the Exit Window.
          </p>
          <div className='rounded-lg bg-muted/60 p-3 text-sm'>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Property</span>
              <span className='font-semibold'>{stake.propertyTitle}</span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Stake listed</span>
              <span className='font-semibold'>{formatCurrency(amt)}</span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>You receive</span>
              <span className='font-semibold text-[#27500A]'>
                {formatCurrency(youReceive ?? 0)}
              </span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-muted-foreground'>Stake you retain</span>
              <span className='font-semibold'>
                {formatCurrency(stakeRemainingLedger ?? 0)}
              </span>
            </div>
          </div>
          <DialogFooter className='flex-col gap-2 sm:flex-col'>
            <Button
              className='w-full bg-[#1EB45A] font-semibold text-white hover:bg-[#18a04e]'
              disabled={createOrderAction.isExecuting || !inputValid}
              onClick={() => {
                if (!inputValid || !window) return;
                createOrderAction.execute({
                  exitWindowId: window.id,
                  propertyId: stake.propertyId,
                  amount: amt,
                });
              }}
            >
              {createOrderAction.isExecuting ? 'Listing…' : 'Yes, list for sale'}
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
