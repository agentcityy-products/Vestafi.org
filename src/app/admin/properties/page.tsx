import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { getProperties } from '@/actions/properties';

import { InviteUserDialog } from '@/components/admin/invite-user/invite-user-dialog';
import { PropertyTable } from '@/components/properties/table/admin-property-table';
import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Manage your property listings from here.',
};

export default async function PropertiesPage() {
  const properties = await getProperties();
  return (
    <div className='container mx-auto'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Properties</h1>
          <p className='text-muted-foreground'>
            Manage your property listings from here.
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href={paths.admin.properties.form()}>
            <Button icon={Plus}>Add Property</Button>
          </Link>
          <InviteUserDialog />
        </div>
      </div>

      <PropertyTable properties={properties.data} />
    </div>
  );
}
