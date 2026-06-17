'use client';

import { Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useDebounceValue } from 'usehooks-ts';

import { useLoggedInUser } from '@/hooks/queries/profile';
import {
  useRentalProperties,
  useRentalPropertyCities,
} from '@/hooks/queries/rental-properties';

import { hasApprovedInvestment } from '@/actions/rental-properties';

import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { EmptyState } from '@/components/listings/empty-state';
import { ErrorState } from '@/components/listings/error-state';
import { ListingsPagination } from '@/components/listings/pagination';
import { PropertyCardSkeleton } from '@/components/listings/property-card-skeleton';
import { ListingsSearch } from '@/components/listings/search';
import { RentalPropertyCard } from '@/components/rental-properties/rental-property-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Label } from '@/components/ui/label';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { PriceRangeSelect } from '@/components/ui/price-range-select';

import { paths } from '@/constants/paths';

import { PropertyRow } from '@/types/dao';

const ApartmentsPage = () => {
  const { data: user } = useLoggedInUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [priceRange, setPriceRange] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showAddButton, setShowAddButton] = useState(false);

  // Fetch unique cities for dropdown options
  const { data: cities = [] } = useRentalPropertyCities();

  // Debounce search to avoid too many API calls
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);

  // Check if user has approved investment (for showing "Add Rental Apartment" button)
  useEffect(() => {
    if (user?.id) {
      hasApprovedInvestment(user.id)
        .then((hasInvestment) => {
          setShowAddButton(hasInvestment);
        })
        .catch(() => {
          setShowAddButton(false);
        });
    } else {
      setShowAddButton(false);
    }
  }, [user?.id]);

  const {
    data: rentalData,
    isLoading,
    error,
    refetch,
  } = useRentalProperties({
    page: currentPage,
    pageSize,
    search: debouncedSearchTerm,
    city: city.length > 0 ? city : undefined,
    country: country || undefined,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCity([]);
    setCountry('');
    setPriceRange({});
    setDateRange(undefined);
    setCurrentPage(1);
  }, []);

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Extract results - getRentalProperties returns { data: PropertyRow[], totalCount: number }
  const properties: PropertyRow[] = rentalData?.data || [];
  const totalCount: number = rentalData?.totalCount || 0;

  // Generate skeleton loaders
  const skeletonLoaders = useMemo(() => {
    return Array.from({ length: pageSize }, (_, index) => (
      <PropertyCardSkeleton key={index} />
    ));
  }, [pageSize]);

  // Handle error state
  if (error) {
    return (
      <div className='min-h-screen bg-background'>
        <LandingNavbar showRentAnApartmentButton={false} />
        <main className='pt-16'>
          <div className='container mx-auto px-4 py-8'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold'>Member-Listed Apartments</h1>
              <p className='mt-2 text-muted-foreground'>
                Apartments listed by Vestafi circle members for short stays
              </p>
            </div>

            <ErrorState
              message={
                error.message || 'Failed to load properties. Please try again.'
              }
              onRetry={retry}
            />
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <LandingNavbar showRentAnApartmentButton={false} />
      <main className='pt-16'>
        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Member-Listed Apartments
              </h1>
              <p className='text-muted-foreground'>
                Apartments listed by Vestafi circle members for short stays
              </p>
            </div>
            {showAddButton && user && (
              <Button asChild>
                <a href={paths.rentalProperties.submit}>Add Rental Apartment</a>
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className='mb-8 space-y-4'>
            {!isLoading && totalCount > 0 && (
              <div className='text-sm text-muted-foreground'>
                {debouncedSearchTerm
                  ? `Found ${totalCount} propert${totalCount === 1 ? 'y' : 'ies'} matching "${debouncedSearchTerm}"`
                  : `${totalCount} propert${totalCount === 1 ? 'y' : 'ies'} available`}
              </div>
            )}

            {/* Filters */}
            <div className='grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
              <div className='space-y-2 sm:col-span-2 lg:col-span-1'>
                <ListingsSearch
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className='space-y-2'>
                <MultiSelectCombobox
                  label='City'
                  options={cities.map((cityName) => ({
                    label: cityName,
                    value: cityName,
                  }))}
                  value={city}
                  onChange={(value) => {
                    setCity(value);
                    setCurrentPage(1);
                  }}
                  placeholder='Filter by city'
                  searchPlaceholder='Search cities...'
                  emptyMessage='No cities found.'
                />
              </div>
              <div className='space-y-2'>
                <PriceRangeSelect
                  label='Price Range (Per Night)'
                  value={priceRange}
                  onChange={(value) => {
                    setPriceRange(value);
                    setCurrentPage(1);
                  }}
                  max={100000}
                  placeholder='Select price range'
                />
              </div>
              <div className='space-y-2'>
                <Label>Date Range</Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder='Select check-in/check-out dates'
                />
              </div>
            </div>
          </div>

          {/* Context Banner */}
          {!isLoading && totalCount > 0 && (
            <Alert className='mb-8 border-emerald-200 bg-emerald-50/50 text-emerald-900'>
              <Info className='h-4 w-4 text-emerald-700' />
              <AlertDescription className='text-sm'>
                These apartments are listed by Vestafi members for bookings.
                They are not co-owned circle assets.
              </AlertDescription>
            </Alert>
          )}

          {/* Content */}
          {isLoading ? (
            <>
              <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
                {skeletonLoaders}
              </div>
            </>
          ) : properties.length === 0 ? (
            <>
              <EmptyState
                title={
                  debouncedSearchTerm
                    ? 'No properties found'
                    : 'No properties available'
                }
                description={
                  debouncedSearchTerm
                    ? `We couldn't find any properties matching "${debouncedSearchTerm}". Try adjusting your search terms.`
                    : 'There are currently no rental apartments available. Please check back later.'
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
                  <RentalPropertyCard
                    key={property.id}
                    property={property}
                    defaultDateRange={dateRange}
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
      </main>
      <LandingFooter />
    </div>
  );
};

export default ApartmentsPage;
