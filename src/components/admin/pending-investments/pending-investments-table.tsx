'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { useInvestments } from '@/hooks/queries/investment';

import { updateInvestmentStatus } from '@/actions/investment';

import { PropertyTitleWithThumb } from '@/components/common/property-title-with-thumb';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { onError } from '@/lib/show-error-toast';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';

import { QueryKeys } from '@/constants/query-keys';

import { NextOfKinDialog } from './next-of-kin-dialog';
import { PaymentProofsViewer } from './payment-proofs-viewer';
import { createPendingInvestmentColumns } from './pending-investment-columns';

import type { InvestmentRow, ProfileRow, PropertyRow } from '@/types/dao';

type InvestmentWithRelations = InvestmentRow & {
  property: PropertyRow;
  user: ProfileRow;
};

interface ConfirmationDialogState {
  isOpen: boolean;
  investment: InvestmentWithRelations | null;
  action: 'approve' | 'reject' | null;
}

export function PendingInvestmentsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialogState>({
      isOpen: false,
      investment: null,
      action: null,
    });
  const [imageViewer, setImageViewer] = useState<{
    isOpen: boolean;
    images: string[];
  }>({
    isOpen: false,
    images: [],
  });
  const [nextOfKinDialog, setNextOfKinDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
  });

  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  const queryClient = useQueryClient();
  const {
    data: investments,
    isLoading,
    error,
  } = useInvestments(
    statusFilter && statusFilter !== 'all'
      ? { status: [statusFilter as 'pending' | 'rejected' | 'successful'] }
      : {},
  );

  const updateStatusAction = useAction(updateInvestmentStatus, {
    onSuccess: () => {
      // Capture the action before resetting the dialog state
      const currentAction = confirmationDialog.action;
      const action = currentAction === 'approve' ? 'approved' : 'rejected';

      toast.success(`Contribution ${action} successfully`);
      setConfirmationDialog({ isOpen: false, investment: null, action: null });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INVESTMENTS] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OWNERSHIP_RESERVATIONS],
      });
    },
    onError,
  });

  const handleAction = (
    investment: InvestmentWithRelations,
    action: 'approve' | 'reject',
  ) => {
    setConfirmationDialog({
      isOpen: true,
      investment,
      action,
    });
  };

  const handleViewImages = (images: string[]) => {
    setImageViewer({
      isOpen: true,
      images,
    });
  };

  const handleViewNextOfKin = (userId: string, userName: string) => {
    setNextOfKinDialog({
      isOpen: true,
      userId,
      userName,
    });
  };

  const confirmAction = () => {
    if (!confirmationDialog.investment || !confirmationDialog.action) return;

    const status =
      confirmationDialog.action === 'approve' ? 'successful' : 'rejected';
    updateStatusAction.execute({
      id: confirmationDialog.investment.id!,
      status,
    });
  };

  const columns = createPendingInvestmentColumns({
    onAction: handleAction,
    onViewImages: handleViewImages,
    onViewNextOfKin: handleViewNextOfKin,
  });

  const table = useReactTable({
    data: investments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return <TableSkeleton columns={8} rows={5} />;
  }

  if (error) {
    return (
      <div className='rounded-lg border border-destructive/20 bg-destructive/10 p-4'>
        <p className='text-sm text-destructive'>
          Failed to load pending investments. Please try again. {error.message}
        </p>
      </div>
    );
  }

  if (!investments || investments.length === 0) {
    return (
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h3 className='text-lg font-semibold'>No pending investments</h3>
        <p className='text-muted-foreground'>
          All investments have been reviewed and processed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            {investments.length} contribution
            {investments.length !== 1 ? 's' : ''} found
          </p>
          {/* Status Filter Dropdown */}
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) =>
              setStatusFilter(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='successful'>Successful</SelectItem>
              <SelectItem value='rejected'>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='rounded-md border'>
          <DataTable table={table} />
        </div>
      </div>

      {/* Payment Proofs Viewer */}
      <PaymentProofsViewer
        isOpen={imageViewer.isOpen}
        onClose={() => setImageViewer({ isOpen: false, images: [] })}
        images={imageViewer.images}
      />

      <NextOfKinDialog
        isOpen={nextOfKinDialog.isOpen}
        onClose={() =>
          setNextOfKinDialog({ isOpen: false, userId: '', userName: '' })
        }
        userId={nextOfKinDialog.userId}
        userName={nextOfKinDialog.userName}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setConfirmationDialog({
            isOpen: false,
            investment: null,
            action: null,
          })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmationDialog.action === 'approve' ? 'Approve' : 'Reject'}{' '}
              Contribution
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmationDialog.action} this
              contribution? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {confirmationDialog.investment && (
            <div className='space-y-4'>
              <div className='rounded-lg bg-muted/50 p-4'>
                <h4 className='font-medium'>Contribution Details</h4>
                <div className='mt-2 space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Investor:</span>
                    <span>
                      {getFullName(
                        confirmationDialog.investment.user.first_name,
                        confirmationDialog.investment.user.last_name,
                      )}
                    </span>
                  </div>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <span className='shrink-0 text-muted-foreground'>
                      Property:
                    </span>
                    <PropertyTitleWithThumb
                      title={confirmationDialog.investment.property.title}
                      images={confirmationDialog.investment.property.images}
                      size='sm'
                      className='sm:justify-end'
                    />
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Amount:</span>
                    <span className='font-semibold'>
                      {formatCurrency(confirmationDialog.investment.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {confirmationDialog.action === 'approve' && (
                <div className='rounded-lg border border-green-200 bg-green-50 p-3'>
                  <p className='text-sm text-green-800'>
                    ✅ The investor will be notified and their contribution will
                    be activated.
                  </p>
                </div>
              )}

              {confirmationDialog.action === 'reject' && (
                <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                  <p className='text-sm text-red-800'>
                    ❌ The investor will be notified and their contribution will
                    be rejected.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() =>
                setConfirmationDialog({
                  isOpen: false,
                  investment: null,
                  action: null,
                })
              }
              disabled={updateStatusAction.isExecuting}
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmationDialog.action === 'approve'
                  ? 'default'
                  : 'destructive'
              }
              onClick={confirmAction}
              disabled={updateStatusAction.isExecuting}
            >
              {updateStatusAction.isExecuting ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
