import { Metadata } from 'next';

import { AdminMembershipActivationsTable } from '@/components/admin/memberships/admin-membership-activations-table';

export const metadata: Metadata = {
  title: 'Membership Activations',
  description: 'Manage membership activation requests',
};

export default function AdminMembershipsPage() {
  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Membership Activations
        </h1>
        <p className='text-muted-foreground'>
          Review and manage membership activation requests
        </p>
      </div>

      <AdminMembershipActivationsTable />
    </div>
  );
}

