'use server';

import { propertyFormSchema } from '@/schema/property';

import { adminActionClient } from '@/lib/server/safe-action';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { ListingWithRent } from '@/types/dao';

interface GetPropertiesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

type GetPropertiesResponse = {
  data: ListingWithRent[];
  count: number;
  page: number;
  pageSize: number;
};

export const getProperties = async ({
  page = 0,
  pageSize = 10,
  search = '',
}: GetPropertiesParams = {}): Promise<GetPropertiesResponse> => {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('listings_view')
    .select('*, rents:monthly_rent(*)', { count: 'exact' });

  // Add search filter if search term exists
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Add pagination
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order('created_at', { ascending: false })
    .limit(pageSize);

  if (error) throw new Error(error.message);

  return {
    data,
    count: count || 0,
    page,
    pageSize,
  };
};

export const getProperty = async (id: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('property')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const upsertProperty = adminActionClient
  .schema(propertyFormSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { data, error } = await supabase.from('property').upsert(parsedInput);
    if (error) throw new Error(error.message);
    return data;
  });
