'use client';

import { Trash, Upload } from 'lucide-react';
import Image from 'next/image';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import type { PropertyFormValues } from '@/schema/property';
import type { RentalPropertyFormValues } from '@/schema/rental-property';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export function ImagesForm() {
  const form = useFormContext<PropertyFormValues | RentalPropertyFormValues>();
  const images = form.watch('images');

  // Check if this is a rental property form (has price_usd field)
  const isRentalProperty = 'price_usd' in form.getValues();
  const minImages = isRentalProperty ? 4 : 1;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const currentImages = form.getValues('images') || [];

      // Validate file sizes (max 5MB per file)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large. Maximum size is 5MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Convert valid files to base64 for preview (will be uploaded on submit)
      const newImageUrls = await Promise.all(
        validFiles.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          });
        }),
      );

      form.setValue('images', [...currentImages, ...newImageUrls]);
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
  });

  function removeImage(index: number) {
    const currentImages = form.getValues('images');
    if (currentImages.length > minImages) {
      const newImages = [...currentImages];
      newImages.splice(index, 1);
      form.setValue('images', newImages);
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium'>Images</h3>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
        )}
      >
        <input {...getInputProps()} />
        <div className='flex flex-col items-center gap-2'>
          <Upload className='h-8 w-8 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            {isDragActive
              ? 'Drop the images here...'
              : 'Drag & drop images here, or click to select files'}
          </p>
          <p className='text-xs text-muted-foreground'>
            Supports: JPEG, JPG, PNG, WEBP (Max 5MB per file)
          </p>
        </div>
      </div>

      {images?.length > 0 && (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
          {images.map((image, index) => (
            <div key={index} className='group relative'>
              <Image
                src={image}
                alt={`Property image ${index + 1}`}
                className='aspect-square w-full rounded-lg object-cover'
                width={300}
                height={300}
              />
              {images.length > 1 && (
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100'
                  onClick={() => removeImage(index)}
                >
                  <Trash className='h-4 w-4' />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className='text-sm text-muted-foreground'>
        Make sure the images include: Bedroom, Bathroom, Living Room, Exterior /
        Balcony / Compound
      </p>

      {!images?.length && (
        <p className='text-sm text-muted-foreground'>
          Add images for your property. At least {minImages} image
          {minImages > 1 ? 's are' : ' is'} required.
        </p>
      )}
      {images?.length > 0 && images.length < minImages && (
        <p className='text-sm text-destructive'>
          Please add at least {minImages - images.length} more image
          {minImages - images.length > 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}
