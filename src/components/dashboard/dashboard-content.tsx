'use client';

import {
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  Crown,
  Globe2,
  Headphones,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useListings } from '@/hooks/queries/listing';
import { useOwnershipReservations } from '@/hooks/queries/ownership';
import { useProfile } from '@/hooks/queries/profile';

import { PropertyCard } from '@/components/listings/property-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

import { ListingsViewRow } from '@/types/dao';

const PLACEHOLDER_IMAGE = '/images/vestafi/apartment-placeholder.png';

export function DashboardContent() {
  const { data: profile } = useProfile();
  const { data: reservations = [] } = useOwnershipReservations();
  const { data: listingsResult } = useListings({
    page: 1,
    pageSize: 6,
    search: '',
  });

  const listings: ListingsViewRow[] = listingsResult?.data?.data || [];
  const firstName = profile?.first_name || 'Member';
  const activeReservations = reservations.filter((reservation) =>
    ['reserved', 'pending_review'].includes(reservation.status),
  );

  return (
    <div className='space-y-8 pb-10'>
      <section className='grid gap-6 xl:grid-cols-[1fr_1.1fr]'>
        <div className='flex flex-col justify-center rounded-[2rem] border bg-gradient-to-br from-white via-white to-emerald-50 p-7 md:p-10'>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-primary'>
            Vestafi Inner Society
          </p>
          <h1 className='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
            Welcome back, {firstName}
          </h1>
          <p className='mt-5 max-w-xl text-lg leading-8 text-muted-foreground'>
            You’re part of a private circle building ownership, dependable
            income, and generational wealth through real apartments.
          </p>
        </div>
        <div className='relative min-h-[320px] overflow-hidden rounded-[2rem]'>
          <Image
            src={PLACEHOLDER_IMAGE}
            alt='Vestafi apartment'
            fill
            priority
            className='object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent' />
          <div className='absolute bottom-0 left-0 right-0 p-7 text-white'>
            <p className='text-sm uppercase tracking-[0.16em] text-white/75'>
              Ownership made tangible
            </p>
            <p className='mt-2 text-2xl font-semibold'>
              Real homes. Real rent. Real ownership.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className='mb-4'>
          <h2 className='text-2xl font-bold'>Today in Vestafi Society</h2>
          <p className='text-muted-foreground'>
            Real people. Real ownership. Real impact.
          </p>
        </div>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            icon={Users}
            value='57%'
            label='male members'
            detail='Building wealth together'
          />
          <StatCard
            icon={Bell}
            value='43%'
            label='female members'
            detail='Investing in their future'
          />
          <StatCard
            icon={Globe2}
            value='8'
            label='countries represented'
            detail='A global society united'
          />
          <StatCard
            icon={Building2}
            value='87%'
            label='apartment occupancy'
            detail='Our apartments are performing'
          />
        </div>
      </section>

      {activeReservations.length > 0 && (
        <section className='rounded-[2rem] border border-amber-200 bg-amber-50/70 p-6'>
          <div className='flex items-start gap-3'>
            <CalendarClock className='mt-1 h-6 w-6 text-amber-700' />
            <div className='flex-1'>
              <h2 className='text-xl font-bold text-amber-950'>
                Your reserved ownership
              </h2>
              <p className='mt-1 text-sm text-amber-900/75'>
                Bank-transfer reservations remain held for seven days.
              </p>
              <div className='mt-5 grid gap-3 lg:grid-cols-2'>
                {activeReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className='rounded-2xl border border-amber-200 bg-white p-4'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='font-semibold'>
                          {reservation.property?.title || 'Vestafi apartment'}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>
                          {formatCurrency(reservation.ownership_amount)} ·{' '}
                          {reservation.opportunity_type.toUpperCase()}
                        </p>
                      </div>
                      <span className='rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800'>
                        Under review
                      </span>
                    </div>
                    <p className='mt-4 text-sm text-amber-950'>
                      Reserved until{' '}
                      <strong>
                        {new Date(reservation.expires_at).toLocaleDateString(
                          'en-UG',
                          { dateStyle: 'long' },
                        )}
                      </strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className='rounded-[2rem] border p-6 md:p-8'>
        <h2 className='text-2xl font-bold'>Where would you like to start?</h2>
        <p className='mt-1 text-muted-foreground'>
          Choose the path that matches your ownership goals.
        </p>
        <div className='mt-6 grid gap-5 lg:grid-cols-3'>
          <PathCard
            icon={Crown}
            eyebrow='VESTAFI PRIME'
            title='Own an entire apartment.'
            text='Full control, full ownership, all to yourself.'
            href={`${paths.listings.list}?type=prime`}
            cta='Explore Prime'
            tone='amber'
          />
          <PathCard
            icon={TrendingUp}
            eyebrow='VESTAFI LIVE'
            title='Join an apartment already generating rent.'
            text='Start earning from day one with active tenants and rent flow.'
            href={`${paths.listings.list}?type=live`}
            cta='Explore Live'
            tone='green'
          />
          <PathCard
            icon={Users}
            eyebrow='VESTAFI FRACTIONAL'
            title='Acquire an apartment together.'
            text='Pool contributions, own shares, and grow together.'
            href={`${paths.listings.list}?type=fractional`}
            cta='Explore Fractional'
            tone='violet'
          />
        </div>
      </section>

      <section className='rounded-[2rem] border bg-muted/20 p-6 md:p-8'>
        <h2 className='text-2xl font-bold'>How Vestafi works</h2>
        <div className='mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-5'>
          {[
            ['1', 'Browse apartments', 'Explore verified openings.'],
            ['2', 'Choose your path', 'Prime, Live, or Fractional.'],
            ['3', 'Complete ownership', 'Use bank transfer or Vestafi Wallet.'],
            ['4', 'Earn together', 'Receive rent distributions.'],
            ['5', 'We manage', 'Vestafi handles the property.'],
          ].map(([number, title, text]) => (
            <div key={number}>
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white'>
                {number}
              </span>
              <p className='mt-4 font-semibold'>{title}</p>
              <p className='mt-1 text-sm text-muted-foreground'>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {listings.length > 0 && (
        <section>
          <div className='mb-5 flex items-end justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold'>Featured apartments</h2>
              <p className='text-muted-foreground'>
                Handpicked openings currently inside the society.
              </p>
            </div>
            <Button asChild variant='ghost'>
              <Link href={paths.listings.list}>
                View all <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {listings.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      <section className='grid gap-5 lg:grid-cols-2'>
        <Callout
          icon={Headphones}
          title='Not sure where to start?'
          text='Talk to a real person. We’ll help you find the best ownership path.'
          cta='Schedule a call'
        />
        <Callout
          icon={ShieldCheck}
          title='Built for confident ownership'
          text='Every apartment is vetted, structured, and supported by Vestafi.'
          cta='Learn how it works'
        />
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  detail,
}: {
  icon: typeof Building2;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className='p-5'>
        <div className='flex items-start gap-3'>
          <span className='flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-primary'>
            <Icon className='h-5 w-5' />
          </span>
          <div>
            <p className='text-2xl font-bold'>{value}</p>
            <p className='font-medium'>{label}</p>
            <p className='mt-2 text-xs text-muted-foreground'>{detail}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PathCard({
  icon: Icon,
  eyebrow,
  title,
  text,
  href,
  cta,
  tone,
}: {
  icon: typeof Crown;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  tone: 'amber' | 'green' | 'violet';
}) {
  const tones = {
    amber: 'bg-amber-50 text-amber-800',
    green: 'bg-emerald-50 text-emerald-800',
    violet: 'bg-violet-50 text-violet-800',
  };
  return (
    <Card className='overflow-hidden'>
      <div className='relative aspect-[16/9] overflow-hidden'>
        <Image src={PLACEHOLDER_IMAGE} alt='' fill className='object-cover' />
      </div>
      <CardContent className='p-5'>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}
        >
          <Icon className='mr-1.5 h-3.5 w-3.5' /> {eyebrow}
        </span>
        <h3 className='mt-4 text-xl font-bold'>{title}</h3>
        <p className='mt-2 text-sm leading-6 text-muted-foreground'>{text}</p>
        <Button asChild variant='outline' className='mt-5 w-full'>
          <Link href={href}>
            {cta} <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Callout({
  icon: Icon,
  title,
  text,
  cta,
}: {
  icon: typeof Headphones;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <div className='flex items-center gap-5 rounded-[2rem] border bg-gradient-to-r from-emerald-50/70 to-white p-6'>
      <span className='flex h-14 w-14 flex-none items-center justify-center rounded-full bg-white text-primary shadow-sm'>
        <Icon className='h-6 w-6' />
      </span>
      <div className='flex-1'>
        <h3 className='text-lg font-bold'>{title}</h3>
        <p className='mt-1 text-sm text-muted-foreground'>{text}</p>
        <Button variant='link' className='mt-2 h-auto p-0'>
          {cta} <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
