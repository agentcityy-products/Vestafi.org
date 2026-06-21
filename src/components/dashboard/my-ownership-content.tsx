'use client';

import { CalendarClock } from 'lucide-react';

import { useOwnershipReservations } from '@/hooks/queries/ownership';
import {
  useOwnedProperties,
  useUserApprovedRentalProperties,
} from '@/hooks/queries/properties';
import { useRentalIncomeBalance } from '@/hooks/queries/rental-income-balance';
import { useApprovedWithdrawals } from '@/hooks/queries/withdrawal-request';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { formatCurrency } from '@/utils/number-functions';

import { DashboardCards } from './dashboard-cards';
import { OwnedPropertiesTable } from './owned-properties-table';

export function MyOwnershipContent() {
  const {
    data: ownedProperties,
    isLoading,
    error,
    refetch,
  } = useOwnedProperties();
  const { data: rentalProperties } = useUserApprovedRentalProperties();
  const { data: withdrawals } = useApprovedWithdrawals();
  const { data: rentalIncome } = useRentalIncomeBalance();
  const { data: reservations = [] } = useOwnershipReservations();
  const activeReservations = reservations.filter((reservation) =>
    ['reserved', 'pending_review'].includes(reservation.status),
  );

  return (
    <div className='space-y-8 pb-10'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
          Vestafi Inner Society
        </p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight'>My Ownerships</h1>
        <p className='mt-2 text-muted-foreground'>
          Track apartment ownership, performance, distributions, and active
          reservations.
        </p>
      </div>

      <DashboardCards
        ownedProperties={ownedProperties}
        isOwnedPropertiesLoading={isLoading}
        approvedRentalPropertiesCount={rentalProperties?.count}
        isApprovedRentalPropertiesLoading={false}
        approvedWithdrawalsTotal={withdrawals}
        isApprovedWithdrawalsLoading={false}
        rentalIncomeBalance={rentalIncome}
        isRentalIncomeBalanceLoading={false}
      />

      {activeReservations.length > 0 && (
        <section>
          <h2 className='mb-4 text-xl font-bold'>Reserved ownership</h2>
          <div className='grid gap-4 lg:grid-cols-2'>
            {activeReservations.map((reservation) => (
              <Card key={reservation.id} className='border-amber-200'>
                <CardContent className='p-5'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='font-semibold'>
                        {reservation.property?.title || 'Vestafi apartment'}
                      </p>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {formatCurrency(reservation.ownership_amount)}
                      </p>
                    </div>
                    <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
                      Reserved
                    </Badge>
                  </div>
                  <p className='mt-5 flex items-center gap-2 text-sm'>
                    <CalendarClock className='h-4 w-4 text-amber-700' />
                    Held until{' '}
                    {new Date(reservation.expires_at).toLocaleDateString(
                      'en-UG',
                      { dateStyle: 'long' },
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <OwnedPropertiesTable
        ownedProperties={ownedProperties}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}
