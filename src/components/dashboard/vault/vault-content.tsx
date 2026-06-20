'use client';

import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

import { useVaultBalance, useVaultTransactions } from '@/hooks/queries/vault';

import { FeatureLock } from '@/components/common/feature-lock';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

import { CreateDepositDialog } from './create-deposit-dialog';
import { CreateWithdrawalDialog } from './create-withdrawal-dialog';
import { VaultTransactionsTable } from './vault-transactions-table';

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

export function VaultContent() {
  const {
    data: vaultBalance,
    isLoading: isBalanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useVaultBalance();

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useVaultTransactions();

  // Handle critical errors
  if (balanceError && !isBalanceLoading) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Vestafi Vault</h1>
          <p className='text-muted-foreground'>
            Manage your Vestafi Vault balance and fund ownership
          </p>
        </div>

        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>Failed to load vault data. Please try again.</span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => refetchBalance()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const balance = vaultBalance?.balance ?? 0;
  const totalDeposited = vaultBalance?.total_deposited ?? 0;
  const totalDeployed = vaultBalance?.total_deployed ?? 0;

  const cards = [
    {
      title: 'Vestafi Vault Balance',
      value: formatCurrency(balance),
      description: 'Available funds ready to deploy',
      icon: <Wallet className='h-10 w-10' />,
      isLoading: isBalanceLoading,
    },
    {
      title: 'Total Deposited',
      value: formatCurrency(totalDeposited),
      description: 'Total amount deposited to vault',
      icon: <ArrowDownCircle className='h-10 w-10' />,
      isLoading: isBalanceLoading,
    },
    {
      title: 'Total Deployed',
      value: formatCurrency(totalDeployed),
      description: 'Total amount deployed to properties',
      icon: <ArrowUpCircle className='h-10 w-10' />,
      isLoading: isBalanceLoading,
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Vestafi Vault</h1>
        <p className='text-muted-foreground'>
          Manage your Vestafi Vault balance and fund ownership
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

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-4'>
        <CreateDepositDialog />
        <FeatureLock featureName='withdrawals'>
          <CreateWithdrawalDialog />
        </FeatureLock>
        <Link href={paths.listings.list}>
          <Button variant='outline'>
            <ArrowUpCircle className='h-4 w-4' />
            Deploy to Property
          </Button>
        </Link>
      </div>

      {/* Transactions Section */}
      <div className='space-y-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Transaction History
          </h2>
          <p className='text-muted-foreground'>
            View all your vault transactions
          </p>
        </div>

        {transactionsError && !isTransactionsLoading ? (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription className='flex items-center justify-between'>
              <span>Failed to load transactions. Please try again.</span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetchTransactions()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <VaultTransactionsTable
            transactions={transactions || []}
            isLoading={isTransactionsLoading}
          />
        )}
      </div>
    </div>
  );
}
