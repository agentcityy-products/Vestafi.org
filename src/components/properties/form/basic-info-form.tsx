'use client';

import { FileText, Sparkles, Type, Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { PropertyFormValues } from '@/schema/property';
import type { RentalPropertyFormValues } from '@/schema/rental-property';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoFormProps {
  showFirstTimeInvestors?: boolean;
}

export function BasicInfoForm({
  showFirstTimeInvestors = true,
}: BasicInfoFormProps) {
  const form = useFormContext<PropertyFormValues | RentalPropertyFormValues>();

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>Basic Information</h3>
        <div className='grid grid-cols-1 gap-4'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Type className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Enter property title'
                      className='pl-10'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  A catchy title for your property listing.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <FileText className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Textarea
                      placeholder='Enter property description'
                      className='min-h-[120px] pl-10'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Detailed description of the property.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {showFirstTimeInvestors && (
        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Ownership Presentation</h3>
          <FormField
            control={form.control}
            name={'opportunity_type' as keyof PropertyFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity Category</FormLabel>
                <Select
                  value={(field.value as string | undefined) ?? 'fractional'}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <div className='flex items-center gap-2'>
                        <Sparkles className='h-4 w-4 text-muted-foreground' />
                        <SelectValue placeholder='Choose a category' />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='prime'>Prime</SelectItem>
                    <SelectItem value='live'>Live</SelectItem>
                    <SelectItem value='fractional'>Fractional</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls the card language, emphasis, and ownership journey
                  members see in Current Ownership Openings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'allow_first_time_investors' as keyof PropertyFormValues}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <FormLabel className='text-base font-medium'>
                      Open To First-Time Members
                    </FormLabel>
                  </div>
                  <FormDescription className='text-sm text-muted-foreground'>
                    Allow members without previous Vestafi ownership to access
                    this opening. When disabled, prior ownership is required.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={(field.value as boolean | undefined) ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
