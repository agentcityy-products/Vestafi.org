'use server';

import { z } from 'zod';

import {
  createExitWindowSchema,
  setExitWindowPropertyPricesSchema,
  updateExitWindowSchema,
} from '@/schema/exit-window';

import { adminActionClient } from '@/lib/server/safe-action';

export const listExitWindows = adminActionClient.action(async ({ ctx }) => {
  const { supabase } = ctx;
  const { data, error } = await supabase
    .from('exit_windows')
    .select('*')
    .order('start_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { windows: data ?? [] };
});

const getExitWindowSchema = z.object({ id: z.string().uuid() });

export const getExitWindow = adminActionClient
  .schema(getExitWindowSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { data, error } = await supabase
      .from('exit_windows')
      .select('*')
      .eq('id', parsedInput.id)
      .single();
    if (error) throw new Error(error.message);
    return { window: data };
  });

export const createExitWindow = adminActionClient
  .schema(createExitWindowSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { start_at, end_at } = parsedInput;
    if (new Date(end_at) <= new Date(start_at))
      throw new Error('End must be after start');
    const { data, error } = await supabase
      .from('exit_windows')
      .insert({
        start_at,
        end_at,
        status: 'draft',
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return { window: data };
  });

export const updateExitWindow = adminActionClient
  .schema(updateExitWindowSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { id, ...updates } = parsedInput;
    if (updates.start_at != null || updates.end_at != null) {
      const { data: current, error: curErr } = await supabase
        .from('exit_windows')
        .select('start_at, end_at')
        .eq('id', id)
        .single();
      if (curErr) throw new Error(curErr.message);
      const start = updates.start_at ?? current?.start_at;
      const end = updates.end_at ?? current?.end_at;
      if (start && end && new Date(end) <= new Date(start)) {
        throw new Error('End must be after start');
      }
    }
    const { data, error } = await supabase
      .from('exit_windows')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return { window: data };
  });

export const setExitWindowPropertyPrices = adminActionClient
  .schema(setExitWindowPropertyPricesSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { exit_window_id, prices } = parsedInput;
    for (const { property_id, exit_price } of prices) {
      const { error } = await supabase
        .from('exit_window_property_prices')
        .upsert(
          { exit_window_id, property_id, exit_price },
          { onConflict: 'exit_window_id,property_id' },
        );
      if (error) throw new Error(error.message);
    }
    return { success: true };
  });

const listPropertiesWithExitPricesSchema = z.object({
  exit_window_id: z.string().uuid(),
});

/** List all properties with optional current exit price for a window (for admin price form). */
export const listPropertiesWithExitPrices = adminActionClient
  .schema(listPropertiesWithExitPricesSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { exit_window_id } = parsedInput;
    const [propsRes, pricesRes] = await Promise.all([
      supabase.from('property').select('id, title, price, images').order('title'),
      supabase
        .from('exit_window_property_prices')
        .select('property_id, exit_price')
        .eq('exit_window_id', exit_window_id),
    ]);
    if (propsRes.error) throw new Error(propsRes.error.message);
    if (pricesRes.error) throw new Error(pricesRes.error.message);
    const priceMap = (pricesRes.data ?? []).reduce(
      (acc, row) => {
        acc[row.property_id] = row.exit_price;
        return acc;
      },
      {} as Record<string, number>,
    );
    const properties = (propsRes.data ?? []).map((p) => ({
      ...p,
      exit_price: priceMap[p.id] ?? null,
    }));
    return { properties };
  });
