'use client';

import { Building, Flag, MapPin } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { RentalPropertyFormValues } from '@/schema/rental-property';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function RentalLocationForm() {
  const form = useFormContext<RentalPropertyFormValues>();

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium'>Location</h3>
      <div className='grid grid-cols-1 gap-4'>
        <FormField
          control={form.control}
          name='address_line_1'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Street address'
                    className='pl-10'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='address_line_2'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2 (Optional)</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Building className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Apartment, suite, unit, etc. (optional)'
                    className='pl-10'
                    {...field}
                    value={field.value || ''}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Building className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input placeholder='City' className='pl-10' {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='country'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Flag className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input placeholder='Country' className='pl-10' {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

