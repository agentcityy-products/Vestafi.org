import { ColumnDef } from '@tanstack/react-table';
import { Building2, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';

import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { MonthlyReturnRow, OwnedPropertiesViewRow } from '@/types/dao';

// Define the combined type for monthly returns with property info
export type MonthlyReturnWithProperty = MonthlyReturnRow & {
  property: OwnedPropertiesViewRow;
};

export const monthlyReturnsColumns: ColumnDef<MonthlyReturnWithProperty>[] = [
  {
    accessorKey: 'property.images',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Property' />
    ),
    cell: ({ row }) => {
      const property = row.original.property;
      const images = property?.images;

      return (
        <div className='flex items-center gap-3'>
          <div className='relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg'>
            {images && images.length > 0 ? (
              <Image
                src={images[0]}
                alt={property?.title || 'Property'}
                fill
                className='object-cover'
                sizes='64px'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-muted'>
                <Building2 className='h-6 w-6 text-muted-foreground' />
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='whitespace-nowrap font-medium'>
              {property?.title || 'Untitled Property'}
            </p>
            <div className='flex items-center text-sm text-muted-foreground'>
              <MapPin className='mr-1 h-3 w-3 flex-shrink-0' />
              <span className='whitespace-nowrap'>
                {[property?.city, property?.state, property?.country]
                  .filter(Boolean)
                  .join(', ') || 'Address not available'}
              </span>
            </div>
          </div>
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rent Earned' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return (
        <div className='text-center'>
          <p className='font-semibold text-green-600'>
            {formatCurrency(amount)}
          </p>
        </div>
      );
    },
    size: 120,
    meta: { align: 'center' },
  },
  {
    accessorKey: 'month',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Month' />
    ),
    cell: ({ row }) => {
      const month = row.getValue('month') as string;
      const formattedMonth = new Date(month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });

      return (
        <div className='flex items-center justify-center text-sm'>
          <Calendar className='mr-2 h-4 w-4 text-muted-foreground' />
          {formattedMonth}
        </div>
      );
    },
    size: 150,
    meta: { align: 'center' },
  },
  {
    accessorKey: 'property.ownership_percentage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ownership' />
    ),
    cell: ({ row }) => {
      const ownershipPercentage = row.original.property?.ownership_percentage;
      return (
        <div className='flex justify-center'>
          <Badge variant='secondary' className='font-mono'>
            {formatNumber(ownershipPercentage || 0, 2)}%
          </Badge>
        </div>
      );
    },
    size: 100,
    meta: { align: 'center' },
  },
  {
    accessorKey: 'property.total_investment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Your Contribution' />
    ),
    cell: ({ row }) => {
      const totalInvestment = row.original.property?.successful_investment;
      const propertyPrice = row.original.property?.price;

      return (
        <div className='text-center'>
          <p className='font-semibold'>
            {formatCurrency(totalInvestment || 0)}
          </p>
          <p className='text-sm text-muted-foreground'>
            of {formatCurrency(propertyPrice || 0)}
          </p>
        </div>
      );
    },
    size: 150,
    meta: { align: 'center' },
  },
  {
    accessorKey: 'property.minimum_monthly_return',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expected Range' />
    ),
    cell: ({ row }) => {
      const minReturn = row.original.property?.minimum_monthly_return;
      const maxReturn = row.original.property?.maximum_monthly_return;

      return (
        <div className='text-center'>
          <p className='text-sm font-medium text-blue-600'>
            {formatCurrency(minReturn || 0)} - {formatCurrency(maxReturn || 0)}
          </p>
          <p className='text-xs text-muted-foreground'>monthly range</p>
        </div>
      );
    },
    size: 150,
    meta: { align: 'center' },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Received Date' />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string;
      const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return (
        <div className='text-center text-sm text-muted-foreground'>
          {formattedDate}
        </div>
      );
    },
    size: 120,
    meta: { align: 'center' },
  },
];
