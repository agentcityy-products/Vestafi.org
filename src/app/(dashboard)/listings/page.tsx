'use client';

import {
  Building2,
  CheckCircle2,
  Headphones,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { useTotalInvested } from '@/hooks/queries/investment';
import { useListings } from '@/hooks/queries/listing';

import SupportDialog from '@/components/common/support-dialog';
import { EmptyState } from '@/components/listings/empty-state';
import { ErrorState } from '@/components/listings/error-state';
import { ListingsPagination } from '@/components/listings/pagination';
import {
  getOpportunityType,
  PropertyCard,
} from '@/components/listings/property-card';
import { PropertyCardSkeleton } from '@/components/listings/property-card-skeleton';
import { ListingsSearch } from '@/components/listings/search';
import { Button } from '@/components/ui/button';

import { isListingAccessible } from '@/controller/listing/listing-access';

import { ListingsViewRow } from '@/types/dao';

const ListingsPage = () => {
  const [supportOpen, setSupportOpen] = useState(false);
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
  const groupedProperties = useMemo(
    () => ({
      prime: properties.filter(
        (property) => getOpportunityType(property) === 'prime',
      ),
      live: properties.filter(
        (property) => getOpportunityType(property) === 'live',
      ),
      fractional: properties.filter(
        (property) => getOpportunityType(property) === 'fractional',
      ),
    }),
    [properties],
  );

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
          <h1 className='text-3xl font-bold'>Current Ownership Openings</h1>
          <p className='mt-2 text-muted-foreground'>
            Private apartment ownership opportunities currently available inside
            Vestafi.
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
    <div className='space-y-12 pb-8'>
      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />

      <div className='relative overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#fafaf9_0%,#ffffff_52%,#ecfdf5_130%)] px-6 py-10 sm:px-10 sm:py-14'>
        <div className='relative z-10 max-w-2xl'>
          <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-stone-600 shadow-sm backdrop-blur'>
            <KeyRound className='h-3.5 w-3.5 text-emerald-700' />
            Available inside Vestafi
          </div>
          <h1 className='text-4xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-5xl'>
            Current Ownership Openings
          </h1>
          <p className='mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg'>
            Private apartment ownership opportunities currently available inside
            Vestafi.
          </p>
        </div>
        <div className='absolute -right-20 -top-28 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl' />
      </div>

      {/* Search and Filters */}
      <div>
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <ListingsSearch value={searchTerm} onChange={handleSearchChange} />

          {!isLoading && totalCount > 0 && (
            <div className='text-sm text-muted-foreground'>
              {debouncedSearchTerm
                ? `Found ${totalCount} propert${totalCount === 1 ? 'y' : 'ies'} matching "${debouncedSearchTerm}"`
                : `${totalCount} ownership opening${totalCount === 1 ? '' : 's'}`}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading || isTotalInvestedLoading ? (
        <>
          {/* Loading State */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
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
                : 'No ownership openings'
            }
            description={
              debouncedSearchTerm
                ? `We couldn't find any properties matching "${debouncedSearchTerm}". Try adjusting your search terms.`
                : 'There are no apartment ownership openings at the moment. Society members will be notified when access reopens.'
            }
            actionLabel={debouncedSearchTerm ? 'Clear search' : undefined}
            onAction={debouncedSearchTerm ? clearSearch : undefined}
            icon={debouncedSearchTerm ? 'search' : 'building'}
          />
        </>
      ) : (
        <>
          <div className='space-y-14'>
            {[
              {
                key: 'prime' as const,
                title: 'Prime Openings',
                description:
                  'Select apartments available through a private, concierge-led ownership process.',
                icon: Sparkles,
              },
              {
                key: 'live' as const,
                title: 'Live Ownership',
                description:
                  'Operational apartments with active ownership and distribution history.',
                icon: CheckCircle2,
              },
              {
                key: 'fractional' as const,
                title: 'Member Participation',
                description:
                  'Structured apartment positions currently open to member participation.',
                icon: Users,
              },
            ].map((section) => {
              const sectionProperties = groupedProperties[section.key];
              if (sectionProperties.length === 0) return null;
              const Icon = section.icon;

              return (
                <section key={section.key}>
                  <div className='mb-6 flex items-start gap-3'>
                    <div className='mt-0.5 rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-700'>
                      <Icon className='h-4 w-4' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold tracking-tight text-stone-950'>
                        {section.title}
                      </h2>
                      <p className='mt-1 text-sm text-stone-500'>
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
                    {sectionProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        isAccessible={isListingAccessible(
                          property,
                          totalInvested || 0,
                        )}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Pagination */}
          <div className='mt-10'>
            <ListingsPagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}

      <section className='grid overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-950 text-white lg:grid-cols-[1.4fr_0.6fr]'>
        <div className='p-8 sm:p-10'>
          <p className='text-xs font-medium uppercase tracking-[0.18em] text-emerald-300'>
            Private guidance
          </p>
          <h2 className='mt-4 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl'>
            Need help choosing the right ownership opportunity?
          </h2>
          <p className='mt-3 text-stone-300'>
            A Vestafi advisor can guide you privately.
          </p>
          <Button
            className='mt-7 rounded-xl bg-white text-stone-950 hover:bg-stone-100'
            onClick={() => setSupportOpen(true)}
          >
            <Headphones className='mr-2 h-4 w-4' />
            Speak To Vestafi
          </Button>
        </div>
        <div className='flex items-center justify-center bg-emerald-950/70 p-10'>
          <div className='flex h-28 w-28 items-center justify-center rounded-full border border-emerald-700/60 bg-emerald-900/50'>
            <ShieldCheck className='h-11 w-11 text-emerald-200' />
          </div>
        </div>
      </section>

      <section>
        <div className='mx-auto max-w-2xl text-center'>
          <p className='text-xs font-medium uppercase tracking-[0.18em] text-emerald-700'>
            A private ownership system
          </p>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight text-stone-950'>
            How Vestafi Works
          </h2>
        </div>
        <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
          {[
            ['01', 'Apply To Join'],
            ['02', 'Access Openings'],
            ['03', 'Secure Ownership'],
            ['04', 'Receive Distributions'],
            ['05', 'Vestafi Manages'],
          ].map(([number, label]) => (
            <div
              key={number}
              className='rounded-2xl border border-stone-200 bg-white p-5'
            >
              <span className='text-xs font-semibold text-emerald-700'>
                {number}
              </span>
              <p className='mt-8 font-medium text-stone-900'>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='rounded-[2rem] bg-stone-50 px-6 py-10 sm:px-10'>
        <div className='mb-8'>
          <p className='text-xs font-medium uppercase tracking-[0.18em] text-stone-500'>
            Quiet confidence
          </p>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight text-stone-950'>
            Why Members Trust Vestafi
          </h2>
        </div>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-5'>
          {[
            [Building2, 'Verified Apartments'],
            [ShieldCheck, 'Professional Management'],
            [WalletCards, 'Structured Ownership'],
            [CheckCircle2, 'Monthly Distributions'],
            [Headphones, 'Guided Support'],
          ].map(([Icon, label]) => {
            const TrustIcon = Icon as typeof Building2;
            return (
              <div key={label as string} className='flex items-center gap-3'>
                <TrustIcon className='h-5 w-5 text-emerald-700' />
                <span className='text-sm font-medium text-stone-800'>
                  {label as string}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ListingsPage;
