'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Check, FileImage, X } from 'lucide-react';
import { useState } from 'react';

import { MembershipActivationWithUser } from '@/hooks/queries/admin-memberships';

import { PaymentProofsViewer } from '@/components/admin/pending-investments/payment-proofs-viewer';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';

const statusConfig: Record<
  string,
  { variant: BadgeProps['variant']; label: string }
> = {
  pending: { variant: 'secondary', label: 'Pending' },
  approved: { variant: 'default', label: 'Approved' },
  rejected: { variant: 'destructive', label: 'Rejected' },
};

function PaymentProofCell({
  activation,
}: {
  activation: MembershipActivationWithUser;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const proofImages = activation.proof_images || [];

  if (proofImages.length === 0) {
    return (
      <div className='flex items-center justify-center text-muted-foreground'>
        <span className='text-xs'>—</span>
      </div>
    );
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setViewerOpen(true)}
        className='h-8 w-8 p-0'
        title='View payment proofs'
      >
        <FileImage className='h-4 w-4' />
      </Button>
      <PaymentProofsViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={proofImages}
      />
    </>
  );
}

function ActionsCell({
  activation,
  onAction,
}: {
  activation: MembershipActivationWithUser;
  onAction: (
    activation: MembershipActivationWithUser,
    action: 'approve' | 'reject',
  ) => void;
}) {
  const isPending = activation.status === 'pending';

  if (!isPending) {
    return (
      <div className='flex items-center justify-center text-muted-foreground'>
        <span className='text-xs'>—</span>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center gap-2'>
      <Button
        variant='default'
        size='sm'
        onClick={() => onAction(activation, 'approve')}
        className='h-8'
      >
        <Check className='mr-1 h-3 w-3' />
        Approve
      </Button>
      <Button
        variant='destructive'
        size='sm'
        onClick={() => onAction(activation, 'reject')}
        className='h-8'
      >
        <X className='mr-1 h-3 w-3' />
        Reject
      </Button>
    </div>
  );
}

export function createAdminMembershipColumns({
  onAction,
}: {
  onAction: (
    activation: MembershipActivationWithUser,
    action: 'approve' | 'reject',
  ) => void;
}): ColumnDef<MembershipActivationWithUser>[] {
  return [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return (
            <span className='text-muted-foreground text-sm'>Unknown User</span>
          );
        }
        return (
          <div className='space-y-1'>
            <div className='font-medium'>
              {getFullName(user.first_name, user.last_name)}
            </div>
            <div className='text-muted-foreground text-xs'>{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        return (
          <span className='font-medium'>
            {formatCurrency(row.original.amount)}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || {
          variant: 'secondary' as BadgeProps['variant'],
          label: status,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: 'proof_images',
      header: 'Payment Proof',
      cell: ({ row }) => {
        return <PaymentProofCell activation={row.original} />;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Requested',
      cell: ({ row }) => {
        return (
          <span className='text-muted-foreground text-sm'>
            {formatTimestamp(row.original.created_at)}
          </span>
        );
      },
    },
    {
      accessorKey: 'approved_at',
      header: 'Processed',
      cell: ({ row }) => {
        const approvedAt = row.original.approved_at;
        if (!approvedAt) {
          return (
            <span className='text-muted-foreground text-sm'>—</span>
          );
        }
        return (
          <div className='space-y-1'>
            <div className='text-sm'>
              {formatTimestamp(approvedAt)}
            </div>
            {row.original.approved_by_user && (
              <div className='text-muted-foreground text-xs'>
                by{' '}
                {getFullName(
                  row.original.approved_by_user.first_name,
                  row.original.approved_by_user.last_name,
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <ActionsCell
            activation={row.original}
            onAction={onAction}
          />
        );
      },
    },
  ];
}

