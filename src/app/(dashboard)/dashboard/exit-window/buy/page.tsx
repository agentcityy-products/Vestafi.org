import { Metadata } from 'next';

import { ExitWindowBuyContent } from '@/components/dashboard/exit-window/exit-window-buy-content';

export const metadata: Metadata = {
  title: 'Exit Window: Buy Stakes',
  description: 'Buy stakes from other members during the exit window',
};

export default function ExitWindowBuyPage() {
  return (
    <div className='container mx-auto max-w-2xl py-6'>
      <ExitWindowBuyContent />
    </div>
  );
}
