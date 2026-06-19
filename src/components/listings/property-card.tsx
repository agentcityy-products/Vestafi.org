'use client';

import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  MapPin,
  Sparkles,
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

import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { businessConfig } from '@/config/app';
import { paths } from '@/constants/paths';

import { ListingsViewRow, OpportunityType } from '@/types/dao';

interface PropertyCardProps {
  property: ListingsViewRow;
  isAccessible?: boolean;
}

const categoryConfig: Record<
  OpportunityType,
  {
    eyebrow: string;
    label: string;
    cta: string;
    badgeClassName: string;
  }
> = {
  prime: {
    eyebrow: 'Private ownership opening',
    label: 'Prime',
    cta: 'Secure Ownership',
    badgeClassName: 'border-white/40 bg-white/90 text-stone-900',
  },
  live: {
    eyebrow: 'Ownership active',
    label: 'Live',
    cta: 'Join Ownership',
    badgeClassName: 'border-emerald-200 bg-emerald-50/95 text-emerald-800',
  },
  fractional: {
    eyebrow: 'Member ownership opening',
    label: 'Fractional',
    cta: 'Enter Ownership',
    badgeClassName: 'border-sky-200 bg-sky-50/95 text-sky-800',
  },
};

export function getOpportunityType(property: ListingsViewRow): OpportunityType {
  if (
    property.opportunity_type === 'prime' ||
    property.opportunity_type === 'live' ||
    property.opportunity_type === 'fractional'
  ) {
    return property.opportunity_type;
  }

  if ((property.average_rent_6_months ?? 0) > 0) return 'live';
  if ((property.investment_percentage ?? 0) === 0) return 'prime';
  return 'fractional';
}

export const PropertyCard = ({
  property,
  isAccessible = true,
}: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!property.id) return null;

  const images = property.images ?? [];
  const mainImage = images[currentImageIndex] ?? '/placeholder-property.jpg';
  const hasMultipleImages = images.length > 1;
  const ownershipProgress = property.investment_percentage ?? 0;
  const isFullyPositioned = ownershipProgress >= 100;
  const averageRent = property.average_rent_6_months ?? 0;
  const opportunityType = getOpportunityType(property);
  const config = categoryConfig[opportunityType];

  const address = [property.city, property.state, property.country]
    .filter(Boolean)
    .join(', ');

  const changeImage = (direction: -1 | 1, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentImageIndex((current) => {
      const next = current + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <Card className='group overflow-hidden rounded-[1.5rem] border-stone-200/80 bg-white shadow-[0_18px_60px_-42px_rgba(28,25,23,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-38px_rgba(28,25,23,0.4)]'>
      <div
        className={cn(
          'relative overflow-hidden',
          opportunityType === 'prime' ? 'aspect-[5/4]' : 'aspect-[4/3]',
        )}
      >
        <Image
          src={mainImage}
          alt={property.title || 'Vestafi apartment'}
          fill
          className='object-cover transition-transform duration-700 group-hover:scale-[1.03]'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-stone-950/10' />

        <Badge
          variant='outline'
          className={cn(
            'absolute left-4 top-4 gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur',
            config.badgeClassName,
          )}
        >
          {opportunityType === 'prime' ? (
            <Sparkles className='h-3 w-3' />
          ) : opportunityType === 'live' ? (
            <CheckCircle2 className='h-3 w-3' />
          ) : (
            <Users className='h-3 w-3' />
          )}
          {config.label}
        </Badge>

        {hasMultipleImages && (
          <>
            <button
              type='button'
              onClick={(event) => changeImage(-1, event)}
              className='absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-950/35 p-2 text-white opacity-0 backdrop-blur transition hover:bg-stone-950/55 group-hover:opacity-100'
              aria-label='Previous apartment image'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={(event) => changeImage(1, event)}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-950/35 p-2 text-white opacity-0 backdrop-blur transition hover:bg-stone-950/55 group-hover:opacity-100'
              aria-label='Next apartment image'
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </>
        )}

        <div className='absolute bottom-4 left-4 right-4'>
          <p className='text-xs font-medium uppercase tracking-[0.18em] text-white/80'>
            {config.eyebrow}
          </p>
        </div>
      </div>

      <div className='relative'>
        {!isAccessible && (
          <div className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/80 px-8 text-center backdrop-blur-md'>
            <div className='rounded-full border border-stone-200 bg-white p-3 shadow-sm'>
              <Lock className='h-5 w-5 text-stone-600' />
            </div>
            <div>
              <h4 className='font-medium text-stone-900'>
                Member access required
              </h4>
              <p className='mt-1 text-sm leading-5 text-stone-600'>
                Hold at least{' '}
                {formatCurrency(businessConfig.minInvestmentAmount)} in active
                ownership to access this opening.
              </p>
            </div>
          </div>
        )}

        <div className={cn(!isAccessible && 'pointer-events-none select-none')}>
          <CardContent
            className={cn(
              'space-y-5 p-6',
              opportunityType === 'prime' && 'pb-5 pt-7',
            )}
          >
            <div>
              <h3 className='line-clamp-2 text-xl font-semibold tracking-[-0.02em] text-stone-950'>
                {property.title || 'Untitled Apartment'}
              </h3>
              <div className='mt-2 flex items-center text-sm text-stone-500'>
                <MapPin className='mr-1.5 h-3.5 w-3.5' />
                <span className='line-clamp-1'>{address}</span>
              </div>
            </div>

            {opportunityType === 'prime' && (
              <div className='flex items-end justify-between border-t border-stone-100 pt-5'>
                <div>
                  <p className='text-xs uppercase tracking-[0.16em] text-stone-400'>
                    Private acquisition
                  </p>
                  <p className='mt-1 text-lg font-semibold text-stone-900'>
                    {formatCurrency(property.price)}
                  </p>
                </div>
                <Building2 className='h-5 w-5 text-stone-300' />
              </div>
            )}

            {opportunityType === 'live' && (
              <>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-xl bg-emerald-50/70 p-3'>
                    <p className='text-xs text-emerald-700'>
                      Distributions active
                    </p>
                    <p className='mt-1 text-sm font-semibold text-emerald-950'>
                      {averageRent > 0
                        ? `${formatCurrency(averageRent)}/mo`
                        : 'Operational'}
                    </p>
                  </div>
                  <div className='rounded-xl bg-stone-50 p-3'>
                    <p className='text-xs text-stone-500'>
                      Ownership positioned
                    </p>
                    <p className='mt-1 text-sm font-semibold text-stone-900'>
                      {formatNumber(ownershipProgress, 0)}%
                    </p>
                  </div>
                </div>
                <p className='flex items-center gap-2 text-sm text-stone-600'>
                  <TrendingUp className='h-4 w-4 text-emerald-600' />
                  Members are currently earning from this apartment.
                </p>
              </>
            )}

            {opportunityType === 'fractional' && (
              <div className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-stone-500'>Ownership progress</span>
                  <span className='font-semibold text-stone-900'>
                    {formatNumber(ownershipProgress, 0)}%
                  </span>
                </div>
                <Progress value={ownershipProgress} className='h-1.5' />
                <div className='flex items-center justify-between text-xs text-stone-500'>
                  <span>Member participation</span>
                  <span>
                    {isFullyPositioned ? 'Positioned' : 'Opening active'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className='px-6 pb-6 pt-0'>
            <Link href={paths.listings.detail(property.id)} className='w-full'>
              <Button
                className='h-11 w-full rounded-xl'
                variant={isFullyPositioned ? 'secondary' : 'default'}
              >
                {isFullyPositioned ? 'View Ownership' : config.cta}
              </Button>
            </Link>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};
