'use client';

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAllVaultTransactions } from '@/hooks/queries/vault-admin';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { createAdminVaultColumns } from './admin-vault-columns';
import { VaultActionDialogs } from './vault-action-dialogs';

type VaultTransactionWithRelations = {
  id: string;
  amount: number;
  type: string | null;
  status: string | null;
  created_at: string | null;
  proof_images: string[] | null;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    bank_info?: {
      bank_name: string;
      account_number: string;
      account_name: string;
    } | null;
  } | null;
  property?: { title: string | null } | null;
};

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert variant='destructive'>
      <AlertTriangle className='h-4 w-4' />
      <AlertDescription className='flex items-center justify-between'>
        <span>Failed to load vault transactions: {error.message}</span>
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
          <h3 className='text-lg font-semibold'>No vault transactions found</h3>
          <p className='text-sm text-muted-foreground'>
            No vault transactions match your current filters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminVaultTransactionsTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const [dialogState, setDialogState] = useState<{
    transaction: VaultTransactionWithRelations | null;
    action: 'approve' | 'reject' | null;
  }>({ transaction: null, action: null });

  // Default filter: show only pending deposits
  const [filters, setFilters] = useState<{
    type?: 'deposit' | 'deploy' | 'withdrawal';
    status?: 'pending' | 'approved' | 'rejected';
    startDate?: string;
    endDate?: string;
  }>({
    type: 'deposit',
    status: 'pending',
  });

  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useAllVaultTransactions(filters);

  // Auto-switch to "All Transactions" if no pending deposits found
  useEffect(() => {
    // Only auto-switch if:
    // 1. We're currently filtering for pending deposits
    // 2. Data has loaded (not loading)
    // 3. There are no transactions
    // 4. No error occurred
    if (
      !isLoading &&
      !error &&
      filters.type === 'deposit' &&
      filters.status === 'pending' &&
      (!transactions || transactions.length === 0)
    ) {
      // Switch to show all transactions
      setFilters({});
    }
  }, [isLoading, error, filters, transactions]);

  const handleAction = (
    transaction: VaultTransactionWithRelations,
    action: 'approve' | 'reject',
  ) => {
    setDialogState({ transaction, action });
  };

  const handleDialogClose = () => {
    setDialogState({ transaction: null, action: null });
  };

  const handleDialogSuccess = () => {
    setDialogState({ transaction: null, action: null });
    refetch();
  };

  const handleShowAll = () => {
    setFilters({});
  };

  const handleShowPendingDeposits = () => {
    setFilters({
      type: 'deposit',
      status: 'pending',
    });
  };

  const handleShowPendingWithdrawals = () => {
    setFilters({
      type: 'withdrawal',
      status: 'pending',
    });
  };

  const columns = createAdminVaultColumns({
    onAction: handleAction,
  });

  const table = useReactTable({
    data: transactions || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: columns as ColumnDef<VaultTransactionWithRelations, any>[],
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
      {/* Filter Buttons */}
      <div className='flex gap-2'>
        <Button
          variant={
            filters.status === 'pending' && filters.type === 'deposit'
              ? 'default'
              : 'outline'
          }
          size='sm'
          onClick={handleShowPendingDeposits}
        >
          Pending Deposits
        </Button>
        <Button
          variant={
            filters.status === 'pending' && filters.type === 'withdrawal'
              ? 'default'
              : 'outline'
          }
          size='sm'
          onClick={handleShowPendingWithdrawals}
        >
          Pending Withdrawals
        </Button>
        <Button
          variant={!filters.status && !filters.type ? 'default' : 'outline'}
          size='sm'
          onClick={handleShowAll}
        >
          All Transactions
        </Button>
      </div>

      {/* Table or Empty State */}
      {!transactions || transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className='rounded-md border'>
          <DataTable table={table} />
        </div>
      )}

      {/* Action Dialogs */}
      <VaultActionDialogs
        transaction={dialogState.transaction}
        action={dialogState.action}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
