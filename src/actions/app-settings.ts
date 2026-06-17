'use server';

import { z } from 'zod';

import { adminActionClient, authActionClient } from '@/lib/server/safe-action';

import { Json } from '@/types/supabase';

const updateAppSettingSchema = z.object({
  key: z.string(),
  value: z.union([z.boolean(), z.number(), z.string()]),
});

export const updateAppSetting = adminActionClient
  .schema(updateAppSettingSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { key, value } = parsedInput;

    // Convert value to JSONB-compatible format
    // For JSONB columns, Supabase can accept objects directly or parse JSON strings
    let jsonbValue: Json;
    if (typeof value === 'boolean') {
      jsonbValue = value;
    } else if (typeof value === 'number') {
      jsonbValue = value;
    } else if (typeof value === 'string') {
      // Try to parse as JSON if it looks like JSON, otherwise store as string
      try {
        const parsed = JSON.parse(value);
        // Validate it's a valid Json type
        if (
          typeof parsed === 'string' ||
          typeof parsed === 'number' ||
          typeof parsed === 'boolean' ||
          parsed === null ||
          Array.isArray(parsed) ||
          (typeof parsed === 'object' && parsed !== null)
        ) {
          jsonbValue = parsed as Json;
        } else {
          jsonbValue = value;
        }
      } catch {
        // Not valid JSON, store as string
        jsonbValue = value;
      }
    } else {
      jsonbValue = value as Json;
    }

    // Check if setting exists
    const { data: existing } = await supabase
      .from('app_settings')
      .select('id')
      .eq('key', key)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('app_settings')
        .update({
          value: jsonbValue,
          updated_at: new Date().toISOString(),
          updated_by: authUser.user.id,
        })
        .eq('key', key);

      if (error) throw new Error(error.message);
    } else {
      // Insert new
      const { error } = await supabase.from('app_settings').insert({
        key,
        value: jsonbValue,
        updated_at: new Date().toISOString(),
        updated_by: authUser.user.id,
      });

      if (error) throw new Error(error.message);
    }

    return { success: true };
  });

const updateExitWindowAppSettingsSchema = z.object({
  feePercentage: z.number().min(0).max(100),
  minSellAmount: z.number().min(1),
  minBuyAmount: z.number().min(1),
});

/** Batch update exit-window-related app_settings (admin). */
export const updateExitWindowAppSettings = adminActionClient
  .schema(updateExitWindowAppSettingsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const entries: [string, Json][] = [
      ['exit_window_fee_percentage', parsedInput.feePercentage],
      ['exit_window_min_sell_amount', parsedInput.minSellAmount],
      ['exit_window_min_buy_amount', parsedInput.minBuyAmount],
    ];
    const now = new Date().toISOString();
    for (const [key, value] of entries) {
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from('app_settings')
          .update({
            value,
            updated_at: now,
            updated_by: authUser.user.id,
          })
          .eq('key', key);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('app_settings').insert({
          key,
          value,
          updated_at: now,
          updated_by: authUser.user.id,
        });
        if (error) throw new Error(error.message);
      }
    }
    return { success: true };
  });

const deleteAppSettingSchema = z.object({
  key: z.string(),
});

export const deleteAppSetting = adminActionClient
  .schema(deleteAppSettingSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { key } = parsedInput;

    const { error } = await supabase
      .from('app_settings')
      .delete()
      .eq('key', key);

    if (error) throw new Error(error.message);

    return { success: true };
  });

// Get admin notification (requires auth, but not admin - all authenticated users can read)
export const getAdminNotification = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'membership_admin_notification')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      throw new Error(error.message);
    }

    if (!data?.value) {
      return { success: true, data: null };
    }

    try {
      const notification = data.value as
        | { message: string; expiresAt: string; theme: string }
        | string;
      const parsed =
        typeof notification === 'string'
          ? (JSON.parse(notification) as {
              message: string;
              expiresAt: string;
              theme: string;
            })
          : notification;

      // Check if expired
      if (new Date(parsed.expiresAt) < new Date()) {
        return { success: true, data: null };
      }

      return { success: true, data: parsed };
    } catch {
      return { success: true, data: null };
    }
  });
