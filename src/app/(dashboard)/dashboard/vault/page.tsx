import { Metadata } from 'next';

import { VaultContent } from '@/components/dashboard/vault/vault-content';

export const metadata: Metadata = {
  title: 'My Vault',
  description: 'Manage your vault balance and deploy funds to properties',
};

export default function VaultPage() {
  return <VaultContent />;
}
