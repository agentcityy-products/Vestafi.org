'use client';

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { useAdminMembershipActivations } from '@/hooks/queries/admin-memberships';
import { MembershipActivationWithUser } from '@/hooks/queries/admin-memberships';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';
import { Input } from '@/components/ui/input';

import { MembershipActionDialogs } from './membership-action-dialogs';
import { createAdminMembershipColumns } from './membership-columns';

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert variant='destructive'>
      <AlertTriangle className='h-4 w-4' />
      <AlertDescription className='flex items-center justify-between'>
        <span>Failed to load membership activations: {error.message}</span>
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
          <h3 className='text-lg font-semibold'>
            No membership activations found
          </h3>
          <p className='text-sm text-muted-foreground'>
            No membership activation requests match your current filters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminMembershipActivationsTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const [dialogState, setDialogState] = useState<{
    activation: MembershipActivationWithUser | null;
    action: 'approve' | 'reject' | null;
  }>({ activation: null, action: null });

  // Default filter: show only pending activations
  const [filters, setFilters] = useState<{
    status?: 'pending' | 'approved' | 'rejected';
    search?: string;
  }>({
    status: 'pending',
  });

  const [searchInput, setSearchInput] = useState('');

  const {
    data: activations,
    isLoading,
    error,
    refetch,
  } = useAdminMembershipActivations({
    page: 1,
    pageSize: 50,
    status: filters.status,
    search: filters.search,
  });

  const handleAction = (
    activation: MembershipActivationWithUser,
    action: 'approve' | 'reject',
  ) => {
    setDialogState({ activation, action });
  };

  const handleDialogClose = () => {
    setDialogState({ activation: null, action: null });
  };

  const handleDialogSuccess = () => {
    setDialogState({ activation: null, action: null });
    refetch();
  };

  const handleShowPending = () => {
    setFilters({ status: 'pending' });
    setSearchInput('');
  };

  const handleShowApproved = () => {
    setFilters({ status: 'approved' });
    setSearchInput('');
  };

  const handleShowRejected = () => {
    setFilters({ status: 'rejected' });
    setSearchInput('');
  };

  const handleShowAll = () => {
    setFilters({});
    setSearchInput('');
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
    }));
  };

  const columns = createAdminMembershipColumns({
    onAction: handleAction,
  });

  const table = useReactTable({
    data: activations || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: columns as ColumnDef<MembershipActivationWithUser, any>[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (isLoading) return <TableSkeleton />;

  return (
    <div className='space-y-4'>
      {/* Filter Buttons and Search */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap gap-2'>
          <Button
            variant={filters.status === 'pending' ? 'default' : 'outline'}
            size='sm'
            onClick={handleShowPending}
          >
            Pending
          </Button>
          <Button
            variant={filters.status === 'approved' ? 'default' : 'outline'}
            size='sm'
            onClick={handleShowApproved}
          >
            Approved
          </Button>
          <Button
            variant={filters.status === 'rejected' ? 'default' : 'outline'}
            size='sm'
            onClick={handleShowRejected}
          >
            Rejected
          </Button>
          <Button
            variant={!filters.status ? 'default' : 'outline'}
            size='sm'
            onClick={handleShowAll}
          >
            All
          </Button>
        </div>
        <div className='w-full sm:w-auto'>
          <Input
            placeholder='Search by name or email...'
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className='w-full sm:w-64'
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {!activations || activations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className='rounded-md border'>
          <DataTable table={table} />
        </div>
      )}

      {/* Action Dialogs */}
      <MembershipActionDialogs
        activation={dialogState.activation}
        action={dialogState.action}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}

