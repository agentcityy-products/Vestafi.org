'use client';

import { DollarSign } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef,useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { RentalPropertyFormValues } from '@/schema/rental-property';
import { getForexRate } from '@/actions/forex';

import UGXIcon from '@/components/common/ugx-icon';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { formatNumber } from '@/utils/number-functions';

// Fallback rate: 1 USD = 3600 USH
const FALLBACK_RATE = 3600;

export function RentalPricingForm() {
  const form = useFormContext<RentalPropertyFormValues>();
  const price = form.watch('price');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const getForexRateAction = useAction(getForexRate);

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchRate = async () => {
      setIsLoadingRate(true);
      const result = await getForexRateAction.executeAsync({
        from: 'UGX',
        to: 'USD',
      });
      setIsLoadingRate(false);

      if (result?.data?.rate) {
        setExchangeRate(result.data.rate);
      } else {
        // Use fallback rate
        setExchangeRate(FALLBACK_RATE);
      }
    };

    fetchRate();
  }, []);

  const priceRef = useRef<number | undefined>(price);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Convert price from USH to USD when price changes (with debounce)
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!price || price === 0) {
      form.setValue('price_usd', 0, { shouldValidate: false });
      priceRef.current = price;
      return;
    }

    // Only fetch if price actually changed
    if (priceRef.current === price && exchangeRate) {
      // Price hasn't changed, just recalculate with existing rate
      const priceInUsd = price / exchangeRate;
      form.setValue('price_usd', Math.round(priceInUsd * 100) / 100, {
        shouldValidate: false,
      });
      return;
    }

    // Debounce the API call (500ms) to avoid too many requests
    debounceTimerRef.current = setTimeout(async () => {
      // Fetch fresh rate on each price change
      setIsLoadingRate(true);
      const result = await getForexRateAction.executeAsync({
        from: 'UGX',
        to: 'USD',
      });
      setIsLoadingRate(false);

      const rate = result?.data?.rate || FALLBACK_RATE;
      setExchangeRate(rate);
      priceRef.current = price;

      // Convert: price in USH / rate = price in USD
      // Example: 3600 USH / 3600 = 1 USD
      const priceInUsd = price / rate;
      form.setValue('price_usd', Math.round(priceInUsd * 100) / 100, {
        shouldValidate: false,
      });
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [price, form, exchangeRate, getForexRateAction]);

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium'>Pricing</h3>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Per Night (USH)</FormLabel>
              <FormControl>
                <div className='relative'>
                  <UGXIcon className='absolute left-2 top-1.5' />
                  <Input
                    className='pl-10'
                    {...field}
                    placeholder='0'
                    value={formatNumber(field.value)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const numericValue = rawValue ? parseInt(rawValue) : 0;
                      field.onChange(numericValue);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Price per night in Ugandan Shillings (USH).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='price_usd'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Per Night (USD)</FormLabel>
              <FormControl>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    className='pl-10'
                    {...field}
                    placeholder='0'
                    value={formatNumber(field.value)}
                    disabled
                    readOnly
                  />
                </div>
              </FormControl>
              <FormDescription>
                Price per night in US Dollars (read-only, calculated from USH
                using current exchange rate).
                {isLoadingRate && ' Loading exchange rate...'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
