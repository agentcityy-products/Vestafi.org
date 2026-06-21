import { Metadata } from 'next';

import { MyOwnershipContent } from '@/components/dashboard/my-ownership-content';

export const metadata: Metadata = {
  title: 'My Ownerships',
  description: 'Track your Vestafi apartment ownership and performance.',
};

export default function OwnershipPage() {
  return <MyOwnershipContent />;
}
