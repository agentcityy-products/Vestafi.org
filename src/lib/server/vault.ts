import type { SupabaseClient } from '@supabase/supabase-js';
import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { Database } from '@/types/supabase';

export type UserVaultBalances = {
  balance: number;
  total_deposited: number;
  total_deployed: number;
};

async function getOrCreateUserVaultWithClient(
  userId: string,
  supabase: SupabaseClient<Database>,
): Promise<UserVaultBalances> {
  const { data: existing } = await supabase
    .from('user_vault')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return {
      balance: existing.balance || 0,
      total_deposited: existing.total_deposited || 0,
      total_deployed: existing.total_deployed || 0,
    };
  }

  const { data: newVault, error } = await supabase
    .from('user_vault')
    .insert({
      user_id: userId,
      balance: 0,
      total_deposited: 0,
      total_deployed: 0,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return {
    balance: newVault.balance || 0,
    total_deposited: newVault.total_deposited || 0,
    total_deployed: newVault.total_deployed || 0,
  };
}

export async function getOrCreateUserVault(userId: string) {
  const supabase = await createSupabaseServerClient();
  return getOrCreateUserVaultWithClient(userId, supabase);
}

export async function getOrCreateUserVaultAdmin(userId: string) {
  const supabase = await createSupabaseAdminClient();
  return getOrCreateUserVaultWithClient(userId, supabase);
}
