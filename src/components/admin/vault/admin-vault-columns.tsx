'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Check, Download, FileImage, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { PaymentProofsViewer } from '@/components/admin/pending-investments/payment-proofs-viewer';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';
import { getVaultTransactionTypeDisplay } from '@/utils/vault-transaction-types';

type VaultTransactionWithRelations = {
  id: string;
  amount: number;
  type: string | null;
  status: string | null;
  created_at: string | null;
  proof_images: string[] | null;
  receipt_url?: string | null;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  property?: { title: string | null } | null;
};

const statusConfig: Record<
  string,
  { variant: BadgeProps['variant']; label: string }
> = {
  pending: { variant: 'secondary', label: 'Pending' },
  approved: { variant: 'default', label: 'Approved' },
  rejected: { variant: 'destructive', label: 'Rejected' },
};

// Helper function to check if a file is a PDF
function isPdfFile(url: string): boolean {
  try {
    const urlLower = url.toLowerCase();
    // Check if URL ends with .pdf or contains pdf in the path
    return urlLower.endsWith('.pdf') || urlLower.includes('.pdf?') || urlLower.includes('.pdf#');
  } catch {
    return false;
  }
}

// Helper function to get file extension from URL
function getFileExtension(url: string): string {
  try {
    const urlPath = url.split('?')[0]; // Remove query params
    const parts = urlPath.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  } catch {
    return '';
  }
}

// Helper function to download a file
async function downloadFile(url: string, filename?: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Determine filename
    const fileExtension = getFileExtension(url);
    const defaultFilename = filename || `payment-proof-${Date.now()}.${fileExtension || 'pdf'}`;
    link.download = defaultFilename;
    
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
    toast.success('File downloaded successfully');
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download file');
  }
}

function PaymentProofCell({
  transaction,
}: {
  transaction: VaultTransactionWithRelations;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const proofImages = transaction.proof_images || [];

  if (transaction.type !== 'deposit' || proofImages.length === 0) {
    return (
      <div className='flex items-center justify-center text-muted-foreground'>
        <span className='text-xs'>—</span>
      </div>
    );
  }

  // Check if any files are PDFs
  const hasPdfs = proofImages.some((url) => isPdfFile(url));
  const hasImages = proofImages.some((url) => !isPdfFile(url));

  // If all files are PDFs, only show download button
  if (hasPdfs && !hasImages) {
    return (
      <div className='flex items-center justify-center gap-1'>
        {proofImages.map((url, index) => (
          <Button
            key={index}
            variant='ghost'
            size='sm'
            onClick={() => downloadFile(url, `payment-proof-${index + 1}.pdf`)}
            className='flex h-8 w-8 items-center justify-center p-0'
            title='Download PDF'
          >
            <Download className='h-4 w-4' />
          </Button>
        ))}
      </div>
    );
  }

  // If there are both PDFs and images, show both buttons
  if (hasPdfs && hasImages) {
    const pdfFiles = proofImages.filter((url) => isPdfFile(url));
    const imageFiles = proofImages.filter((url) => !isPdfFile(url));

    return (
      <>
        <div className='flex items-center justify-center gap-1'>
          {imageFiles.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setViewerOpen(true)}
              className='flex h-8 w-8 items-center justify-center p-0'
              title='View payment proofs'
            >
              <FileImage className='h-4 w-4' />
            </Button>
          )}
          {pdfFiles.map((url, index) => (
            <Button
              key={index}
              variant='ghost'
              size='sm'
              onClick={() => downloadFile(url, `payment-proof-${index + 1}.pdf`)}
              className='flex h-8 w-8 items-center justify-center p-0'
              title='Download PDF'
            >
              <Download className='h-4 w-4' />
            </Button>
          ))}
        </div>
        {imageFiles.length > 0 && (
          <PaymentProofsViewer
            isOpen={viewerOpen}
            onClose={() => setViewerOpen(false)}
            images={imageFiles}
          />
        )}
      </>
    );
  }

  // If only images, show the viewer button (original behavior)
  return (
    <>
      <div className='flex items-center justify-center'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setViewerOpen(true)}
          className='flex h-8 w-8 items-center justify-center p-0'
          title='View payment proofs'
        >
          <FileImage className='h-4 w-4' />
        </Button>
      </div>
      <PaymentProofsViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={proofImages}
      />
    </>
  );
}

function ActionsCell({
  transaction,
  onAction,
}: {
  transaction: VaultTransactionWithRelations;
  onAction: (
    transaction: VaultTransactionWithRelations,
    action: 'approve' | 'reject',
  ) => void;
}) {
  // Show actions for pending deposit or withdrawal transactions
  const isPending =
    transaction.status === 'pending' &&
    (transaction.type === 'deposit' || transaction.type === 'withdrawal');

  if (!isPending) {
    return (
      <div className='flex items-center justify-center text-muted-foreground'>
        <span className='text-xs'>—</span>
      </div>
    );
  }

  const transactionType = transaction.type === 'withdrawal' ? 'withdrawal' : 'deposit';
  const actionLabel = transactionType === 'withdrawal' ? 'withdrawal' : 'deposit';

  return (
    <div className='flex items-center justify-center gap-1'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onAction(transaction, 'approve')}
        className='h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700'
        title={`Approve ${actionLabel}`}
      >
        <Check className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onAction(transaction, 'reject')}
        className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700'
        title={`Reject ${actionLabel}`}
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  );
}

interface CreateAdminVaultColumnsProps {
  onAction: (
    transaction: VaultTransactionWithRelations,
    action: 'approve' | 'reject',
  ) => void;
}

export const createAdminVaultColumns = ({
  onAction,
}: CreateAdminVaultColumnsProps): ColumnDef<
  VaultTransactionWithRelations,
  unknown
>[] => [
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.created_at;
      return (
        <div className='text-sm'>{date ? formatTimestamp(date) : '—'}</div>
      );
    },
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user)
        return <span className='text-sm text-muted-foreground'>—</span>;
      const userName = getFullName(user.first_name, user.last_name);
      return (
        <div className='space-y-1'>
          <div className='text-sm font-medium'>{userName}</div>
          <div className='text-xs text-muted-foreground'>{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const { label, color } = getVaultTransactionTypeDisplay(
        row.original.type,
      );
      return (
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      return (
        <div className='text-sm font-medium'>
          {formatCurrency(row.original.amount)}
        </div>
      );
    },
  },
  //   {
  //     accessorKey: 'property',
  //     header: 'Property',
  //     cell: ({ row }) => {
  //       const property = row.original.property;
  //       if (!property || !property.title) {
  //         return <span className='text-sm text-muted-foreground'>—</span>;
  //       }
  //       return <div className='text-sm'>{property.title}</div>;
  //     },
  //   },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status || 'pending';
      const config = statusConfig[status] || statusConfig.pending;
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: 'payment_proofs',
    header: 'Payment Proof',
    cell: ({ row }) => <PaymentProofCell transaction={row.original} />,
  },
  {
    accessorKey: 'receipt_url',
    header: 'Receipt',
    cell: ({ row }) => {
      const receiptUrl = row.original.receipt_url;
      if (!receiptUrl) {
        return (
          <span className='text-xs text-muted-foreground'>No receipt</span>
        );
      }
      return (
        <Link
          href={receiptUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs font-medium text-primary underline hover:text-primary/80'
        >
          View PDF
        </Link>
      );
    },
    size: 100,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell transaction={row.original} onAction={onAction} />
    ),
  },
];
