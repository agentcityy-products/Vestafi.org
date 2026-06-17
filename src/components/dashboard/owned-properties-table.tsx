'use client';

import {
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

import { OwnedPropertiesViewRow } from '@/types/dao';

interface OwnedPropertiesTableProps {
  ownedProperties?: OwnedPropertiesViewRow[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

function TableSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className='flex items-center space-x-4 rounded-lg border p-4'
        >
          <Skeleton className='h-16 w-16 rounded-lg' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-[200px]' />
            <Skeleton className='h-3 w-[150px]' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-3 w-[80px]' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[80px]' />
            <Skeleton className='h-3 w-[60px]' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[80px]' />
            <Skeleton className='h-3 w-[60px]' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[80px]' />
            <Skeleton className='h-3 w-[60px]' />
          </div>
          <Skeleton className='h-8 w-20' />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <div className='mx-auto mb-4 w-fit rounded-full bg-muted p-4'>
        <Building2 className='h-8 w-8 text-muted-foreground' />
      </div>
      <h3 className='mb-2 text-lg font-semibold'>No Properties Yet</h3>
      <p className='mb-6 max-w-sm text-muted-foreground'>
        You haven't invested in any properties yet. Start building your real
        estate portfolio today.
      </p>
      <Link href={paths.listings.list}>
        <Button>
          Explore Properties
          <ExternalLink className='ml-2 h-4 w-4' />
        </Button>
      </Link>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert variant='destructive'>
      <AlertTriangle className='h-4 w-4' />
      <AlertDescription className='flex items-center justify-between'>
        <span>Failed to load your properties: {error.message}</span>
        <Button variant='outline' size='sm' onClick={onRetry}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function OwnedPropertiesTable({
  ownedProperties,
  isLoading,
  error,
  onRetry,
}: OwnedPropertiesTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFullAddress = (property: OwnedPropertiesViewRow) => {
    const parts = [property.city, property.state, property.country].filter(
      Boolean,
    );
    return parts.join(', ') || 'Address not available';
  };

  const calculatePendingOwnership = (property: OwnedPropertiesViewRow) => {
    if (
      !property.pending_investment ||
      !property.price ||
      property.pending_investment <= 0
    ) {
      return 0;
    }
    return (property.pending_investment / property.price) * 100;
  };

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-2xl font-bold'>Your Properties</h2>
        <p className='text-muted-foreground'>
          Here you can see all the properties you have invested in.
        </p>
      </div>
      <div>
        {error && !isLoading ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : !ownedProperties || ownedProperties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader className='bg-accent'>
                <TableRow>
                  <TableHead className='w-[300px]'>Property</TableHead>
                  <TableHead>Contribution</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Monthly Returns</TableHead>
                  <TableHead>Contribution Date</TableHead>
                  <TableHead className='w-[100px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownedProperties.map((property, i) => {
                  const pendingOwnership = calculatePendingOwnership(property);

                  return (
                    <TableRow
                      key={property.id}
                      className={cn(
                        'group hover:bg-muted/50',
                        i % 2 !== 0 && 'bg-accent/50',
                      )}
                    >
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='relative h-12 w-16 overflow-hidden rounded-lg'>
                            {property.images && property.images.length > 0 ? (
                              <Image
                                src={property.images[0]}
                                alt={property.title || 'Property'}
                                fill
                                className='object-cover'
                                sizes='64px'
                              />
                            ) : (
                              <div className='flex h-full w-full items-center justify-center bg-muted'>
                                <Building2 className='h-6 w-6 text-muted-foreground' />
                              </div>
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='line-clamp-1 font-medium'>
                              {property.title || 'Untitled Property'}
                            </p>
                            <div className='flex items-center text-sm text-muted-foreground'>
                              <MapPin className='mr-1 h-3 w-3 flex-shrink-0' />
                              <span className='line-clamp-1'>
                                {getFullAddress(property)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='font-semibold'>
                            {formatCurrency(property.successful_investment)}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            of {formatCurrency(property.price)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          {property.pending_investment &&
                          property.pending_investment > 0 ? (
                            <>
                              <div className='flex items-center gap-1'>
                                <Clock className='h-3 w-3 text-orange-500' />
                                <p className='text-sm font-medium text-orange-600'>
                                  {formatCurrency(property.pending_investment)}
                                </p>
                              </div>
                              <Badge
                                variant='outline'
                                className='border-orange-200 text-xs text-orange-600'
                              >
                                Under Review
                              </Badge>
                            </>
                          ) : (
                            <div className='flex items-center justify-center'>
                              <span className='text-sm text-muted-foreground'>
                                -
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Badge variant='secondary' className='font-mono'>
                            {formatNumber(
                              property.ownership_percentage || 0,
                              2,
                            )}
                            %
                          </Badge>
                          {pendingOwnership > 0 && (
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3 text-orange-500' />
                              <Badge
                                variant='outline'
                                className='border-orange-200 font-mono text-xs text-orange-600'
                              >
                                +{formatNumber(pendingOwnership, 2)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='text-sm font-medium text-green-600'>
                            {formatCurrency(property.minimum_monthly_return)} -{' '}
                            {formatCurrency(property.maximum_monthly_return)}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            per month
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center text-sm text-muted-foreground'>
                          <Calendar className='mr-1 h-3 w-3' />
                          {formatDate(property.latest_investment_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={paths.listings.detail(property.id!)}>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='opacity-0 group-hover:opacity-100'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
