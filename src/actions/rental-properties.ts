'use server';

import { z } from 'zod';

import { rentalPropertyFormSchema } from '@/schema/rental-property';

import { authActionClient } from '@/lib/server/safe-action';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Logger from '@/utils/logger';

// Schema for getting rental properties (public, no auth required)
const getRentalPropertiesSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  city: z.union([z.string(), z.array(z.string())]).optional(),
  country: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

// Public action to get approved rental properties
export const getRentalProperties = async (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string | string[];
  country?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  const supabase = await createSupabaseServerClient();

  const validatedParams = getRentalPropertiesSchema.parse({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    search: params.search,
    city: params.city,
    country: params.country,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  });

  let query = supabase
    .from('property')
    .select('*', { count: 'exact' })
    .eq('property_type', 'rental')
    .eq('status', 'approved');

  // Apply search filter
  if (validatedParams.search?.trim()) {
    query = query.or(
      `title.ilike.%${validatedParams.search}%,description.ilike.%${validatedParams.search}%,city.ilike.%${validatedParams.search}%,country.ilike.%${validatedParams.search}%`,
    );
  }

  // Apply location filters
  if (validatedParams.city) {
    if (
      Array.isArray(validatedParams.city) &&
      validatedParams.city.length > 0
    ) {
      // Multi-select: use .or() with ilike for exact case-insensitive matching
      query = query.or(
        validatedParams.city.map((c) => `city.ilike.${c}`).join(','),
      );
    } else if (typeof validatedParams.city === 'string') {
      // Single value: use ilike for partial match
      query = query.ilike('city', `%${validatedParams.city}%`);
    }
  }
  if (validatedParams.country) {
    query = query.ilike('country', `%${validatedParams.country}%`);
  }

  // Apply price filters (price is now price_per_night)
  if (validatedParams.minPrice !== undefined) {
    query = query.gte('price', validatedParams.minPrice);
  }
  if (validatedParams.maxPrice !== undefined) {
    query = query.lte('price', validatedParams.maxPrice);
  }

  // Apply pagination and ordering
  const from = (validatedParams.page - 1) * validatedParams.pageSize;
  const to = from + validatedParams.pageSize - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order('listing_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return {
    data: data || [],
    totalCount: count || 0,
  };
};

// Action to submit a new rental property (authenticated users only)
export const submitRentalProperty = authActionClient
  .schema(rentalPropertyFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;

    const propertyId = parsedInput.id || crypto.randomUUID();

    // Prepare property data
    // For now, price_usd equals price (USH) as per requirements
    const priceUsd = parsedInput.price_usd ?? parsedInput.price;

    const propertyData = {
      id: propertyId,
      title: parsedInput.title,
      description: parsedInput.description,
      price: parsedInput.price, // This is now price_per_night in USH
      price_usd: priceUsd, // For now, equals USH price
      address_line_1: parsedInput.address_line_1,
      address_line_2: parsedInput.address_line_2 || null,
      city: parsedInput.city,
      state: null, // Hidden from form, set to null
      country: parsedInput.country,
      zip_code: null, // Hidden from form, set to null
      images: parsedInput.images,
      property_type: 'rental' as const,
      status: 'pending' as const,
      submitted_by: authUser.user.id,
      listing_date: new Date().toISOString(), // Set listing date when first submitted
      allow_first_time_investors: false, // Not applicable for rental properties
      ownership_proof: parsedInput.ownership_proof || null, // Optional ownership proof documents
    };

    const { data, error } = await supabase
      .from('property')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  });

// Action to get user's submitted rental properties
export const getUserRentalSubmissions = authActionClient.action(
  async ({ ctx }) => {
    const { supabase, authUser } = ctx;

    const { data, error } = await supabase
      .from('property')
      .select('*')
      .eq('submitted_by', authUser.user.id)
      .eq('property_type', 'rental')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  },
);

