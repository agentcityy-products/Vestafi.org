'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useLoggedInUser } from '@/hooks/queries/profile';

import {
  rentalPropertyFormSchema,
  type RentalPropertyFormValues,
} from '@/schema/rental-property';
import { submitRentalProperty } from '@/actions/rental-properties';

import { BasicInfoForm } from '@/components/properties/form/basic-info-form';
import { ImagesForm } from '@/components/properties/form/images-form';
import { RentalLocationForm } from '@/components/rental-properties/form/rental-location-form';
import { RentalPricingForm } from '@/components/rental-properties/form/rental-pricing-form';
import { RentalVerificationForm } from '@/components/rental-properties/form/rental-verification-form';
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
import {
  deleteFilesFromSupabase,
  getPathFromURL,
  uploadToSupabase,
} from '@/utils/supabase-bucket';

import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

import type { PropertyRow } from '@/types/dao';

interface RentalPropertyFormProps {
  property?: PropertyRow | null;
  id?: string | null;
  onSuccess?: () => void;
}

// Helper to check if a string is a base64 data URL
function isBase64DataUrl(str: string): boolean {
  return str.startsWith('data:image/');
}

// Helper to check if a string is a URL (already uploaded)
function isUrl(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://');
}

export function RentalPropertyForm({
  property,
  id,
  onSuccess,
}: RentalPropertyFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: user } = useLoggedInUser();
  const submitRentalPropertyAction = useAction(submitRentalProperty, {
    onSuccess: () => {
      toast.success(
        'Rental property submitted successfully! It will be reviewed by our team.',
      );
      qc.invalidateQueries({ queryKey: [QueryKeys.RENTAL_PROPERTIES] });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(paths.rentalProperties.list);
      }
    },
    onError,
  });

  const form = useForm<RentalPropertyFormValues>({
    resolver: zodResolver(rentalPropertyFormSchema),
    defaultValues: property
      ? {
          id: property.id,
          title: property.title,
          description: property.description,
          price: property.price,
          price_usd: property.price_usd ?? property.price,
          address_line_1: property.address_line_1,
          address_line_2: property.address_line_2,
          city: property.city,
          country: property.country,
          images: property.images,
        }
      : {
          images: [],
          owns_or_authorized: false,
          agrees_to_review: false,
          ownership_proof: [],
        },
  });

  async function onSubmit(values: RentalPropertyFormValues) {
    if (!user?.id) {
      toast.error('Please login to submit a property');
      return;
    }

    const propertyId = id || crypto.randomUUID();

    try {
      // Separate base64 images (new) from URLs (already uploaded)
      const base64Images = values.images.filter(isBase64DataUrl);
      const existingUrls = values.images.filter(isUrl);

      // Handle deletion of removed images (only for existing properties)
      if (property?.images && property.images.length > 0) {
        const imagesToDelete = property.images.filter(
          (initialUrl) => !values.images.includes(initialUrl),
        );

        if (imagesToDelete.length > 0) {
          // Extract file paths from URLs and delete from Supabase
          const filePaths = getPathFromURL(imagesToDelete, 'property-images');
          // Only delete files that belong to the current user
          const userFilesToDelete = filePaths.filter((path) =>
            path.startsWith(`${user.id}/`),
          );

          if (userFilesToDelete.length > 0) {
            await deleteFilesFromSupabase(
              userFilesToDelete.map((path) => ({
                path,
                bucket: 'property-images',
              })),
            );
          }
        }
      }

      // Upload new base64 images directly to Supabase from client
      // This bypasses Vercel's 4.5MB limit by uploading directly to Supabase
      const uploadedUrls: string[] = [];

      if (base64Images.length > 0) {
        toast.loading(`Uploading ${base64Images.length} image(s)...`, {
          id: 'upload-images',
        });

        for (const base64Image of base64Images) {
          try {
            // Parse base64 data
            const base64Data = base64Image.split(',')[1];
            const mimeTypeMatch = base64Image.match(/data:([^;]+);base64/);
            if (!mimeTypeMatch) {
              continue;
            }
            const mimeType = mimeTypeMatch[1];
            const fileExtension = mimeType.split('/')[1] || 'png';

            // Convert base64 to Blob
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            for (let i = 0; i < byteCharacters.length; i++) {
              byteArrays.push(byteCharacters.charCodeAt(i));
            }
            const blob = new Blob([new Uint8Array(byteArrays)], {
              type: mimeType,
            });

            // Build file path: {userId}/{propertyId}/filename
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const filePath = `${user.id}/${propertyId}/${fileName}`;

            // Upload directly to Supabase from client (bypasses Vercel limits)
            const { url, error } = await uploadToSupabase(
              blob,
              filePath,
              'property-images',
              mimeType,
            );

            if (error) {
              throw new Error(`Failed to upload image: ${error.message}`);
            }

            if (url) {
              uploadedUrls.push(url);
            }
          } catch (error) {
            toast.error('Failed to upload images', {
              description:
                error instanceof Error ? error.message : 'Unknown error',
            });
            toast.dismiss('upload-images');
            return;
          }
        }

        toast.dismiss('upload-images');
        toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
      }

      // Combine existing URLs with newly uploaded URLs
      const allImageUrls = [...existingUrls, ...uploadedUrls];

      // Submit property with all image URLs
      submitRentalPropertyAction.execute({
        ...values,
        id: propertyId,
        images: allImageUrls,
      });
    } catch (error) {
      toast.error('Failed to submit property', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return (
    <Card className='mx-auto max-w-4xl'>
      <CardHeader>
        <CardTitle>Submit Rental Property</CardTitle>
        <CardDescription>
          Fill in the details to submit your rental property for review. Once
          approved, it will be visible on the public apartments page.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <BasicInfoForm showFirstTimeInvestors={false} />
            <RentalPricingForm />
            <RentalLocationForm />
            <ImagesForm />
            <RentalVerificationForm />
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                if (onSuccess) {
                  onSuccess();
                } else {
                  router.back();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              isLoading={
                form.formState.isSubmitting ||
                submitRentalPropertyAction.isExecuting
              }
            >
              Submit for Review
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
