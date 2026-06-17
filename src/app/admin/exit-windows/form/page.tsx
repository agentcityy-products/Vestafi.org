import { Metadata } from 'next';

import { ExitWindowForm } from '@/components/admin/exit-windows/exit-window-form';

export const metadata: Metadata = {
  title: 'Exit Window',
  description: 'Create or edit exit window; set property exit prices',
};

type Props = {
  searchParams: Promise<{ id?: string; prices?: string }>;
};

export default async function ExitWindowFormPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id ?? undefined;
  const focusPrices = params.prices === '1';

  return (
    <div className='container mx-auto max-w-3xl'>
      <ExitWindowForm windowId={id} focusPrices={focusPrices} />
    </div>
  );
}