// Schema for uploading rental property images
const uploadRentalPropertyImagesSchema = z.object({
  propertyId: z.string(),
  newImages: z.array(z.string()), // base64 encoded images
  initialImages: z.array(z.string()), // existing image URLs
});

// Server action to upload rental property images
export const uploadRentalPropertyImages = authActionClient
  .schema(uploadRentalPropertyImagesSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { propertyId, newImages, initialImages } = parsedInput;
    const userId = authUser.user.id;

    // Filter images to upload (exclude already uploaded ones)
    const newImagesToUpload = newImages.filter(
      (image) => !initialImages.includes(image),
    );

    // Images to retain (already uploaded)
    const retainedImages = initialImages.filter((image) =>
      newImages.includes(image),
    );

    // Images to delete (removed from form)
    const imagesToDelete = initialImages.filter(
      (image) => !newImages.includes(image),
    );

    // Upload new images
    const uploadedImageUrls: string[] = [];

    for (const base64Image of newImagesToUpload) {
      try {
        // Parse base64 data
        const base64Data = base64Image.split(',')[1];
        const mimeTypeMatch = base64Image.match(/data:([^;]+);base64/);
        if (!mimeTypeMatch) {
          Logger.error('Invalid base64 image format', { base64Image });
          continue;
        }
        const mimeType = mimeTypeMatch[1];
        const fileExtension = mimeType.split('/')[1] || 'png';

        // Convert base64 to Buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Build file path: {userId}/{propertyId}/filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const filePath = `${userId}/${propertyId}/${fileName}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, imageBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (error) {
          Logger.error('Failed to upload image', { error, filePath });
          throw new Error(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('property-images').getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrl);
      } catch (error) {
        Logger.error('Error processing image upload', { error });
        throw new Error(
          `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Delete removed images
    if (imagesToDelete.length > 0) {
      // Extract file paths from URLs
      const filePathsToDelete = imagesToDelete
        .map((url) => {
          // Extract path from Supabase URL
          // URL format: https://project.supabase.co/storage/v1/object/public/property-images/{path}
          const urlParts = url.split('/property-images/');
          if (urlParts.length > 1) {
            return urlParts[1];
          }
          return null;
        })
        .filter((path): path is string => path !== null);

      if (filePathsToDelete.length > 0) {
        // Only delete files that are in the user's folder
        const userFilesToDelete = filePathsToDelete.filter((path) =>
          path.startsWith(`${userId}/`),
        );

        if (userFilesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('property-images')
            .remove(userFilesToDelete);

          if (deleteError) {
            Logger.error('Failed to delete images', { deleteError });
            // Don't throw here, as deletion failure is less critical
          }
        }
      }
    }

    // Return combined images (retained + newly uploaded)
    return [...retainedImages, ...uploadedImageUrls];
  });

// Helper to check if user has at least one approved investment
export const hasApprovedInvestment = async (
  userId: string,
): Promise<boolean> => {
  const supabase = await createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('investment')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'successful')
    .limit(1);

  if (error) throw new Error(error.message);

  return (data?.length ?? 0) > 0;
};

// Public action to get unique cities from all rental properties
export const getRentalPropertyCities = async (): Promise<string[]> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('property')
    .select('city')
    .eq('property_type', 'rental')
    .not('city', 'is', null);

  if (error) throw new Error(error.message);

  // Extract unique cities (case-insensitive)
  const uniqueCities = new Set<string>();
  data.forEach((item) => {
    if (item.city) {
      uniqueCities.add(item.city);
    }
  });

  return Array.from(uniqueCities).sort();
};

// Public action to get unique states from all rental properties
export const getRentalPropertyStates = async (): Promise<string[]> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('property')
    .select('state')
    .eq('property_type', 'rental')
    .not('state', 'is', null);

  if (error) throw new Error(error.message);

  // Extract unique states (case-insensitive)
  const uniqueStates = new Set<string>();
  data.forEach((item) => {
    if (item.state) {
      uniqueStates.add(item.state);
    }
  });

  return Array.from(uniqueStates).sort();
};
