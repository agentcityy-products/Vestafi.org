import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getTotalInvested } from '@/actions/investment';
import { getListingById } from '@/actions/listing';

import { PropertyDetailsContainer } from '@/components/listings/property-details-container';
import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';
import { isListingAccessible } from '@/controller/listing/listing-access';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  try {
    const result = await getListingById({ id: (await params).id });

    if (!result?.data) {
      return {
        title: 'Property Not Found',
        description: 'The requested property could not be found.',
      };
    }

    const property = result.data;
    const title = property.title || 'Investment Property';
    const description =
      property.description || 'Investment opportunity in real estate';

    const fullAddress = [
      property.address_line_1,
      property.city,
      property.state,
      property.country,
    ]
      .filter(Boolean)
      .join(', ');

    return {
      title,
      description: `${description.substring(0, 160)}...`,
      keywords: [
        fullAddress!,
        property.city!,
        property.state!,
        property.country!,
      ].filter(Boolean),
    };
  } catch {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
    };
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  let property;
  const id = (await params).id;
  try {
    const result = await getListingById({ id });
    const totalInvested = await getTotalInvested();
    if (!result?.data || !isListingAccessible(result.data, totalInvested))
      notFound();
    property = result.data;
  } catch (error) {
    console.error('Error fetching property:', error);
  }

  if (!property) notFound();

  return (
    <div className='space-y-6'>
      {/* Back Navigation */}
      <div className='flex items-center gap-4'>
        <Link href={paths.listings.list} className='flex items-center gap-2'>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4' />
            Back to Properties
          </Button>
        </Link>
      </div>

      {/* Property Details Content */}
      <PropertyDetailsContainer initialProperty={property} />
    </div>
  );
}
