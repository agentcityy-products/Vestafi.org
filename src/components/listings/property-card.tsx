'use client';

import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Heart,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const typeStyles = {
  prime: {
    icon: Crown,
    label: 'VESTAFI PRIME',
    secondary: 'FULL OWNERSHIP',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    cta: 'Secure Ownership',
  },
  live: {
    icon: CheckCircle2,
    label: 'VESTAFI LIVE',
    secondary: 'RENT ACTIVE',
    badge: 'bg-emerald-900 text-white border-emerald-800',
    cta: 'Join Ownership',
  },
  fractional: {
    icon: Users,
    label: 'VESTAFI FRACTIONAL',
    secondary: 'MEMBER OWNERSHIP',
    badge: 'bg-violet-50 text-violet-800 border-violet-200',
    cta: 'Join Together',
  },
} as const;

export function PropertyCard({
  property,
  isAccessible = true,
}: PropertyCardProps) {
  if (!property.id) return null;

  const type = getOpportunityType(property);
  const config = typeStyles[type];
  const Icon = config.icon;
  const image =
    property.images?.[0] || '/images/vestafi/apartment-placeholder.png';
  const progress = Number(property.investment_percentage || 0);
  const rent = Number(
    property.average_rent_6_months || property.minimum_monthly_rent || 0,
  );
  const annualYield =
    Number(property.price) > 0 && rent > 0
      ? (rent * 12 * 100) / Number(property.price)
      : 17;
  const location = [property.city, property.state, property.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className='group relative overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl'>
      <div className='relative aspect-[4/3] overflow-hidden'>
        <Image
          src={image}
          alt={property.title || 'Vestafi apartment'}
          fill
          className='object-cover transition duration-500 group-hover:scale-[1.025]'
          sizes='(max-width: 768px) 100vw, 33vw'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10' />
        <div className='absolute left-3 top-3 flex flex-wrap gap-2'>
          <Badge className={cn('gap-1.5 border px-3 py-1.5', config.badge)}>
            <Icon className='h-3.5 w-3.5' />
            {config.label}
          </Badge>
          <Badge className='border-white/70 bg-white/90 px-3 py-1.5 text-emerald-900 hover:bg-white/90'>
            {config.secondary}
          </Badge>
        </div>
        <button
          type='button'
          aria-label='Save apartment'
          className='absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-800 shadow'
        >
          <Heart className='h-5 w-5' />
        </button>
        <Badge className='absolute bottom-3 left-3 bg-emerald-900/95 px-3 py-1.5 text-white'>
          <ShieldCheck className='mr-1.5 h-3.5 w-3.5' />
          Managed by Vestafi
        </Badge>
      </div>

      <CardContent className='relative space-y-5 p-5'>
        {!isAccessible && (
          <div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 p-7 text-center backdrop-blur'>
            <Lock className='h-7 w-7 text-primary' />
            <p className='mt-3 font-semibold'>Member access required</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Hold {formatCurrency(businessConfig.minInvestmentAmount)} in
              active ownership to access this opening.
            </p>
          </div>
        )}

        <div>
          <h3 className='text-xl font-bold tracking-tight text-stone-950'>
            {property.title}
          </h3>
          <p className='mt-1 flex items-center text-sm text-muted-foreground'>
            <MapPin className='mr-1.5 h-4 w-4' />
            {location}
          </p>
        </div>

        {type === 'prime' && (
          <div className='grid grid-cols-2 divide-x rounded-xl border p-4'>
            <Metric
              label='Full ownership price'
              value={formatCurrency(property.price)}
            />
            <Metric
              label='Estimated annual yield'
              value={`${annualYield.toFixed(0)}%`}
              className='pl-4'
            />
          </div>
        )}

        {type === 'live' && (
          <div className='grid grid-cols-3 divide-x rounded-xl border p-4'>
            <Metric label='Monthly rent' value={formatCurrency(rent)} />
            <Metric label='Occupancy' value='100%' className='pl-3' />
            <Metric label='Next distribution' value='4 Jul' className='pl-3' />
          </div>
        )}

        {type === 'fractional' && (
          <div className='space-y-3 rounded-xl border p-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Ownership funded</span>
              <strong>{formatNumber(progress, 0)}%</strong>
            </div>
            <Progress value={progress} className='h-2' />
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Starting from</span>
              <strong>{formatCurrency(1_000_000)}</strong>
            </div>
          </div>
        )}

        <Button asChild className='h-11 w-full'>
          <Link href={paths.listings.detail(property.id)}>
            {config.cta}
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className='text-[11px] leading-4 text-muted-foreground'>{label}</p>
      <p className='mt-1 text-sm font-bold text-stone-950'>{value}</p>
    </div>
  );
}
