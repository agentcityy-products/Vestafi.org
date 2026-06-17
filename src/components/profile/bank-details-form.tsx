'use client';

import { Building2, CreditCard, User } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { ProfileFormData } from '@/schema/profile';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { maskAccountNumber } from '@/utils/string-functions';

export function BankDetailsForm() {
  const form = useFormContext<ProfileFormData>();
  const [isAccountNumberFocused, setIsAccountNumberFocused] = useState(false);

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex items-center gap-2'>
        <Building2 className='h-5 w-5 text-primary' />
        <h3 className='text-lg font-medium'>Bank Details</h3>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        <FormField
          control={form.control}
          name='bank_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Building2 className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Enter your bank name'
                    className='pl-10'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                The official name of your bank or financial institution.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='account_number'
            render={({ field }) => {
              const displayValue =
                field.value && !isAccountNumberFocused
                  ? maskAccountNumber(field.value)
                  : field.value || '';

              return (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <CreditCard className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        placeholder='Enter your account number'
                        className='pl-10'
                        type='text'
                        value={displayValue}
                        onFocus={() => {
                          setIsAccountNumberFocused(true);
                        }}
                        onBlur={(e) => {
                          setIsAccountNumberFocused(false);
                          field.onBlur();
                        }}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your bank account number for payments.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name='account_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Enter account holder name'
                      className='pl-10'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  The name on the bank account (must match your legal name).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className='mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4'>
        <div className='flex items-start gap-2'>
          <Building2 className='mt-0.5 h-5 w-5 text-amber-600' />
          <div>
            <h4 className='text-sm font-medium text-amber-800'>
              Important Security Notice
            </h4>
            <p className='mt-1 text-sm text-amber-700'>
              Your bank details are encrypted and stored securely. We only use
              this information for payment processing and will never share it
              with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
