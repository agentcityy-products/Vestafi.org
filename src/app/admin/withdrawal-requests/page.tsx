import { Metadata } from 'next';

import { AdminWithdrawalRequestsTable } from '@/components/admin/withdrawal-requests/admin-withdrawal-requests-table';

export const metadata: Metadata = {
  title: 'Withdrawal Requests',
  description: 'Manage investor withdrawal requests and process payments.',
};

export default function AdminWithdrawalRequestsPage() {
  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Withdrawal Requests
        </h1>
        <p className='text-muted-foreground'>
          Manage investor withdrawal requests and process payments
        </p>
      </div>

      <AdminWithdrawalRequestsTable />
    </div>
  );
}
