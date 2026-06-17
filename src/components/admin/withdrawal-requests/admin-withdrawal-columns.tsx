'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CountryCode } from 'libphonenumber-js';
import { AlertCircle, Check, CreditCard, FileImage, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { PaymentProofsViewer } from '@/components/admin/pending-investments/payment-proofs-viewer';
import { WithdrawalActionDialogs } from '@/components/admin/withdrawal-requests/withdrawal-action-dialogs';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';
import { formatPhoneNumber } from '@/utils/string-functions';

import { BankDetailsViewer } from './bank-details-viewer';

import {
  WithdrawalRequestWithUserDetails,
  WithdrawalStatus,
} from '@/types/dao';

const statusConfig: Record<
  WithdrawalStatus,
  { variant: BadgeProps['variant']; label: string }
> = {
  pending: { variant: 'warning', label: 'Pending' },
  paid: { variant: 'success', label: 'Paid' },
  rejected: { variant: 'destructive', label: 'Rejected' },
};

function DetailsCell({
  withdrawalRequest,
}: {
  withdrawalRequest: WithdrawalRequestWithUserDetails;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const { payment_proof_url, status, rejection_reason } = withdrawalRequest;

  // Show rejection reason for cancelled requests
  if (status === 'rejected') {
    return (
      <div className='flex items-center justify-center'>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 p-2 text-red-600 hover:bg-red-50'
            >
              <AlertCircle className='mr-1 h-4 w-4' />
              <span className='text-xs'>Rejected</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className='w-80'>
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold text-red-600'>
                Rejection Reason
              </h4>
              <p className='text-sm text-muted-foreground'>
                {rejection_reason || 'No reason provided'}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  }

  // Show pending message for pending requests
  if (status === 'pending') {
    return (
      <div className='flex items-center justify-center text-muted-foreground'>
        <div className='text-center'>
          <FileImage className='mx-auto mb-1 h-4 w-4' />
          <div className='text-xs'>Awaiting processing</div>
        </div>
      </div>
    );
  }

  // Show payment proof for paid requests
  if (status === 'paid') {
    if (!payment_proof_url) {
      return (
        <div className='flex items-center justify-center text-muted-foreground'>
          <div className='text-center'>
            <FileImage className='mx-auto mb-1 h-4 w-4' />
            <div className='text-xs'>No proof available</div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className='flex items-center justify-center'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setViewerOpen(true)}
            className='h-8 w-8 p-0'
          >
            <div className='relative h-6 w-6 overflow-hidden rounded border'>
              <Image
                src={payment_proof_url}
                alt='Payment proof'
                fill
                className='object-cover'
                unoptimized
              />
            </div>
          </Button>
        </div>
        <PaymentProofsViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          images={[payment_proof_url]}
        />
      </>
    );
  }

  return null;
}

function ActionsCell({
  withdrawalRequest,
  onUpdate,
}: {
  withdrawalRequest: WithdrawalRequestWithUserDetails;
  onUpdate: () => void;
}) {
  const [dialogState, setDialogState] = useState<{
    action: 'mark_paid' | 'reject' | null;
    request: WithdrawalRequestWithUserDetails | null;
  }>({ action: null, request: null });

  if (withdrawalRequest.status !== 'pending') {
    return (
      <div className='flex items-center justify-center text-muted-foreground'>
        <span className='text-xs'>-</span>
      </div>
    );
  }

  const handleMarkAsPaid = () => {
    setDialogState({ action: 'mark_paid', request: withdrawalRequest });
  };

  const handleReject = () => {
    setDialogState({ action: 'reject', request: withdrawalRequest });
  };

  const handleDialogClose = () => {
    setDialogState({ action: null, request: null });
  };

  const handleDialogSuccess = () => {
    setDialogState({ action: null, request: null });
    onUpdate();
  };

  return (
    <>
      <div className='flex items-center justify-center gap-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleMarkAsPaid}
          className='h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700'
          title='Mark as Paid'
        >
          <Check className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleReject}
          className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700'
          title='Reject Request'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      <WithdrawalActionDialogs
        withdrawalRequest={dialogState.request}
        action={dialogState.action}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}

interface AdminWithdrawalColumnsProps {
  onUpdate: () => void;
}

export const createAdminWithdrawalColumns = ({
  onUpdate,
}: AdminWithdrawalColumnsProps): ColumnDef<WithdrawalRequestWithUserDetails>[] => [
  {
    accessorKey: 'created_at',
    header: 'Requested On',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return (
        <div className='text-sm text-muted-foreground'>
          {formatTimestamp(date)}
        </div>
      );
    },
  },
  {
    id: 'user',
    header: 'Investor Details',
    cell: ({ row }) => {
      const user = row.original.user;
      const bank = row.original.user?.bank;

      return (
        <div className='space-y-2'>
          <div className='text-sm'>
            <div className='font-medium'>
              {user?.first_name} {user?.last_name}
            </div>
            <div className='text-muted-foreground'>{user?.email}</div>
            <div className='text-xs text-muted-foreground'>
              {formatPhoneNumber(
                user?.phone,
                user?.country_code as CountryCode,
              )}
            </div>
          </div>
          <BankDetailsViewer
            user={user}
            bank={bank}
            trigger={
              <Button variant='outline' size='sm' className='h-6 px-2 text-xs'>
                <CreditCard className='mr-1 h-3 w-3' />
                Bank Details
              </Button>
            }
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      return (
        <div className='font-medium'>
          {formatCurrency(row.getValue('amount'))}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => (
      <div className='flex w-full items-center justify-center'>Status</div>
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as WithdrawalStatus;
      const config = statusConfig[status];

      return (
        <div className='flex w-full items-center justify-center'>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated On',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updated_at'));
      return (
        <div className='text-sm text-muted-foreground'>
          {formatTimestamp(date)}
        </div>
      );
    },
  },
  {
    accessorKey: 'payment_proof_url',
    header: () => (
      <div className='flex w-full items-center justify-center'>Details</div>
    ),
    cell: ({ row }) => {
      return <DetailsCell withdrawalRequest={row.original} />;
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className='flex w-full items-center justify-center'>Actions</div>
    ),
    cell: ({ row }) => {
      return (
        <ActionsCell withdrawalRequest={row.original} onUpdate={onUpdate} />
      );
    },
  },
];
