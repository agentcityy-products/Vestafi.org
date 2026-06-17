'use client';

import { AlertCircle, Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { useCallback, useState } from 'react';

import UGXIcon from '@/components/common/ugx-icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { businessConfig } from '@/config/app';

import { ListingsViewRow } from '@/types/dao';

interface InvestmentCalculatorProps {
  property: ListingsViewRow;
  onInvest: (
    amount: number,
    expectedReturns: { min: number; max: number },
  ) => void;
}

const MIN_INVESTMENT = businessConfig.minInvestmentAmount;

export const InvestmentCalculator = ({
  property,
  onInvest,
}: InvestmentCalculatorProps) => {
  const [investmentAmount, setInvestmentAmount] = useState<string>('0');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Calculate values
  const propertyValue = property.price || 0;
  const totalInvested = property.total_investment || 0;
  const remainingAmount = propertyValue - totalInvested;

  // Check if user must invest the exact remaining amount when remaining < MIN_INVESTMENT
  const mustInvestRemaining =
    remainingAmount > 0 && remainingAmount <= MIN_INVESTMENT;

  // Calculate expected returns based on monthly rent range
  const calculateExpectedReturns = useCallback(
    (amount: number) => {
      if (
        !property.minimum_monthly_rent ||
        !property.maximum_monthly_rent ||
        propertyValue === 0
      ) {
        return { min: 0, max: 0 };
      }

      const investmentShare = amount / propertyValue;
      const minMonthlyReturn = property.minimum_monthly_rent * investmentShare;
      const maxMonthlyReturn = property.maximum_monthly_rent * investmentShare;

      return {
        min: minMonthlyReturn,
        max: maxMonthlyReturn,
      };
    },
    [
      property.minimum_monthly_rent,
      property.maximum_monthly_rent,
      propertyValue,
    ],
  );

  const setMaxAmount = () => {
    setInvestmentAmount(remainingAmount.toString());
  };

  const handleInvestClick = () => {
    const amount = mustInvestRemaining
      ? remainingAmount
      : parseInt(investmentAmount) || 0;
    const expectedReturns = calculateExpectedReturns(amount);
    onInvest(amount, expectedReturns);
  };

  // Validation logic
  const amount = mustInvestRemaining
    ? remainingAmount
    : parseInt(investmentAmount) || 0;
  const isValidAmount = amount > 0 && amount <= remainingAmount;
  const isMinimumMet = amount >= MIN_INVESTMENT || mustInvestRemaining;
  const canInvest = isValidAmount && isMinimumMet;

  const expectedReturns =
    amount > 0 ? calculateExpectedReturns(amount) : { min: 0, max: 0 };
  const futureOwnership =
    propertyValue > 0 ? (amount / propertyValue) * 100 : 0;

  return (
    <Card className='sticky top-6'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calculator className='h-5 w-5' />
          Contribution Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Investment Amount Input */}
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label htmlFor='investment-amount'>Contribution Amount (UGX)</Label>
            <p className='text-xs text-muted-foreground'>
              Minimum: {formatCurrency(MIN_INVESTMENT)}
            </p>
          </div>
          <div className='relative'>
            <UGXIcon className='absolute left-2 top-1.5' />
            <Input
              id='investment-amount'
              type='text'
              placeholder={
                mustInvestRemaining
                  ? remainingAmount.toString()
                  : 'Enter amount'
              }
              value={formatNumber(
                mustInvestRemaining ? remainingAmount : investmentAmount,
              )}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d]/g, '');
                const numericValue = rawValue ? parseInt(rawValue) : 0;
                setInvestmentAmount(numericValue.toString());
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              disabled={mustInvestRemaining}
              className={cn('pl-10', mustInvestRemaining ? 'pr-4' : 'pr-20')}
            />
            {!mustInvestRemaining && (
              <Button
                variant='ghost'
                size='sm'
                onClick={setMaxAmount}
                className='absolute right-1 top-1 h-8 px-3 text-xs'
              >
                Max
              </Button>
            )}
          </div>

          {mustInvestRemaining && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                The remaining amount ({formatCurrency(remainingAmount)}) is less
                or equal to the minimum contribution of{' '}
                {formatCurrency(MIN_INVESTMENT)}. You must invest the full
                remaining amount to complete the property funding.
              </AlertDescription>
            </Alert>
          )}

          {!mustInvestRemaining &&
            !isInputFocused &&
            amount > 0 &&
            amount < MIN_INVESTMENT && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Minimum contribution amount is{' '}
                  {formatCurrency(MIN_INVESTMENT)}.
                </AlertDescription>
              </Alert>
            )}

          {!mustInvestRemaining &&
            !isInputFocused &&
            amount > remainingAmount && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Amount exceeds available contribution limit of{' '}
                  {formatCurrency(remainingAmount)}.
                </AlertDescription>
              </Alert>
            )}
        </div>

        {/* Investment Summary */}
        {amount > 0 && isValidAmount && (
          <>
            <Separator />

            <div className='space-y-4'>
              <h4 className='flex items-center gap-2 font-semibold'>
                <TrendingUp className='h-4 w-4' />
                Contribution Summary
              </h4>

              <div className='space-y-3 rounded-lg bg-muted/50 p-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Contribution Amount
                  </span>
                  <span className='font-semibold'>
                    {formatCurrency(amount)}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Percentage Ownership
                  </span>
                  <span className='font-semibold'>
                    {formatNumber(futureOwnership, 2)}%
                  </span>
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Your Minimum Monthly Return
                  </span>
                  <span className='font-semibold text-green-600'>
                    {formatCurrency(expectedReturns.min)}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Your Maximum Monthly Return
                  </span>
                  <span className='font-semibold text-green-600'>
                    {formatCurrency(expectedReturns.max)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Invest Button */}
        <Button
          onClick={handleInvestClick}
          disabled={!canInvest}
          className='w-full'
          size='lg'
        >
          <DollarSign className='mr-2 h-4 w-4' />
          Invest {formatCurrency(amount || 0)}
        </Button>
      </CardContent>
    </Card>
  );
};
