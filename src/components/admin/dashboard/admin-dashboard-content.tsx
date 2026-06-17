'use client';

import { AlertCircle } from 'lucide-react';

import { useAdminDashboardStats } from '@/hooks/queries/admin-dashboard';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { AdminDashboardCards } from './admin-dashboard-cards';

export function AdminDashboardContent() {
  const { data: stats, isLoading, error } = useAdminDashboardStats();

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard statistics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return <AdminDashboardCards stats={stats} isLoading={isLoading} />;
}

