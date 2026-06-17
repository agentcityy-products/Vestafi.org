'use client';

import { ArrowRight, ChevronRight, Wallet } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { ApplicationFormValues } from '@/schema/applications';
import {
  contributionCapacityOptions,
  contributionFrequencyOptions,
  determineCategory,
  monthlyIncomeOptions,
} from '@/schema/applications';

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

interface FinancialIdentityStepProps {
  onNext: () => void;
  onReject: () => void;
}

export const FinancialIdentityStep = ({
  onNext,
  onReject,
}: FinancialIdentityStepProps) => {
  const form = useFormContext<ApplicationFormValues>();

  const handleContributionCapacitySelect = (value: string) => {
    form.setValue('contribution_capacity', value);
    // Don't auto-trigger rejection - wait for Continue button
  };

  return (
    <Card className='border-emerald-200 bg-white/95 shadow-lg backdrop-blur-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-3 text-2xl text-slate-900'>
          <Wallet className='h-6 w-6 text-emerald-600' />
          Financial Identity
        </CardTitle>
        <CardDescription className='text-lg text-slate-700'>
          Understanding your financial capacity helps us match you with the
          right opportunities.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        <FormField
          control={form.control}
          name='monthly_income'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                What best describes your monthly income range?
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='h-14 text-lg'>
                    {field.value ? (
                      monthlyIncomeOptions.find((o) => o.value === field.value)
                        ?.label
                    ) : (
                      <span className='text-muted-foreground'>
                        Select your monthly income
                      </span>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {monthlyIncomeOptions.map((option) => (
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
          name='contribution_capacity'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='mb-4 block text-base font-medium'>
                How much can you comfortably contribute when starting with
                Vestafi?
              </FormLabel>
              <div className='space-y-3'>
                {contributionCapacityOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() =>
                      handleContributionCapacitySelect(option.value)
                    }
                    className={`group w-full rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                      field.value === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <p
                          className={`font-medium group-hover:text-emerald-900 ${
                            field.value === option.value
                              ? 'text-emerald-900'
                              : 'text-slate-900'
                          }`}
                        >
                          {option.label}
                        </p>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 group-hover:text-emerald-600 ${
                          field.value === option.value
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('contribution_capacity') &&
          determineCategory(form.watch('contribution_capacity')) !== 1 && (
            <FormField
              control={form.control}
              name='contribution_frequency'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How often can you contribute to buy an apartment?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='h-14 text-lg'>
                        {field.value ? (
                          contributionFrequencyOptions.find(
                            (o) => o.value === field.value,
                          )?.label
                        ) : (
                          <span className='text-muted-foreground'>
                            Select contribution frequency
                          </span>
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contributionFrequencyOptions.map((option) => (
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
          )}

        {form.watch('contribution_capacity') && (
          <div className='pt-4'>
            {determineCategory(form.watch('contribution_capacity')) === 1 ? (
              // Category 1 (below 1M UGX) - show Continue button that triggers rejection
              <Button
                type='button'
                onClick={onReject}
                size='lg'
                className='w-full'
                icon={ArrowRight}
              >
                Continue
              </Button>
            ) : (
              // Category 2 or 3 - show Continue button only if frequency is selected
              form.watch('contribution_frequency') && (
                <Button
                  type='button'
                  onClick={onNext}
                  size='lg'
                  className='w-full'
                  icon={ArrowRight}
                >
                  Continue
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
