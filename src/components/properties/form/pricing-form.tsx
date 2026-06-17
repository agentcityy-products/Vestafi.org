'use client';

import { useFormContext } from 'react-hook-form';

import type { PropertyFormValues } from '@/schema/property';
import type { RentalPropertyFormValues } from '@/schema/rental-property';

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

interface PricingFormProps {
  priceLabel?: string;
  priceDescription?: string;
}

export function PricingForm({
  priceLabel = 'Price',
  priceDescription = 'Property sale price.',
}: PricingFormProps = {}) {
  const form = useFormContext<PropertyFormValues | RentalPropertyFormValues>();

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium'>Pricing</h3>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <FormField
          control={form.control}
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{priceLabel}</FormLabel>
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
              <FormDescription>{priceDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='minimum_monthly_rent'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Monthly Rent</FormLabel>
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
              <FormDescription>Minimum monthly rent.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='maximum_monthly_rent'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Monthly Rent</FormLabel>
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
              <FormDescription>Maximum monthly rent.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
