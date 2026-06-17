import { ColumnDef } from '@tanstack/react-table';
import { Copy, DollarSign, MoreHorizontal, Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { formatDateTime } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

import { ListingWithRent } from '@/types/dao';

interface CreateColumnsProps {
  onAddMonthlyRent: (property: ListingWithRent) => void;
}

export const createAdminPropertyColumns = ({
  onAddMonthlyRent,
}: CreateColumnsProps): ColumnDef<ListingWithRent>[] => [
  {
    accessorKey: 'images',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image' />
    ),
    cell: ({ row }) => {
      const images = row.original.images;
      if (!images?.length) return null;

      return (
        <div className='relative mx-auto h-12 w-12 overflow-hidden rounded-md'>
          <Image
            src={images[0]}
            alt={row.original.title!}
            fill
            className='object-cover'
            sizes='48px'
          />
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='text-center font-medium'>{row.getValue('title')}</div>
    ),
    size: 200,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className='line-clamp-2 text-center text-sm text-muted-foreground'>
          {description}
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Property Price' />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return (
        <div className='text-center font-semibold'>{formatCurrency(price)}</div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'monthly_rent_range',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Monthly Rent Range' />
    ),
    cell: ({ row }) => {
      const minRent = row.original.minimum_monthly_rent;
      const maxRent = row.original.maximum_monthly_rent;

      if (!minRent || !maxRent) return <div className='text-center'>-</div>;

      return (
        <div className='text-center'>
          <div className='text-sm font-medium'>
            {formatCurrency(minRent)} - {formatCurrency(maxRent)}
          </div>
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: 'average_rent_6_months',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Avg Rent (6M)' />
    ),
    cell: ({ row }) => {
      const avgRent = row.original.average_rent_6_months;
      return (
        <div className='text-center'>
          {avgRent ? formatCurrency(avgRent) : '-'}
        </div>
      );
    },
    size: 130,
  },
  {
    accessorKey: 'investment_stats',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contribution Stats' />
    ),
    cell: ({ row }) => {
      const totalInvestment = row.original.total_investment;
      const investmentPercentage = row.original.investment_percentage;

      return (
        <div className='text-center'>
          <div className='text-sm font-medium'>
            {totalInvestment ? formatCurrency(totalInvestment) : '-'}
          </div>
          {investmentPercentage && (
            <div className='text-xs text-muted-foreground'>
              {investmentPercentage.toFixed(1)}% funded
            </div>
          )}
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Location' />
    ),
    cell: ({ row }) => {
      const property = row.original;
      const locationParts = [
        property.city,
        property.state,
        property.zip_code,
        property.country,
      ].filter(Boolean);

      return (
        <div className='text-center text-sm font-medium'>
          {locationParts.join(', ')}
        </div>
      );
    },
    size: 160,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Full Address' />
    ),
    cell: ({ row }) => {
      const property = row.original;
      const addressParts = [
        property.address_line_1,
        property.address_line_2,
      ].filter(Boolean);

      return (
        <div className='line-clamp-2 text-center text-sm'>
          {addressParts.join(', ')}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return (
        <div className='whitespace-nowrap text-xs text-muted-foreground'>
          {formatDateTime(date)}
        </div>
      );
    },
    size: 100,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => {
      const property = row.original;

      return (
        <div className='flex justify-center'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(property.id!);
                  toast.success('Property ID copied to clipboard');
                }}
              >
                <Copy className='mr-2 h-4 w-4' />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddMonthlyRent(property)}>
                <DollarSign className='mr-2 h-4 w-4' />
                Add Monthly Rent
              </DropdownMenuItem>
              <Link href={paths.admin.properties.form(property.id!)}>
                <DropdownMenuItem>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit Property
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 80,
  },
];
