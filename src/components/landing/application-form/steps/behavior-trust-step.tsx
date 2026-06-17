'use client';

import { ArrowRight, Shield } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { ApplicationFormValues } from '@/schema/applications';
import { joiningAsOptions, referralSourceOptions } from '@/schema/applications';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface BehaviorTrustStepProps {
  onNext: () => void;
  isSubmitting?: boolean;
}

export const BehaviorTrustStep = ({
  onNext,
  isSubmitting,
}: BehaviorTrustStepProps) => {
  const form = useFormContext<ApplicationFormValues>();

  return (
    <Card className='border-emerald-200 bg-white/95 shadow-lg backdrop-blur-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-3 text-2xl text-slate-900'>
          <Shield className='h-6 w-6 text-emerald-600' />
          Behavior & Trust
        </CardTitle>
        <CardDescription className='text-lg text-slate-700'>
          Help us understand your commitment and how you found us.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        <FormField
          control={form.control}
          name='webinar_willing'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Are you willing to attend a 30–45 minute onboarding webinar to
                understand how Vestafi works?
              </FormLabel>
              <div className='space-y-3'>
                <label className='flex cursor-pointer items-start space-x-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50'>
                  <input
                    type='radio'
                    checked={field.value === true}
                    onChange={() => field.onChange(true)}
                    className='mt-0.5 h-4 w-4 cursor-pointer accent-emerald-600'
                  />
                  <span className='font-medium text-slate-900'>Yes</span>
                </label>
                <label className='flex cursor-pointer items-start space-x-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50'>
                  <input
                    type='radio'
                    checked={field.value === false}
                    onChange={() => field.onChange(false)}
                    className='mt-0.5 h-4 w-4 cursor-pointer accent-emerald-600'
                  />
                  <span className='font-medium text-slate-900'>No</span>
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='joining_as'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Are you joining as an individual or representing a group/family?
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='h-14 text-lg'>
                    {field.value ? (
                      joiningAsOptions.find((o) => o.value === field.value)
                        ?.label
                    ) : (
                      <span className='text-muted-foreground'>
                        Select how you're joining
                      </span>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {joiningAsOptions.map((option) => (
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

        <FormField
          control={form.control}
          name='referral_source'
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you hear about Vestafi?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='h-14 text-lg'>
                    {field.value ? (
                      referralSourceOptions.find((o) => o.value === field.value)
                        ?.label
                    ) : (
                      <span className='text-muted-foreground'>
                        Select referral source
                      </span>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {referralSourceOptions.map((option) => (
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

        <FormField
          control={form.control}
          name='referred_by'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Referral Code (Optional)
                {field.value && (
                  <span className='ml-2 text-sm font-normal text-muted-foreground'>
                    - Enter the referral code if someone referred you
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <input
                  type='text'
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Enter referral code (e.g., john.doe)'
                  className='flex h-14 w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-lg ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </FormControl>
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
            disabled={
              form.watch('webinar_willing') === undefined ||
              !form.watch('joining_as') ||
              !form.watch('referral_source')
            }
            isLoading={isSubmitting}
            icon={ArrowRight}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
