import { Metadata } from 'next';

import { AdminDashboardContent } from '@/components/admin/dashboard/admin-dashboard-content';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Overview of platform statistics and metrics',
};

export default function AdminDashboardPage() {
  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>
        <p className='text-muted-foreground'>
          Overview of platform statistics and metrics
        </p>
      </div>

      <AdminDashboardContent />
    </div>
  );
}

