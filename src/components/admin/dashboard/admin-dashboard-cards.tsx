'use client';

import { Building2, CheckCircle2, DollarSign, Users, Wallet } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

interface AdminDashboardStats {
  totalUsers: number;
  approvedUsers: number;
  totalDeployed: number;
  totalVaultBalance: number;
  totalReferrals: number;
  uniqueReferredUsers: number;
}

interface AdminDashboardCardsProps {
  stats?: AdminDashboardStats;
  isLoading: boolean;
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
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
            <p className='text-xs text-muted-foreground'>{description}</p>
          </div>
          <div className='ml-4 rounded-lg bg-primary/10 p-2 text-primary'>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardCards({
  stats,
  isLoading,
}: AdminDashboardCardsProps) {
  const cards = [
    {
      title: 'Signed Up Users',
      value: stats?.totalUsers ?? 0,
      description: 'Total registered users',
      icon: <Users className='h-10 w-10' />,
      isLoading,
    },
    {
      title: 'Approved Users',
      value: stats?.approvedUsers ?? 0,
      description: 'Users with approved applications',
      icon: <CheckCircle2 className='h-10 w-10' />,
      isLoading,
    },
    {
      title: 'Amount Deployed',
      value: formatCurrency(stats?.totalDeployed ?? 0),
      description: 'Total invested in properties',
      icon: <Building2 className='h-10 w-10' />,
      isLoading,
    },
    {
      title: 'Amount in Vault',
      value: formatCurrency(stats?.totalVaultBalance ?? 0),
      description: 'Total balance across all vaults',
      icon: <Wallet className='h-10 w-10' />,
      isLoading,
    },
    {
      title: 'Total Referred Users',
      value: stats
        ? `${stats.uniqueReferredUsers} unique / ${stats.totalReferrals} total`
        : '0 unique / 0 total',
      description: 'Unique referred users and total referrals',
      icon: <DollarSign className='h-10 w-10' />,
      isLoading,
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

