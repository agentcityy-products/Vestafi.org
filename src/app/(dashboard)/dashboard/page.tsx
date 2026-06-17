import { Metadata } from 'next';

import { DashboardContent } from '@/components/dashboard/dashboard-content';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Track your real estate investments, returns, and portfolio performance in one place.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
