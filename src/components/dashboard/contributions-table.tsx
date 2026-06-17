'use client';

import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { useMyStakes } from '@/hooks/queries/investment';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { stakesColumns } from './contributions-columns';

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert variant='destructive'>
      <AlertTriangle className='h-4 w-4' />
      <AlertDescription className='flex items-center justify-between'>
        <span>Failed to load contributions: {error.message}</span>
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
          <h3 className='text-lg font-semibold'>No contributions yet</h3>
          <p className='text-sm text-muted-foreground'>
            You haven't made any property investments yet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContributionsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: stakes,
    isFetching,
    error,
    refetch,
  } = useMyStakes();

  const table = useReactTable({
    data: stakes || [],
    columns: stakesColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (error && !isFetching) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (isFetching) {
    return <TableSkeleton columns={7} />;
  }

  if (!stakes || stakes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <DataTable table={table} />
      </div>
    </div>
  );
}
