import { toast } from 'sonner';

import Logger from '@/utils/logger';
import {
  deleteFilesFromSupabase,
  uploadToSupabase,
} from '@/utils/supabase-bucket';

/**
 * This function is used to upload property images to supabase storage.
 * It also deletes the images that are not present in the new images array.
 */
export const uploadPropertyImages = async (
  id: string,
  newImages: string[],
  initialImages: string[],
): Promise<string[]> => {
  const newImagesToUpload = newImages.filter(
    (image) => !initialImages.includes(image),
  );

  const retainedImages = initialImages.filter((image) =>
    newImages.includes(image),
  );

  const imagesToDelete = initialImages.filter(
    (image) => !newImages.includes(image),
  );

  //   upload new images to supabase storage
  const uploadedImages = await Promise.all(
    newImagesToUpload.map(async (image) => {
      // Convert base64 to blob with correct MIME type
      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      const blob = new Blob([new Uint8Array(byteArrays)], { type: mimeType });

      const { url, error } = await uploadToSupabase(
        blob,
        `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${mimeType.split('/')[1]}`,
        'property-images',
      );
      if (error) return { error, url: null } as const;
      return { error: null, url } as const;
    }),
  );
  uploadedImages.forEach((image) => {
    if (image.error) Logger.error(image.error);
  });
  if (uploadedImages.some((image) => image.error))
    toast.error(`Error uploading ${uploadedImages.length} images`);

  const uploadedImageUrls = uploadedImages
    .map((image) => image.url)
    .filter(Boolean) as string[];

  //   delete images from supabase storage
  const { errors } = await deleteFilesFromSupabase(
    imagesToDelete.map((path) => ({
      path,
      bucket: 'property-images',
    })),
  );
  errors.forEach((error) => {
    if (error) Logger.error(error);
  });

  //   return updated images
  return [...retainedImages, ...uploadedImageUrls];
};
