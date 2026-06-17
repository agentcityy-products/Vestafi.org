import { Metadata } from 'next';

import { ExitWindowSellContent } from '@/components/dashboard/exit-window/exit-window-sell-content';

export const metadata: Metadata = {
  title: 'Exit Window: Sell properties',
  description: 'Sell your stakes or manage your sell orders',
};

export default function ExitWindowSellPage() {
  return (
    <div className='container mx-auto max-w-2xl py-6'>
      <ExitWindowSellContent />
    </div>
  );
}
