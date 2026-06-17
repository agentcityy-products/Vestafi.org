'use client';

import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { useMonthlyReturns } from '@/hooks/queries/monthly-returns';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import {
  monthlyReturnsColumns,
  MonthlyReturnWithProperty,
} from './monthly-returns-columns';

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert variant='destructive'>
      <AlertTriangle className='h-4 w-4' />
      <AlertDescription className='flex items-center justify-between'>
        <span>Failed to load monthly rentals: {error.message}</span>
        <Button
          variant='outline'
          size='sm'
          onClick={onRetry}
          className='ml-2 h-8'
        >
          <RefreshCw className='mr-2 h-4 w-4' />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className='flex flex-col items-center justify-center py-16'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold'>No monthly rentals yet</h3>
          <p className='text-sm text-muted-foreground'>
            You haven't received any monthly rentals from your investments yet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyReturnsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: monthlyReturnsData,
    isFetching,
    error,
    refetch,
  } = useMonthlyReturns({
    page,
    pageSize,
  });
  const { data: monthlyReturns = [], count = 0 } = monthlyReturnsData || {};

  const table = useReactTable({
    data: monthlyReturns as MonthlyReturnWithProperty[],
    columns: monthlyReturnsColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: Math.ceil(count / pageSize),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  };

  if (error && !isFetching) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (isFetching) {
    return <TableSkeleton />;
  }

  if (monthlyReturns.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <DataTable table={table} />
      </div>
      <DataTablePagination
        pageIndex={page}
        pageSize={pageSize}
        totalCount={count}
        onPageChange={handlePageChange}
        onSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
