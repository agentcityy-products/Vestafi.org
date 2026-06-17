import { Metadata } from 'next';

import { PendingInvestmentsTable } from '@/components/admin/pending-investments/pending-investments-table';

export const metadata: Metadata = {
  title: 'Investments',
  description: 'Review and manage property investments',
};

export default function PendingInvestmentsPage() {
  return (
    <div className='container mx-auto'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Investments</h1>
          <p className='text-muted-foreground'>
            Review and approve property investments submitted by users
          </p>
        </div>

        <PendingInvestmentsTable />
      </div>
    </div>
  );
}
