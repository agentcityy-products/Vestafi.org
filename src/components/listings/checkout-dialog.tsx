'use client';

import {
  ArrowRight,
  Building2,
  Check,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

import { PropertyTitleWithThumb } from '@/components/common/property-title-with-thumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { ListingsViewRow } from '@/types/dao';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: ListingsViewRow;
  investmentAmount: number;
  expectedReturns: {
    min: number;
    max: number;
  };
  onConfirm: () => void;
}

export const CheckoutDialog = ({
  isOpen,
  onClose,
  property,
  investmentAmount,
  expectedReturns,
  onConfirm,
}: CheckoutDialogProps) => {
  const propertyValue = property.price || 0;
  const futureOwnership =
    propertyValue > 0 ? (investmentAmount / propertyValue) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Confirm Contribution
          </DialogTitle>
          <DialogDescription>
            Review your Contribution details before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Property Info */}
          <div className='rounded-lg bg-muted/50 p-4'>
            <PropertyTitleWithThumb
              title={property.title}
              images={property.images}
              size='md'
              subtitle={
                <p className='line-clamp-2'>
                  {property.city}, {property.state}, {property.country}
                </p>
              }
            />
          </div>

          {/* Investment Summary */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Contribution Amount
              </span>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4' />
                <span className='text-lg font-semibold'>
                  {formatCurrency(investmentAmount)}
                </span>
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <div className='mb-2 flex items-center gap-2'>
                <TrendingUp className='h-4 w-4' />
                <span className='font-medium'>Expected Monthly Returns</span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Minimum</span>
                <span className='font-semibold text-green-600'>
                  {formatCurrency(expectedReturns.min)}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Maximum</span>
                <span className='font-semibold text-green-600'>
                  {formatCurrency(expectedReturns.max)}
                </span>
              </div>
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Your Ownership
              </span>
              <Badge variant='secondary'>
                {formatNumber(futureOwnership, 2)}%
              </Badge>
            </div>
          </div>

          {/* Important Notice */}
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <h5 className='mb-2 font-medium text-blue-900'>Important Notice</h5>
            <ul className='space-y-1 text-sm text-blue-800'>
              <li>• Returns are estimates based on expected rental income</li>
              <li>• Actual returns may vary based on market conditions</li>
              <li>• This is a long-term Contribution opportunity</li>
            </ul>
          </div>
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          <Button
            variant='outline'
            onClick={onClose}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} className='w-full sm:w-auto'>
            <Check className='mr-2 h-4 w-4' />
            Confirm Contribution
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
