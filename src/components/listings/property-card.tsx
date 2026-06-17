'use client';

import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Lock,
  MapPin,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { businessConfig } from '@/config/app';
import { paths } from '@/constants/paths';

import { ListingsViewRow } from '@/types/dao';

interface PropertyCardProps {
  property: ListingsViewRow;
  isAccessible?: boolean;
}

export const PropertyCard = ({
  property,
  isAccessible = true,
}: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!property.id) return null;

  const getMainImage = () => {
    return property.images && property.images.length > 0
      ? property.images[currentImageIndex]
      : '/placeholder-property.jpg';
  };

  const hasMultipleImages = property.images && property.images.length > 1;

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? (property.images?.length || 1) - 1 : prev - 1,
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === (property.images?.length || 1) - 1 ? 0 : prev + 1,
    );
  };

  const getFullAddress = () => {
    const parts = [
      property.address_line_1,
      property.address_line_2,
      property.city,
      property.state,
      property.zip_code,
      property.country,
    ].filter(Boolean);

    return parts.join(', ');
  };

  const investmentPercentage = property.investment_percentage || 0;
  const averageRent = property.average_rent_6_months || 0;
  const isFullyInvested = investmentPercentage >= 100;
  const remainingPercentage = Math.max(0, 100 - investmentPercentage);

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg',
      )}
    >
      <div className='relative aspect-[4/3] overflow-hidden'>
        <Image
          src={getMainImage()}
          alt={property.title || 'Property'}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePreviousImage}
              className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70'
              aria-label='Previous image'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <button
              onClick={handleNextImage}
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70'
              aria-label='Next image'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
            <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1'>
              {property.images?.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'w-4 bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className='absolute left-4 top-4'>
          <Badge
            variant='secondary'
            className={`${
              isFullyInvested
                ? 'bg-red-100 text-red-800'
                : 'bg-white/90 text-gray-900'
            }`}
          >
            <Building2 className='mr-1 h-3 w-3' />
            {isFullyInvested
              ? 'Funded'
              : investmentPercentage > 0
                ? `${remainingPercentage.toFixed(0)}% Available`
                : 'Available'}
          </Badge>
        </div>
        {averageRent > 0 && (
          <div className='absolute right-4 top-4'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant='success'>
                  <TrendingUp className='mr-1 h-3 w-3' />
                  {formatCurrency(averageRent)}/mo
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-xs'>
                  Past 6 months average monthly rental income for this property
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <div className='relative'>
        {/* Title section - always visible */}
        <div className='px-6 pt-6'>
          <h3 className='line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary'>
            {property.title || 'Untitled Property'}
          </h3>
        </div>

        {/* Details section - blurred when not accessible */}
        <div className='relative'>
          {!isAccessible && (
            <div className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-4'>
              <div className='rounded-full bg-background/80 p-4 ring-4 ring-background/20'>
                <Lock className='h-8 w-8 text-muted-foreground' />
              </div>
              <div className='space-y-2 text-center'>
                <h4 className='font-medium text-foreground'>Property Locked</h4>
                <p className='max-w-[240px] text-sm text-muted-foreground'>
                  Invest at least{' '}
                  {formatCurrency(businessConfig.minInvestmentAmount)} in
                  available listings to unlock this property
                </p>
              </div>
            </div>
          )}
          <div
            className={cn(
              'space-y-4',
              !isAccessible && 'pointer-events-none select-none blur-md',
            )}
          >
            <CardContent className='space-y-2 pb-0 pt-2'>
              <div className='flex items-center text-sm text-muted-foreground'>
                <MapPin className='mr-1 h-4 w-4 flex-shrink-0' />
                <span className='line-clamp-1'>{getFullAddress()}</span>
              </div>

              {/* Funding Progress Section */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Funding Progress
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isFullyInvested ? 'text-green-600' : 'text-primary'
                    }`}
                  >
                    {formatNumber(investmentPercentage, 1)}%
                  </span>
                </div>

                <div className='space-y-1'>
                  <Progress
                    value={investmentPercentage}
                    className='h-2 w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>0%</span>
                    <span
                      className={
                        isFullyInvested ? 'font-medium text-green-600' : ''
                      }
                    >
                      {isFullyInvested ? 'Complete!' : '100%'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <DollarSign className='mr-1 h-4 w-4' />
                    <span>Property Value</span>
                  </div>
                  <p className='text-lg font-semibold'>
                    {formatCurrency(property.price) || 'N/A'}
                  </p>
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <Users className='mr-1 h-4 w-4' />
                    <span>Total Funded</span>
                  </div>
                  <p className='text-lg font-semibold'>
                    {formatCurrency(property.total_investment) || 'N/A'}
                  </p>
                </div>
              </div>

              {(!!property.minimum_monthly_rent ||
                !!property.maximum_monthly_rent) && (
                <div className='grid gap-2 rounded-lg bg-muted/50 p-2'>
                  {/* Yearly Investment Return Section */}
                  <div className='flex justify-between'>
                    <div className='mb-0.5 flex items-center text-xs text-muted-foreground'>
                      <TrendingUp className='mr-1 h-3 w-3' />
                      <span>Yearly Return</span>
                    </div>
                    <p className='text-sm font-medium'>
                      {formatNumber(
                        ((property.minimum_monthly_rent || 0) * 12 * 100) /
                          (property.price || 1),
                        1,
                      )}
                      % -{' '}
                      {formatNumber(
                        ((property.maximum_monthly_rent || 0) * 12 * 100) /
                          (property.price || 1),
                        1,
                      )}
                      %
                    </p>
                  </div>

                  {/* Monthly Rent Section */}
                  <div className='flex justify-between'>
                    <div className='mb-0.5 flex items-center text-xs text-muted-foreground'>
                      <Calendar className='mr-1 h-3 w-3' />
                      <span>Monthly Rent</span>
                    </div>
                    <p className='text-sm font-medium'>
                      {formatCurrency(property.minimum_monthly_rent)} -{' '}
                      {formatCurrency(property.maximum_monthly_rent)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className='p-6 pt-0'>
              <Link
                href={paths.listings.detail(property.id)}
                className='w-full'
              >
                <Button
                  className='w-full'
                  variant={isFullyInvested ? 'secondary' : 'default'}
                >
                  {isFullyInvested ? 'View Details' : 'Invest Now'}
                </Button>
              </Link>
            </CardFooter>
          </div>
        </div>
      </div>
    </Card>
  );
};
