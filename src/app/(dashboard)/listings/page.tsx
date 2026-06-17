'use client';

import { useCallback, useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { useTotalInvested } from '@/hooks/queries/investment';
import { useListings } from '@/hooks/queries/listing';

import { EmptyState } from '@/components/listings/empty-state';
import { ErrorState } from '@/components/listings/error-state';
import { ListingsPagination } from '@/components/listings/pagination';
import { PropertyCard } from '@/components/listings/property-card';
import { PropertyCardSkeleton } from '@/components/listings/property-card-skeleton';
import { ListingsSearch } from '@/components/listings/search';

import { isListingAccessible } from '@/controller/listing/listing-access';

import { ListingsViewRow } from '@/types/dao';

const ListingsPage = () => {
  const { data: totalInvested, isLoading: isTotalInvestedLoading } =
    useTotalInvested();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search to avoid too many API calls
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);

  const {
    data: actionResult,
    isLoading,
    error,
    refetch,
  } = useListings({
    page: currentPage,
    pageSize,
    search: debouncedSearchTerm,
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Extract results from the action result
  const properties: ListingsViewRow[] = actionResult?.data?.data || [];
  const totalCount: number = actionResult?.data?.totalCount || 0;

  // Generate skeleton loaders
  const skeletonLoaders = useMemo(() => {
    return Array.from({ length: pageSize }, (_, index) => (
      <PropertyCardSkeleton key={index} />
    ));
  }, [pageSize]);

  // Handle error state
  if (error) {
    return (
      <div className=''>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Investment Properties</h1>
          <p className='mt-2 text-muted-foreground'>
            Discover and invest in premium real estate opportunities
          </p>
        </div>

        <ErrorState
          message={
            error.message || 'Failed to load properties. Please try again.'
          }
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className=''>
      {/* Header */}

      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Apartments Under Custody
        </h1>
        <p className='text-muted-foreground'>
          Discover and invest in premium real estate opportunities
        </p>
      </div>

      {/* Search and Filters */}
      <div className='mb-8'>
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <ListingsSearch value={searchTerm} onChange={handleSearchChange} />

          {!isLoading && totalCount > 0 && (
            <div className='text-sm text-muted-foreground'>
              {debouncedSearchTerm
                ? `Found ${totalCount} propert${totalCount === 1 ? 'y' : 'ies'} matching "${debouncedSearchTerm}"`
                : `${totalCount} propert${totalCount === 1 ? 'y' : 'ies'} available`}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading || isTotalInvestedLoading ? (
        <>
          {/* Loading State */}
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
            {skeletonLoaders}
          </div>
        </>
      ) : properties.length === 0 ? (
        <>
          {/* Empty State */}
          <EmptyState
            title={
              debouncedSearchTerm
                ? 'No properties found'
                : 'No properties available'
            }
            description={
              debouncedSearchTerm
                ? `We couldn't find any properties matching "${debouncedSearchTerm}". Try adjusting your search terms.`
                : 'There are currently no investment properties available. Please check back later.'
            }
            actionLabel={debouncedSearchTerm ? 'Clear search' : undefined}
            onAction={debouncedSearchTerm ? clearSearch : undefined}
            icon={debouncedSearchTerm ? 'search' : 'building'}
          />
        </>
      ) : (
        <>
          {/* Properties Grid */}
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isAccessible={isListingAccessible(property, totalInvested || 0)}
              />
            ))}
          </div>

          {/* Pagination */}
          <ListingsPagination
            currentPage={currentPage}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default ListingsPage;
