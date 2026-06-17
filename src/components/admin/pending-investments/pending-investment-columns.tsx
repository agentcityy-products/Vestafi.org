import { type ColumnDef } from '@tanstack/react-table';
import { Check, Copy, Download, Eye, Users, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { PropertyTitleWithThumb } from '@/components/common/property-title-with-thumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';

import type { InvestmentRow, ProfileRow, PropertyRow } from '@/types/dao';

type InvestmentWithRelations = InvestmentRow & {
  property: PropertyRow;
  user: ProfileRow;
};

interface CreateColumnsProps {
  onAction: (
    investment: InvestmentWithRelations,
    action: 'approve' | 'reject',
  ) => void;
  onViewImages: (images: string[]) => void;
  onViewNextOfKin: (userId: string, userName: string) => void;
}

// Helper function to check if a file is a PDF
function isPdfFile(url: string): boolean {
  try {
    const urlLower = url.toLowerCase();
    // Remove query parameters and fragments to get just the path
    const urlPath = urlLower.split('?')[0].split('#')[0];
    // Check if the path contains .pdf (handles cases like .pdf, .pdf_123, .pdf?param, etc.)
    // Match .pdf at the end or followed by underscore, query param, or fragment
    if (urlPath.endsWith('.pdf')) return true;
    // Check for .pdf followed by underscore, query param, or fragment
    return /\.pdf[_?#]/.test(urlPath);
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

export const createPendingInvestmentColumns = ({
  onAction,
  onViewImages,
  onViewNextOfKin,
}: CreateColumnsProps): ColumnDef<InvestmentWithRelations>[] => [
  {
    accessorKey: 'id',
    header: 'Contribution ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as string;

      const copyToClipboard = async (text: string) => {
        try {
          await navigator.clipboard.writeText(text);
          toast.success('Contribution ID copied to clipboard');
        } catch (error) {
          console.error(error);
          toast.error('Failed to copy to clipboard');
        }
      };

      return (
        <div className='flex items-center gap-2'>
          <span className='font-mono text-sm'>{id.slice(0, 8)}...</span>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => copyToClipboard(id)}
            className='h-6 w-6 p-0'
          >
            <Copy className='h-3 w-3' />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'user.name',
    header: 'Investor',
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className='space-y-1'>
          <p className='font-medium'>
            {getFullName(user.first_name, user.last_name)}
          </p>
          <p className='text-sm text-muted-foreground'>{user.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'property.title',
    header: 'Property',
    cell: ({ row }) => {
      const property = row.original.property;
      return (
        <PropertyTitleWithThumb
          title={property.title}
          images={property.images}
          size='sm'
          subtitle={
            <span className='whitespace-nowrap'>
              {property.city}, {property.state} {property.country}
            </span>
          }
        />
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return <span className='font-semibold'>{formatCurrency(amount)}</span>;
    },
    meta: {
      align: 'right' as const,
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const getStatusBadge = (status: string | null) => {
        switch (status) {
          case 'successful':
            return (
              <Badge variant='default' className='bg-green-100 text-green-800'>
                Successful
              </Badge>
            );
          case 'rejected':
            return <Badge variant='destructive'>Rejected</Badge>;
          case 'pending':
          default:
            return (
              <Badge
                variant='secondary'
                className='bg-yellow-100 text-yellow-800'
              >
                Pending
              </Badge>
            );
        }
      };
      return getStatusBadge(status);
    },
  },
  {
    accessorKey: 'proof_images',
    header: 'Payment Proofs',
    cell: ({ row }) => {
      const proofImages = row.getValue('proof_images') as string[] | null;
      const count = proofImages?.length || 0;

      if (count === 0) {
        return (
          <div className='flex items-center justify-center text-muted-foreground'>
            <span className='text-xs'>—</span>
          </div>
        );
      }

      // Check if any files are PDFs
      const hasPdfs = proofImages?.some((url) => isPdfFile(url)) || false;
      const hasImages = proofImages?.some((url) => !isPdfFile(url)) || false;

      // Count PDFs and images separately
      const pdfCount = proofImages?.filter((url) => isPdfFile(url)).length || 0;
      const imageCount = proofImages?.filter((url) => !isPdfFile(url)).length || 0;

      // Determine badge text
      let badgeText = '';
      if (hasPdfs && hasImages) {
        badgeText = `${count} file${count !== 1 ? 's' : ''}`;
      } else if (hasPdfs) {
        badgeText = `${pdfCount} PDF${pdfCount !== 1 ? 's' : ''}`;
      } else {
        badgeText = `${imageCount} image${imageCount !== 1 ? 's' : ''}`;
      }

      // If all files are PDFs, only show download buttons
      if (hasPdfs && !hasImages) {
        const pdfFiles = proofImages?.filter((url) => isPdfFile(url)) || [];
        return (
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='whitespace-nowrap'>
              {badgeText}
            </Badge>
            <div className='flex items-center gap-1'>
              {pdfFiles.map((url, index) => (
                <Button
                  key={index}
                  variant='ghost'
                  size='sm'
                  onClick={() => downloadFile(url, `payment-proof-${index + 1}.pdf`)}
                  className='flex h-6 w-6 items-center justify-center p-0'
                  title='Download PDF'
                >
                  <Download className='h-3 w-3' />
                </Button>
              ))}
            </div>
          </div>
        );
      }

      // If there are both PDFs and images, show both buttons
      if (hasPdfs && hasImages) {
        const pdfFiles = proofImages?.filter((url) => isPdfFile(url)) || [];
        const imageFiles = proofImages?.filter((url) => !isPdfFile(url)) || [];

        return (
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='whitespace-nowrap'>
              {badgeText}
            </Badge>
            <div className='flex items-center gap-1'>
              {imageFiles.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onViewImages(imageFiles)}
                  className='flex h-6 w-6 items-center justify-center p-0'
                  title='View payment proofs'
                >
                  <Eye className='h-3 w-3' />
                </Button>
              )}
              {pdfFiles.map((url, index) => (
                <Button
                  key={index}
                  variant='ghost'
                  size='sm'
                  onClick={() => downloadFile(url, `payment-proof-${index + 1}.pdf`)}
                  className='flex h-6 w-6 items-center justify-center p-0'
                  title='Download PDF'
                >
                  <Download className='h-3 w-3' />
                </Button>
              ))}
            </div>
          </div>
        );
      }

      // If only images, show the viewer button (original behavior)
      return (
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='whitespace-nowrap'>
            {badgeText}
          </Badge>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onViewImages(proofImages || [])}
            className='flex h-6 w-6 items-center justify-center p-0'
            title='View payment proofs'
          >
            <Eye className='h-3 w-3' />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Date Submitted',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at') as string);
      return (
        <span className='whitespace-nowrap text-sm'>
          {formatTimestamp(date)}
        </span>
      );
    },
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
  },
  {
    id: 'next_of_kin',
    header: () => (
      <div className='whitespace-nowrap text-center'>Next of Kin</div>
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      const userName = getFullName(user.first_name, user.last_name);

      return (
        <div className='flex justify-center'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onViewNextOfKin(user.id, userName)}
            className='h-8 w-8 p-0'
          >
            <Users className='h-4 w-4' />
          </Button>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const investment = row.original;

      // Only show action buttons if the investment is pending
      if (investment.status !== 'pending') {
        return (
          <div className='text-center'>
            <span className='text-sm text-muted-foreground'>—</span>
          </div>
        );
      }

      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='default'
            size='icon'
            onClick={() => onAction(investment, 'approve')}
            className='h-8 w-8'
          >
            <Check className='h-3 w-3' />
          </Button>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => onAction(investment, 'reject')}
            className='h-8 w-8'
          >
            <X className='h-3 w-3' />
          </Button>
        </div>
      );
    },
  },
];
