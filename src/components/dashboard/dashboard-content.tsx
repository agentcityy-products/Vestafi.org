'use client';

import { AlertTriangle } from 'lucide-react';

import {
  useOwnedProperties,
  useUserApprovedRentalProperties,
} from '@/hooks/queries/properties';
import { useRentalIncomeBalance } from '@/hooks/queries/rental-income-balance';
import { useApprovedWithdrawals } from '@/hooks/queries/withdrawal-request';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { DashboardCards } from './dashboard-cards';
import { OwnedPropertiesTable } from './owned-properties-table';

export function DashboardContent() {
  const {
    data: ownedProperties,
    isLoading: isOwnedPropertiesLoading,
    error: ownedPropertiesError,
    refetch: refetchOwnedProperties,
  } = useOwnedProperties();

  const {
    data: approvedRentalPropertiesData,
    isLoading: isApprovedRentalPropertiesLoading,
  } = useUserApprovedRentalProperties();

  const {
    data: approvedWithdrawalsTotal,
    isLoading: isApprovedWithdrawalsLoading,
  } = useApprovedWithdrawals();

  const { data: rentalIncomeBalance, isLoading: isRentalIncomeBalanceLoading } =
    useRentalIncomeBalance();

  if (ownedPropertiesError && !isOwnedPropertiesLoading) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome to your contribution dashboard
          </p>
        </div>

        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>Failed to load dashboard data. Please try again.</span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                refetchOwnedProperties();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome to your contribution dashboard
        </p>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards
        ownedProperties={ownedProperties}
        isOwnedPropertiesLoading={isOwnedPropertiesLoading}
        approvedRentalPropertiesCount={approvedRentalPropertiesData?.count}
        isApprovedRentalPropertiesLoading={isApprovedRentalPropertiesLoading}
        approvedWithdrawalsTotal={approvedWithdrawalsTotal}
        isApprovedWithdrawalsLoading={isApprovedWithdrawalsLoading}
        rentalIncomeBalance={rentalIncomeBalance}
        isRentalIncomeBalanceLoading={isRentalIncomeBalanceLoading}
      />

      {/* Owned Properties Table */}
      <OwnedPropertiesTable
        ownedProperties={ownedProperties}
        isLoading={isOwnedPropertiesLoading}
        error={ownedPropertiesError}
        onRetry={refetchOwnedProperties}
      />
    </div>
  );
}
