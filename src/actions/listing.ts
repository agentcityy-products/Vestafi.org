'use server';

import { getListingByIdSchema, getListingsSchema } from '@/schema/listing';
import { getTotalInvested } from '@/actions/investment';

import { authActionClient } from '@/lib/server/safe-action';

import { checkListingsAccess } from '@/transformer/listing';

export const getListings = authActionClient
  .schema(getListingsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;

    // Build the base query for filtering - filter by investment properties only
    let baseQuery = supabase
      .from('listings_view')
      .select('*', { count: 'exact' })
      .not('published_at', 'is', null);

    // Filter to only show investment properties (not rental)
    // Since listings_view doesn't have property_type, we need to join with property table
    // For now, we'll filter at application layer after fetching
    // Note: This is a temporary solution. Ideally, listings_view should include property_type filter

    // Only apply search filter if search term is not empty
    if (parsedInput.search?.trim()) {
      baseQuery = baseQuery.or(
        `title.ilike.%${parsedInput.search}%,description.ilike.%${parsedInput.search}%,city.ilike.%${parsedInput.search}%,state.ilike.%${parsedInput.search}%,country.ilike.%${parsedInput.search}%,zip_code.ilike.%${parsedInput.search}%`,
      );
    }

    // Apply pagination and ordering
    const query = baseQuery
      .range(
        (parsedInput.page - 1) * parsedInput.pageSize,
        parsedInput.page * parsedInput.pageSize - 1,
      )
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    // Filter investment properties at application layer
    // Get property IDs from listings and filter by property_type
    if (data && data.length > 0) {
      const propertyIds = data
        .map((listing) => listing.id)
        .filter((id): id is string => id !== null && id !== undefined);
      const { data: properties, error: propertyError } = await supabase
        .from('property')
        .select('id, property_type')
        .in('id', propertyIds);

      if (propertyError) throw new Error(propertyError.message);

      // Filter to only include investment properties
      const investmentPropertyIds = new Set(
        (properties || [])
          .filter((p) => p.property_type === 'investment')
          .map((p) => p.id),
      );

      const filteredData = data.filter((listing) =>
        listing.id ? investmentPropertyIds.has(listing.id) : false,
      );

      const totalInvested = await getTotalInvested();

      return {
        data: checkListingsAccess(filteredData, totalInvested),
        totalCount: filteredData.length, // Note: This is approximate, actual count should be recalculated
      };
    }

    const totalInvested = await getTotalInvested();

    return {
      data: checkListingsAccess(data || [], totalInvested),
      totalCount: count || 0,
    };
  });

export const getListingById = authActionClient
  .schema(getListingByIdSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('listings_view')
      .select('*')
      .eq('id', parsedInput.id)
      .not('published_at', 'is', null)
      .single();

    if (error) throw new Error(error.message);

    return data;
  });
