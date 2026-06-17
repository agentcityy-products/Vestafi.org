import { ColumnDef } from '@tanstack/react-table';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

import type { MyStakeRow } from '@/actions/investment';

import { PropertyTitleWithThumb } from '@/components/common/property-title-with-thumb';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';

import { formatDateTime } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import { InvestmentRow, ProfileRow, PropertyRow } from '@/types/dao';

// Define the type based on the actual investment query structure
export type InvestmentWithRelations = InvestmentRow & {
  property: PropertyRow;
  user: ProfileRow;
};

/** Columns for the contributions table when using ledger-based stakes (Property, Amount, Type, Status, Date). */
export const stakesColumns: ColumnDef<MyStakeRow>[] = [
  {
    accessorKey: 'property',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Property' />
    ),
    cell: ({ row }) => {
      const property = row.original.property;

      return (
        <PropertyTitleWithThumb
          title={property?.title || 'Untitled Property'}
          images={property?.images ?? null}
          size='md'
          subtitle={
            <div className='flex items-center'>
              <MapPin className='mr-1 h-3 w-3 flex-shrink-0' />
              <span className='whitespace-nowrap'>
                {property
                  ? `${property.city ?? ''}, ${property.country ?? ''}`
                  : 'Unknown location'}
              </span>
            </div>
          }
        />
      );
    },
    size: 300,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => (
      <div className='text-left'>
        <span className='whitespace-nowrap text-sm'>
          {formatDateTime(row.original.date)}
        </span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => (
      <div className='text-left'>
        <span className='ml-4 font-semibold'>
          {formatCurrency(row.original.amount)}
        </span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const label =
        type === 'direct'
          ? 'Direct'
          : type === 'acquired'
            ? 'Acquired'
            : type === 'both'
              ? 'Direct & Acquired'
              : 'Pending';
      return (
        <Badge
          className='ml-4'
          variant={
            type === 'pending'
              ? 'warning'
              : type === 'direct' || type === 'acquired'
                ? 'default'
                : 'secondary'
          }
        >
          {label}
        </Badge>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className='ml-4 capitalize'
          variant={
            status === 'successful'
              ? 'success'
              : status === 'pending'
                ? 'warning'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
    size: 110,
  },
  {
    accessorFn: (row) =>
      row.property?.price
        ? (row.amount / row.property.price) * 100
        : 0,
    header: 'Stake',
    cell: ({ getValue }) => {
      const stake = getValue() as number;
      const formattedStake =
        typeof stake === 'number' && !isNaN(stake)
          ? `${stake.toFixed(2)}%`
          : '0.00%';

      return (
        <div className='flex items-center gap-2'>
          <div className='relative h-2 w-full rounded bg-muted'>
            <div
              className='absolute left-0 top-0 h-2 rounded bg-primary'
              style={{
                width: `${Math.max(0, Math.min(stake, 100)).toFixed(2)}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span className='ml-2 text-xs font-semibold text-primary'>
            {formattedStake}
          </span>
        </div>
      );
    },
    size: 100,
    enableSorting: false,
  },
  {
    accessorKey: 'receipt_url',
    header: 'Receipt',
    cell: ({ row }) => {
      const receiptUrl = row.original.receipt_url;
      if (!receiptUrl)
        return (
          <span className='text-xs text-muted-foreground'>—</span>
        );
      return (
        <Link
          href={receiptUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs font-medium text-primary underline'
        >
          View PDF
        </Link>
      );
    },
    size: 100,
    enableSorting: false,
  },
];

export const contributionsColumns: ColumnDef<InvestmentWithRelations>[] = [
  {
    accessorKey: 'property',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Property' />
    ),
    cell: ({ row }) => {
      const property = row.original.property;

      return (
        <PropertyTitleWithThumb
          title={property?.title || 'Untitled Property'}
          images={property?.images ?? null}
          size='md'
          subtitle={
            <div className='flex items-center'>
              <MapPin className='mr-1 h-3 w-3 flex-shrink-0' />
              <span className='whitespace-nowrap'>
                {property
                  ? `${property.city}, ${property.country}`
                  : 'Unknown location'}
              </span>
            </div>
          }
        />
      );
    },
    size: 300,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => (
      <div className='text-left'>
        <span className='whitespace-nowrap text-sm'>
          {formatDateTime(row.getValue('created_at'))}
        </span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => (
      <div className='text-left'>
        <span className='ml-4 font-semibold'>
          {formatCurrency(row.getValue('amount'))}
        </span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          className='ml-4'
          variant={
            status === 'successful'
              ? 'success'
              : status === 'pending'
                ? 'warning'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
    size: 100,
  },
  {
    accessorFn: (row) => (row.amount / row.property.price) * 100,
    header: 'Stake',
    cell: ({ getValue }) => {
      const stake = getValue() as number;
      // Clamp to 2 decimal places, show 0.00% if NaN
      const formattedStake =
        typeof stake === 'number' && !isNaN(stake)
          ? `${stake.toFixed(2)}%`
          : '0.00%';

      return (
        <div className='flex items-center gap-2'>
          <div className='relative h-2 w-full rounded bg-muted'>
            <div
              className='absolute left-0 top-0 h-2 rounded bg-primary'
              style={{
                width: `${Math.max(0, Math.min(stake, 100)).toFixed(2)}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span className='ml-2 text-xs font-semibold text-primary'>
            {formattedStake}
          </span>
        </div>
      );
    },
    size: 100,
    enableSorting: false,
  },
  {
    accessorKey: 'receipt_url',
    header: 'Receipt',
    cell: ({ row }) => {
      const receiptUrl = row.original.receipt_url;
      if (!receiptUrl)
        return (
          <span className='text-xs text-muted-foreground'>No receipt</span>
        );
      return (
        <Link
          href={receiptUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs font-medium text-primary underline'
        >
          View PDF
        </Link>
      );
    },
    size: 100,
    enableSorting: false,
  },
];
