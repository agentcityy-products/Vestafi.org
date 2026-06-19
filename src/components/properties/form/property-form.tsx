'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { propertyFormSchema, type PropertyFormValues } from '@/schema/property';
import { upsertProperty } from '@/actions/properties';

import { BasicInfoForm } from '@/components/properties/form/basic-info-form';
import { ImagesForm } from '@/components/properties/form/images-form';
import { LocationForm } from '@/components/properties/form/location-form';
import { PricingForm } from '@/components/properties/form/pricing-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';

import { onError } from '@/lib/show-error-toast';

import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';
import { uploadPropertyImages } from '@/controller/property/images';

import type { PropertyRow } from '@/types/dao';

interface PropertyFormProps {
  property?: PropertyRow | null;
  id?: string | null;
}

export function PropertyForm({ property, id }: PropertyFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const upsertPropertyAction = useAction(upsertProperty, {
    onSuccess: () => {
      toast.success(`Property ${id ? 'updated' : 'created'} successfully`);
      qc.invalidateQueries({ queryKey: [QueryKeys.PROPERTIES] });
      router.push(paths.admin.properties.list);
    },
    onError,
  });

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property
      ? {
          id: property.id,
          title: property.title,
          description: property.description,
          price: property.price,
          minimum_monthly_rent: property.minimum_monthly_rent ?? undefined,
          maximum_monthly_rent: property.maximum_monthly_rent ?? undefined,
          address_line_1: property.address_line_1,
          address_line_2: property.address_line_2 ?? undefined,
          city: property.city,
          state: property.state ?? '',
          zip_code: property.zip_code ?? '',
          country: property.country,
          images: property.images,
          allow_first_time_investors: property.allow_first_time_investors,
          opportunity_type:
            property.opportunity_type === 'prime' ||
            property.opportunity_type === 'live' ||
            property.opportunity_type === 'fractional'
              ? property.opportunity_type
              : 'fractional',
        }
      : {
          opportunity_type: 'fractional',
          allow_first_time_investors: false,
          images: [],
        },
  });

  async function onSubmit(values: PropertyFormValues) {
    const propertyId = id || crypto.randomUUID();
    const images = await uploadPropertyImages(
      propertyId,
      values.images,
      property?.images ?? [],
    );
    upsertPropertyAction.execute({ ...values, id: propertyId, images });
  }

  return (
    <Card className='mx-auto max-w-4xl'>
      <CardHeader>
        <CardTitle>{id ? 'Edit Property' : 'Add New Property'}</CardTitle>
        <CardDescription>
          {id
            ? 'Update the details of your property listing.'
            : 'Fill in the details to create a new property listing.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <BasicInfoForm />
            <PricingForm />
            <LocationForm />
            <ImagesForm />
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/admin/properties')}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              isLoading={
                form.formState.isSubmitting || upsertPropertyAction.isExecuting
              }
            >
              {id ? 'Update Property' : 'Add Property'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// const defaultProperties: PropertyFormValues[] = [
//   {
//     title: 'Luxury Villa',
//     description:
//       'A beautiful luxury villa with modern amenities and stunning views. Features include a private pool, gourmet kitchen, and spacious living areas.',
//     price: 750000,
//     minimum_monthly_rent: 3000,
//     maximum_monthly_rent: 4500,
//     address_line_1: '123 Ocean Drive',
//     address_line_2: 'Suite 100',
//     city: 'Miami Beach',
//     state: 'FL',
//     zip_code: '33139',
//     country: 'United States',
//     images: [],
//   },
//   {
//     title: 'Downtown Loft',
//     description:
//       'Contemporary loft in the heart of downtown. Exposed brick walls, high ceilings, and industrial design elements. Perfect for urban living.',
//     price: 450000,
//     minimum_monthly_rent: 1800,
//     maximum_monthly_rent: 2500,
//     address_line_1: '456 Main Street',
//     address_line_2: 'Apt 4B',
//     city: 'San Francisco',
//     state: 'CA',
//     zip_code: '94105',
//     country: 'United States',
//     images: [],
//   },
//   {
//     title: 'Mountain View Estate',
//     description:
//       'Spacious estate with panoramic mountain views. Features include a wine cellar, home theater, and extensive outdoor living spaces.',
//     price: 1200000,
//     minimum_monthly_rent: 5000,
//     maximum_monthly_rent: 7000,
//     address_line_1: '789 Summit Road',
//     address_line_2: null,
//     city: 'Denver',
//     state: 'CO',
//     zip_code: '80202',
//     country: 'United States',
//     images: [],
//   },
// ];

// export function getRandomDefaultProperty(): PropertyFormValues {
//   const randomIndex = Math.floor(Math.random() * defaultProperties.length);
//   return defaultProperties[randomIndex];
// }
