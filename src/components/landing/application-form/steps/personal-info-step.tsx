'use client';

import { ArrowRight, User } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { ApplicationFormValues } from '@/schema/applications';
import { ageRangeOptions } from '@/schema/applications';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import PhoneInput from '@/components/ui/form/controlled-phone-input';
import { CountrySelect } from '@/components/ui/form/country-select';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface PersonalInfoStepProps {
  onNext: () => void;
}

export const PersonalInfoStep = ({ onNext }: PersonalInfoStepProps) => {
  const form = useFormContext<ApplicationFormValues>();

  return (
    <Card className='border-emerald-200 bg-white/95 shadow-lg backdrop-blur-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-3 text-2xl text-slate-900'>
          <User className='h-6 w-6 text-emerald-600' />
          Personal Information
        </CardTitle>
        <CardDescription className='text-lg text-slate-700'>
          Let's start with the basics. This information helps us understand who
          you are.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        <FormField
          control={form.control}
          name='full_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter your full name'
                  className='h-14 p-4 text-lg'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='your@email.com'
                  className='h-14 p-4 text-lg'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PhoneInput
          control={form.control}
          phoneName='phone'
          codeName='phone_country_code'
          label='Phone Number'
          className='h-14'
          inputClassName='text-lg'
        />

        <CountrySelect
          control={form.control}
          name='country'
          label='Country of Residence'
          placeholder='Select your country'
        />

        <FormField
          control={form.control}
          name='age_range'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age Range</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='h-14 text-lg'>
                    {field.value ? (
                      ageRangeOptions.find((o) => o.value === field.value)
                        ?.label
                    ) : (
                      <span className='text-muted-foreground'>
                        Select your age range
                      </span>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ageRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='pt-4'>
          <Button
            type='button'
            onClick={onNext}
            size='lg'
            className='w-full'
            icon={ArrowRight}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
