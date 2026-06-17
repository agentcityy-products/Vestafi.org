'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  CreateMonthlyRentSchema,
  createMonthlyRentSchema,
} from '@/schema/monthly-rent';

import { PropertyTitleWithThumb } from '@/components/common/property-title-with-thumb';
import { MonthSelector } from '@/components/properties/monthly-rent/month-selector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { formatCurrency, formatNumber } from '@/utils/number-functions';

import UGXIcon from '../../common/ugx-icon';

import { ListingWithRent } from '@/types/dao';

interface MonthlyRentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: ListingWithRent;
  onSubmit: (data: CreateMonthlyRentSchema) => void;
}

export function MonthlyRentDialog({
  isOpen,
  onClose,
  property,
  onSubmit,
}: MonthlyRentDialogProps) {
  const form = useForm<z.infer<typeof createMonthlyRentSchema>>({
    resolver: zodResolver(createMonthlyRentSchema),
    defaultValues: {
      propertyId: property.id!,
      month: format(new Date(), 'yyyy-MM'),
      totalRentCollected: 0,
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Monthly Rent</DialogTitle>
          <DialogDescription>
            Add rent collection data for this listing.
          </DialogDescription>
        </DialogHeader>

        <PropertyTitleWithThumb
          title={property.title}
          images={property.images}
          size='md'
          subtitle={
            <span className='line-clamp-2'>
              {[property.city, property.state, property.country]
                .filter(Boolean)
                .join(', ')}
            </span>
          }
        />

        <Alert className='border-blue-200 bg-blue-50'>
          <AlertDescription className='text-sm text-blue-800'>
            <strong>Note:</strong> Adding monthly rent will automatically
            calculate and distribute the proportional share to all property
            investors based on their Contribution amounts.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='month'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <MonthSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Select month'
                      maxDate={new Date().toISOString().slice(0, 7)}
                      minDate='2025-01'
                      rents={property.rents}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='totalRentCollected'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Rent Collected</FormLabel>
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
                          const numericValue = rawValue
                            ? parseInt(rawValue)
                            : 0;
                          field.onChange(numericValue);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {field.value > 0 && (
                    <p className='text-xs text-muted-foreground'>
                      Amount: {formatCurrency(field.value)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adding...' : 'Add Rent'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
