'use client';

import { AlertTriangle, PiggyBank, TrendingDown, Wallet } from 'lucide-react';

import { useVault } from '@/hooks/queries/vault';

import { FeatureLock } from '@/components/common/feature-lock';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { CreateWithdrawalDialog } from './create-withdrawal-dialog';
import { WithdrawalsTable } from './withdrawals-table';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

function DashboardCard({
  title,
  value,
  description,
  icon,
  isLoading = false,
}: DashboardCardProps) {
  if (isLoading) {
    return (
      <Card className='rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-20' />
              <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='h-10 w-10 rounded-lg' />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1 space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <div className='text-2xl font-bold'>{value}</div>
            <div className='flex items-center justify-between'>
              <p className='text-xs text-muted-foreground'>{description}</p>
            </div>
          </div>
          <div className='ml-4 rounded-lg bg-primary/10 p-2 text-primary'>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WithdrawalsContent() {
  const {
    data: vault,
    isLoading: isVaultLoading,
    error: vaultError,
    refetch: refetchVault,
  } = useVault();

  // Handle critical errors that prevent the entire page from loading
  if (vaultError && !isVaultLoading) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Withdrawals</h1>
          <p className='text-muted-foreground'>
            Manage your withdrawal requests and track your vault balance
          </p>
        </div>

        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>Failed to load vault data. Please try again.</span>
            <Button variant='outline' size='sm' onClick={() => refetchVault()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Earnings',
      value: formatCurrency(vault?.total_earnings ?? 0),
      description: 'Total earnings from your investments',
      icon: <PiggyBank className='h-10 w-10' />,
      isLoading: isVaultLoading,
    },
    {
      title: 'Vault Balance',
      value: formatCurrency(vault?.total_amount_in_vault ?? 0),
      description: 'Available for withdrawal from the vault',
      icon: <Wallet className='h-10 w-10' />,
      isLoading: isVaultLoading,
    },
    {
      title: 'Total Withdrawn',
      value: formatCurrency(vault?.total_withdrawn ?? 0),
      description: 'Total amount withdrawn up to date',
      icon: <TrendingDown className='h-10 w-10' />,
      isLoading: isVaultLoading,
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Withdrawals</h1>
        <p className='text-muted-foreground'>
          Manage your withdrawal requests and track your vault balance
        </p>
      </div>

      {/* Vault Balance Cards */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {cards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            isLoading={card.isLoading}
          />
        ))}
      </div>

      {/* Withdrawal Requests Section */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Withdrawal Requests
            </h2>
            <p className='text-muted-foreground'>
              View your withdrawal requests
            </p>
          </div>
          <FeatureLock featureName='withdrawals'>
            <CreateWithdrawalDialog
              vaultBalance={vault?.total_amount_in_vault ?? 0}
            />
          </FeatureLock>
        </div>

        <WithdrawalsTable />
      </div>
    </div>
  );
}
