import { Metadata } from 'next';

import { getProperty } from '@/actions/properties';

import { PropertyForm } from '@/components/properties/form/property-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { paths } from '@/constants/paths';

interface PropertyFormPageProps {
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PropertyFormPageProps): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) {
    return {
      title: 'Add Property',
      description: 'Add a new property to the database.',
    };
  } else {
    return {
      title: 'Edit Property',
      description: 'Edit an existing property in the database.',
    };
  }
}

export default async function PropertyFormPage({
  searchParams,
}: PropertyFormPageProps) {
  const { id } = await searchParams;
  const property = id ? await getProperty(id) : null;

  return (
    <div className='container mx-auto space-y-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={paths.admin.properties.list}>
              Properties
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {property ? property.title : 'Add Property'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PropertyForm property={property} id={id} />
    </div>
  );
}
