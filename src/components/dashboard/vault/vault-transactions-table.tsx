'use client';

import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { PropertyTitleWithThumb } from '@/components/common/property-title-with-thumb';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';
import { getVaultTransactionTypeLabel } from '@/utils/vault-transaction-types';

import { VaultTransactionRow } from '@/types/dao';

interface VaultTransactionsTableProps {
  transactions: (VaultTransactionRow & {
    property?: { title: string | null; images?: string[] | null } | null;
    receipt_url?: string | null;
  })[];
  isLoading: boolean;
}

const getStatusIcon = (status: string | null) => {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className='h-4 w-4 text-green-600' />;
    case 'rejected':
      return <XCircle className='h-4 w-4 text-red-600' />;
    case 'pending':
    default:
      return <Clock className='h-4 w-4 text-yellow-600' />;
  }
};

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case 'approved':
      return (
        <Badge variant='default' className='bg-green-100 text-green-800'>
          Approved
        </Badge>
      );
    case 'rejected':
      return <Badge variant='destructive'>Rejected</Badge>;
    case 'pending':
    default:
      return (
        <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
          Pending
        </Badge>
      );
  }
};

const getTypeIcon = (type: string | null) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownCircle className='h-4 w-4 text-blue-600' />;
    case 'deploy':
      return <ArrowUpCircle className='h-4 w-4 text-green-600' />;
    case 'withdrawal':
      return <ArrowUpCircle className='h-4 w-4 text-orange-600' />;
    default:
      return null;
  }
};

const getTypeLabel = (type: string | null) => {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'deploy':
      return 'Deployment';
    case 'withdrawal':
      return 'Withdrawal';
    default:
      return 'Unknown';
  }
};

export function VaultTransactionsTable({
  transactions,
  isLoading,
}: VaultTransactionsTableProps) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <p className='text-muted-foreground'>No transactions found</p>
      </div>
    );
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <div className='text-sm'>
                  {formatTimestamp(transaction.created_at || '')}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {getTypeIcon(transaction.type)}
                  <span className='text-sm font-medium'>
                    {getVaultTransactionTypeLabel(transaction.type)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className='font-medium'>
                  {formatCurrency(transaction.amount || 0)}
                </div>
              </TableCell>
              <TableCell>
                {transaction.property?.title || transaction.property_id ? (
                  <PropertyTitleWithThumb
                    title={
                      transaction.property?.title ??
                      transaction.property_id ??
                      'Property'
                    }
                    images={transaction.property?.images ?? null}
                    size='sm'
                  />
                ) : (
                  <span className='text-sm text-muted-foreground'>N/A</span>
                )}
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {getStatusIcon(transaction.status)}
                  {getStatusBadge(transaction.status)}
                </div>
              </TableCell>
              <TableCell>
                {transaction.receipt_url ? (
                  <Link
                    href={transaction.receipt_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs font-medium text-primary underline hover:text-primary/80'
                  >
                    View PDF
                  </Link>
                ) : (
                  <span className='text-xs text-muted-foreground'>
                    No receipt
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
