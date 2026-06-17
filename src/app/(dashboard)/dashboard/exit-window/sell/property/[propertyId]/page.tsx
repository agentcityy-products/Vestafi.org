import { Metadata } from 'next';

import { SellPropertyFlow } from '@/components/dashboard/exit-window/sell-property-flow';

export const metadata: Metadata = {
  title: 'Exit Window: List stake',
  description: 'List your stake for sale during the exit window',
};

export default async function ExitWindowSellPropertyPage(props: {
  params: Promise<{ propertyId: string }>;
}) {
  const params = await props.params;

  return (
    <div className='container mx-auto max-w-2xl py-6'>
      <SellPropertyFlow propertyId={params.propertyId} />
    </div>
  );
}
