import { Metadata } from 'next';

import { AdminVaultTransactionsTable } from '@/components/admin/vault/admin-vault-transactions-table';

export const metadata: Metadata = {
  title: 'Vault Transactions',
  description: 'Manage vault deposits, deployments, and transactions',
};

export default function AdminVaultPage() {
  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Vault Transactions
        </h1>
        <p className='text-muted-foreground'>
          Review and manage vault deposits, deployments, and transactions
        </p>
      </div>

      <AdminVaultTransactionsTable />
    </div>
  );
}
