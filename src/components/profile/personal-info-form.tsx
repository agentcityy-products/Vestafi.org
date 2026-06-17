'use client';

import { User } from 'lucide-react';
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

import PhoneInput from '../ui/form/controlled-phone-input';

export function PersonalInfoForm() {
  const form = useFormContext<ProfileFormData>();

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex items-center gap-2'>
        <User className='h-5 w-5 text-primary' />
        <h3 className='text-lg font-medium'>Personal Information</h3>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='first_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Enter your first name'
                    className='pl-10'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Your legal first name as it appears on official documents.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='last_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Enter your last name'
                    className='pl-10'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Your legal last name as it appears on official documents.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <PhoneInput
        control={form.control}
        phoneName='phone'
        codeName='country_code'
        label='Phone Number'
        description='Phone number must be 7-11 digits (numbers only).'
      />
    </div>
  );
}
