'use client';

import { Mail, MapPin, User, Users } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

import PhoneInput from '../ui/form/controlled-phone-input';

export function NextOfKinForm() {
  const form = useFormContext<ProfileFormData>();

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex items-center gap-2'>
        <Users className='h-5 w-5 text-primary' />
        <h3 className='text-lg font-medium'>Next of Kin</h3>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='next_of_kin.first_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Enter first name'
                    className='pl-10'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                The legal first name of your next of kin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='next_of_kin.last_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Enter last name'
                    className='pl-10'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                The legal last name of your next of kin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name='next_of_kin.email'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  type='email'
                  placeholder='Enter email address'
                  className='pl-10'
                  {...field}
                  value={field.value || ''}
                />
              </div>
            </FormControl>
            <FormDescription>
              A valid email address to contact your next of kin.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <PhoneInput
        control={form.control}
        phoneName='next_of_kin.phone'
        codeName='next_of_kin.country_code'
        label='Phone Number'
        description='Phone number must be 7-11 digits (numbers only).'
      />

      <FormField
        control={form.control}
        name='next_of_kin.relationship'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Relationship</FormLabel>
            <FormControl>
              <div className='relative'>
                <Users className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='e.g., Spouse, Parent, Sibling, Friend'
                  className='pl-10'
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription>
              Your relationship to this person (e.g., spouse, parent, sibling).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='next_of_kin.address'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <div className='relative'>
                <MapPin className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Textarea
                  placeholder='Enter complete address'
                  className='min-h-[80px] pl-10 pt-3'
                  {...field}
                  value={field.value || ''}
                />
              </div>
            </FormControl>
            <FormDescription>
              Complete address where your next of kin can be reached.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
