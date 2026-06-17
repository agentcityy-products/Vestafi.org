'use client';

import { ArrowRight, Heart } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { ApplicationFormValues } from '@/schema/applications';
import { goalsOptions, investmentTimelineOptions } from '@/schema/applications';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

interface GoalsMindsetStepProps {
  onNext: () => void;
}

export const GoalsMindsetStep = ({ onNext }: GoalsMindsetStepProps) => {
  const form = useFormContext<ApplicationFormValues>();

  return (
    <Card className='border-emerald-200 bg-white/95 shadow-lg backdrop-blur-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-3 text-2xl text-slate-900'>
          <Heart className='h-6 w-6 text-emerald-600' />
          Goals & Mindset
        </CardTitle>
        <CardDescription className='text-lg text-slate-700'>
          Understanding your goals helps us align you with the right
          opportunities.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        <FormField
          control={form.control}
          name='goals'
          render={() => (
            <FormItem>
              <FormLabel>What is your main goal with Vestafi?</FormLabel>
              <div className='space-y-3'>
                {goalsOptions.map((option) => (
                  <FormField
                    key={option.value}
                    control={form.control}
                    name='goals'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <label className='flex cursor-pointer items-start space-x-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50'>
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([
                                    ...currentValue,
                                    option.value,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (value) => value !== option.value,
                                    ),
                                  );
                                }
                              }}
                              className='mt-0.5'
                            />
                            <span className='font-medium text-slate-900'>
                              {option.label}
                            </span>
                          </label>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='investment_timeline'
          render={({ field }) => (
            <FormItem>
              <FormLabel>How long do you plan to stay invested?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='h-14 text-lg'>
                    {field.value ? (
                      investmentTimelineOptions.find(
                        (o) => o.value === field.value,
                      )?.label
                    ) : (
                      <span className='text-muted-foreground'>
                        Select investment timeline
                      </span>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {investmentTimelineOptions.map((option) => (
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
            disabled={
              !form.watch('goals')?.length || !form.watch('investment_timeline')
            }
            icon={ArrowRight}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
