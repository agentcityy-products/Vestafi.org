'use client';

import {
  Building2,
  DollarSign,
  Home,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/number-functions';

import { OwnedPropertiesViewRow } from '@/types/dao';

interface DashboardCardsProps {
  ownedProperties?: OwnedPropertiesViewRow[];
  isOwnedPropertiesLoading: boolean;
  approvedRentalPropertiesCount?: number;
  isApprovedRentalPropertiesLoading: boolean;
  approvedWithdrawalsTotal?: number;
  isApprovedWithdrawalsLoading: boolean;
  rentalIncomeBalance?: number;
  isRentalIncomeBalanceLoading: boolean;
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
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
              {trend && (
                <div
                  className={cn(
                    'flex items-center text-xs',
                    trend.isPositive ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className='mr-1 h-3 w-3' />
                  ) : (
                    <TrendingDown className='mr-1 h-3 w-3' />
                  )}
                  {trend.value}
                </div>
              )}
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

export function DashboardCards({
  ownedProperties,
  isOwnedPropertiesLoading,
  approvedRentalPropertiesCount,
  isApprovedRentalPropertiesLoading,
  approvedWithdrawalsTotal,
  isApprovedWithdrawalsLoading,
  rentalIncomeBalance,
  isRentalIncomeBalanceLoading,
}: DashboardCardsProps) {
  // Calculate metrics from owned properties
  const totalInvested =
    ownedProperties?.reduce(
      (acc, curr) => acc + (curr.successful_investment ?? 0),
      0,
    ) ?? 0;

  const cards = [
    {
      title: 'Apartments Owned',
      value: ownedProperties?.length ?? 0,
      description: 'Apartments in your ownership portfolio',
      icon: <Building2 className='h-10 w-10' />,
      isLoading: isOwnedPropertiesLoading,
    },
    {
      title: 'Ownership Value',
      value: formatCurrency(totalInvested),
      description: 'Your total active ownership position',
      icon: <DollarSign className='h-10 w-10' />,
      isLoading: isOwnedPropertiesLoading,
    },
    {
      title: 'Distribution Balance',
      value: formatCurrency(rentalIncomeBalance ?? 0),
      description: 'Available apartment distributions',
      icon: <TrendingUp className='h-10 w-10' />,
      isLoading: isRentalIncomeBalanceLoading,
    },
    {
      title: 'Guest Apartments Listed',
      value: approvedRentalPropertiesCount ?? 0,
      description: 'Approved rental properties you have submitted',
      icon: <Home className='h-10 w-10' />,
      isLoading: isApprovedRentalPropertiesLoading,
    },
    {
      title: 'Distributions Received',
      value: formatCurrency(approvedWithdrawalsTotal ?? 0),
      description: 'Total distributions moved from your account',
      icon: <Wallet className='h-10 w-10' />,
      isLoading: isApprovedWithdrawalsLoading,
    },
  ];

  return (
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
  );
}
