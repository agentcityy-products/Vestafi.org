import { Metadata } from 'next';

import { VaultContent } from '@/components/dashboard/vault/vault-content';

export const metadata: Metadata = {
  title: 'Vestafi Vault',
  description: 'Manage your Vestafi Vault balance and fund ownership',
};

export default function VaultPage() {
  return <VaultContent />;
}
