import { notFound } from 'next/navigation';

import { checkMembershipAccess } from '@/actions/membership';

import { BuyPropertyFlow } from '@/components/dashboard/exit-window/buy-property-flow';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { ListingsViewRow } from '@/types/dao';

export default async function ExitWindowBuyPropertyPage(props: {
  params: Promise<{ propertyId: string }>;
}) {
  const params = await props.params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasAccess = user ? await checkMembershipAccess(user.id) : false;

  const { data: property, error } = await supabase
    .from('listings_view')
    .select('*')
    .eq('id', params.propertyId)
    .maybeSingle();

  if (error || !property?.id) {
    notFound();
  }

  return (
    <div className='container mx-auto max-w-2xl space-y-6 py-6'>
      <BuyPropertyFlow
        property={property as ListingsViewRow}
        hasAccess={hasAccess}
      />
    </div>
  );
}
