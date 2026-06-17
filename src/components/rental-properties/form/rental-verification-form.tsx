'use client';

import { FileText, Upload } from 'lucide-react';
import { Info } from 'lucide-react';
import { useCallback,useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { useLoggedInUser } from '@/hooks/queries/profile';

import type { RentalPropertyFormValues } from '@/schema/rental-property';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { uploadToSupabase } from '@/utils/supabase-bucket';

export function RentalVerificationForm() {
  const form = useFormContext<RentalPropertyFormValues>();
  const { data: user } = useLoggedInUser();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin';

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user?.id) {
        toast.error('Please login to upload files');
        return;
      }

      setUploading(true);
      try {
        const uploadPromises = acceptedFiles.map((file) => {
          const fileName = `${user.id}/ownership-proof/${Date.now()}-${file.name}`;
          return uploadToSupabase(file, fileName, 'property-images');
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results
          .filter((result) => result.url !== null)
          .map((result) => result.url!);

        if (successfulUploads.length > 0) {
          const newFiles = [...uploadedFiles, ...successfulUploads];
          setUploadedFiles(newFiles);
          form.setValue('ownership_proof', newFiles);
          toast.success(
            `Successfully uploaded ${successfulUploads.length} file(s)`,
          );
        }

        const failedUploads = results.filter((result) => result.error !== null);
        if (failedUploads.length > 0) {
          toast.error(
            `Failed to upload ${failedUploads.length} file(s). Please try again.`,
          );
        }
      } catch (error) {
        toast.error('Failed to upload files', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setUploading(false);
      }
    },
    [user?.id, uploadedFiles, form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 5,
    disabled: uploading,
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue('ownership_proof', newFiles);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification & Authorization</CardTitle>
        <CardDescription>
          Please confirm your authorization and agree to our review process
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Required Checkboxes */}
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='owns_or_authorized'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='cursor-pointer'>
                    I own or am authorized to manage this apartment
                  </FormLabel>
                  <FormDescription>
                    You must be the owner or have legal authority to manage this
                    property.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='agrees_to_review'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel className='cursor-pointer'>
                    I agree to Zenolius/Vestafi review and verification
                  </FormLabel>
                  <FormDescription>
                    Your property will be reviewed by our team before being
                    listed.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Optional Proof Upload */}
        <div className='space-y-4'>
          <div>
            <FormLabel>Proof of Ownership / Authority (Optional)</FormLabel>
            <FormDescription className='mt-1'>
              Upload documents proving ownership or authorization to manage this
              property (e.g., title deed, management agreement, authorization
              letter). These documents will only be visible to administrators.
            </FormDescription>
            {isAdmin && (
              <Alert className='mt-2'>
                <Info className='h-4 w-4' />
                <AlertDescription>
                  As an admin, you can view uploaded ownership proof documents
                  in the property details.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <FormField
            control={form.control}
            name='ownership_proof'
            render={() => (
              <FormItem>
                <FormControl>
                  <div
                    {...getRootProps()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    } ${uploading ? 'opacity-50' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <Upload className='mb-4 h-10 w-10 text-muted-foreground' />
                    <p className='mb-2 text-sm font-medium'>
                      {isDragActive
                        ? 'Drop files here'
                        : 'Drag & drop files here, or click to select'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      PNG, JPG, WEBP up to 5 files
                    </p>
                    {uploading && (
                      <p className='mt-2 text-xs text-muted-foreground'>
                        Uploading...
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Uploaded Files:</p>
              <div className='space-y-2'>
                {uploadedFiles.map((url, index) => {
                  const fileName = url.split('/').pop() || `File ${index + 1}`;
                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-md border p-2'
                    >
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{fileName}</span>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
