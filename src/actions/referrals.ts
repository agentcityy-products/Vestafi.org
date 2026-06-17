'use server';

import { z } from 'zod';

import { adminActionClient, authActionClient } from '@/lib/server/safe-action';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getFullName } from '@/utils/string-functions';

import {
  ReferralInsert,
  ReferralRewardInsert,
  ReferralRewardRow,
} from '@/types/dao';

/**
 * Get or create referral_rewards record for a referrer
 * Creates with default values if it doesn't exist
 */
async function getOrCreateReferralReward(
  referrerId: string,
): Promise<ReferralRewardRow> {
  const supabase = await createSupabaseAdminClient();

  // Check if reward record exists
  const { data: existing, error: fetchError } = await supabase
    .from('referral_rewards')
    .select('*')
    .eq('user_id', referrerId)
    .single();

  if (existing) {
    return existing;
  }

  // Create new reward record with default values
  const defaultReward: ReferralRewardInsert = {
    user_id: referrerId,
    reward_per_referral: 50_000, // Default reward per referral
    total_referrals: 0,
    total_rewards: 0,
  };

  const { data: newReward, error: createError } = await supabase
    .from('referral_rewards')
    .insert(defaultReward)
    .select('*')
    .single();

  if (createError) {
    console.error('Failed to create referral reward record:', createError);
    // Return the default structure even if insert fails
    // Cast to Row type since we only use reward_per_referral field
    return defaultReward as ReferralRewardRow;
  }

  return newReward;
}

/**
 * Create a referral record when application is submitted (Category 2+ only)
 * This is called internally from submitApplication action
 */
export async function createReferralRecord(
  applicationId: string,
  applicationEmail: string,
  referredByCode: string | null | undefined,
  category: number | null,
): Promise<void> {
  // Only create referral for Category 2+ (Category 1 is rejected)
  if (!category || category < 2 || !referredByCode) {
    return;
  }

  const supabase = await createSupabaseAdminClient();
  console.log('referredByCode', referredByCode);

  // Find referrer by referral code
  const { data: referrer, error: referrerError } = await supabase
    .from('profile')
    .select('id, email')
    .eq('referral_code', referredByCode);

  if (referrerError || !referrer) {
    console.log(
      'Invalid referral code, silently ignore (user can still submit)',
      referrerError?.message,
    );
    // Invalid referral code, silently ignore (user can still submit)
    return;
  }

  //   // Prevent self-referral
  console.log('referrer[0].email', referrer[0]);
  //   if (referrer[0].email.toLowerCase() === applicationEmail.toLowerCase()) {
  //     return;
  //   }

  // Check if referral already exists for this application
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('application_id', applicationId);

  if (existing && existing.length > 0) {
    // Referral already exists, don't create duplicate
    console.log("Referral already exists, don't create duplicate");
    return;
  }

  // Create referral record
  const referralData: ReferralInsert = {
    referrer_id: referrer[0].id,
    application_id: applicationId,
    referee_id: null, // Will be updated when profile is created
    referral_code: referredByCode.toLowerCase(),
    status: 'pending',
  };
  console.log('Creating referral record', referralData);

  const { error } = await supabase.from('referrals').insert(referralData);

  if (error) {
    // Log error but don't fail application submission
    console.error('Failed to create referral record:', error);
    return;
  }

  // Create or get referral_rewards record for the referrer
  // This allows admin to set reward_per_referral before the first deposit is approved
  try {
    await getOrCreateReferralReward(referrer[0].id);
  } catch (rewardError) {
    // Log error but don't fail referral creation
    console.error('Failed to create/get referral reward record:', rewardError);
  }
}

/**
 * Update referral record when application is approved and profile is created
 */
export async function updateReferralOnProfileCreation(
  email: string,
  profileId: string,
): Promise<void> {
  const supabase = await createSupabaseAdminClient();

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id')
    .eq('email', email);

  console.log('Updating referral on profile creation', application);

  if (applicationError) {
    console.error('Error finding application', applicationError.message);
    throw new Error(applicationError.message);
  }

  // Find referral by application_id
  const { data: referral, error: findError } = await supabase
    .from('referrals')
    .select('id, status')
    .eq('application_id', application?.[0]?.id);

  if (findError || !referral) {
    // No referral found, nothing to update
    console.log('No referral found, nothing to update', findError?.message);
    return;
  }

  // Update referral with referee_id and status
  const { error: updateError } = await supabase
    .from('referrals')
    .update({
      referee_id: profileId,
      status: 'approved',
    })
    .eq('id', referral[0].id);

  if (updateError) {
    console.error('Failed to update referral record:', updateError);
  }
}

/**
 * Process referral reward when referee makes their first investment
 */
export async function processReferralReward(refereeId: string): Promise<void> {
  const supabase = await createSupabaseAdminClient();

  console.log('Processing referral reward for referee', refereeId);

  // Find the approved referral for this referee (there should only be one)
  const { data: referrals, error: findError } = await supabase
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referee_id', refereeId)
    .eq('status', 'approved');

  if (findError || !referrals || referrals.length === 0) {
    return;
  }

  console.log('Referrals', referrals);

  // Get the single referral (there should only be one per referee)
  const referral = referrals[0];

  if (!referral.referrer_id) {
    return;
  }

  // Update referral status to 'invested'
  const { error: updateError } = await supabase
    .from('referrals')
    .update({ status: 'invested' })
    .eq('id', referral.id);

  if (updateError) {
    console.error('Failed to update referral status:', updateError);
    return;
  }

  // Get or create referral_rewards record
  // This should already exist (created when referral was first made)
  // but we'll ensure it exists as a safety measure
  const rewardRecord = await getOrCreateReferralReward(referral.referrer_id);

  // Use the reward_per_referral from the record (defaults to 50,000 if not set)
  const rewardPerReferral = rewardRecord.reward_per_referral || 50_000;

  // Count invested referrals for this referrer
  const { data: investedReferrals, error: countError } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', referral.referrer_id)
    .eq('status', 'invested');

  if (countError) {
    console.error('Failed to count invested referrals:', countError);
    return;
  }

  const totalInvestedReferrals = investedReferrals?.length || 0;
  const totalRewards = totalInvestedReferrals * rewardPerReferral;

  // Update referral_rewards with new totals
  const { error: updateRewardError } = await supabase
    .from('referral_rewards')
    .update({
      reward_per_referral: rewardPerReferral, // Keep existing or default
      total_referrals: totalInvestedReferrals,
      total_rewards: totalRewards,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', referral.referrer_id);

  if (updateRewardError) {
    console.error('Failed to update reward record:', updateRewardError);
    return;
  }

  // Add reward to user vault
  const rewardAmount = rewardPerReferral;

  // Get current vault balance
  const { data: vault, error: vaultError } = await supabase
    .from('user_vault')
    .select('balance')
    .eq('user_id', referral.referrer_id)
    .single();

  if (vaultError && vaultError.code !== 'PGRST116') {
    console.error('Failed to fetch vault:', vaultError);
    return;
  }

  const currentBalance = vault?.balance || 0;

  // Update vault balance
  if (vault) {
    const { error: vaultUpdateError } = await supabase
      .from('user_vault')
      .update({
        balance: currentBalance + rewardAmount,
      })
      .eq('user_id', referral.referrer_id);

    if (vaultUpdateError) {
      console.error('Failed to update vault balance:', vaultUpdateError);
      return;
    }
  } else {
    // Create vault if it doesn't exist
    const { error: vaultCreateError } = await supabase
      .from('user_vault')
      .insert({
        user_id: referral.referrer_id,
        balance: rewardAmount,
        total_deposited: 0,
        total_deployed: 0,
      });

    if (vaultCreateError) {
      console.error('Failed to create vault:', vaultCreateError);
      return;
    }
  }

  // Create vault transaction for referral reward
  const { error: transactionError } = await supabase
    .from('vault_transactions')
    .insert({
      user_id: referral.referrer_id,
      type: 'deposit', // Using 'deposit' type for referral rewards
      amount: rewardAmount,
      status: 'approved',
      proof_images: [],
    });

  if (transactionError) {
    console.error('Failed to create vault transaction:', transactionError);
  }
}

/**
 * Get user's referral code
 */
export const getUserReferralCode = authActionClient.action(async ({ ctx }) => {
  const { supabase, authUser } = ctx;

  const { data: profile, error } = await supabase
    .from('profile')
    .select('referral_code')
    .eq('id', authUser.user.id)
    .single();

  if (error) throw new Error(error.message);

  return {
    referral_code: profile?.referral_code || null,
  };
});

/**
 * Get user's referral statistics
 */
export const getReferralStats = authActionClient.action(async ({ ctx }) => {
  const { supabase, authUser } = ctx;

  // Get referral code
  const { data: profile } = await supabase
    .from('profile')
    .select('referral_code')
    .eq('id', authUser.user.id)
    .single();

  if (!profile?.referral_code) {
    return {
      referral_code: null,
      total_referrals: 0,
      pending_referrals: 0,
      approved_referrals: 0,
      invested_referrals: 0,
      total_rewards: 0,
      reward_per_referral: 0,
    };
  }

  // Count referrals by status
  const { data: referrals, error: referralsError } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_id', authUser.user.id);

  if (referralsError) throw new Error(referralsError.message);

  const totalReferrals = referrals?.length || 0;
  const pendingReferrals =
    referrals?.filter((r) => r.status === 'pending').length || 0;
  const approvedReferrals =
    referrals?.filter((r) => r.status === 'approved').length || 0;
  const investedReferrals =
    referrals?.filter((r) => r.status === 'invested').length || 0;

  // Get reward info
  const { data: reward } = await supabase
    .from('referral_rewards')
    .select('total_rewards, reward_per_referral')
    .eq('user_id', authUser.user.id)
    .single();

  return {
    referral_code: profile.referral_code,
    total_referrals: totalReferrals,
    pending_referrals: pendingReferrals,
    approved_referrals: approvedReferrals,
    invested_referrals: investedReferrals,
    total_rewards: reward?.total_rewards || 0,
    reward_per_referral: reward?.reward_per_referral || 0,
  };
});

const getUserReferralsSchema = z.object({
  status: z.enum(['pending', 'approved', 'invested']).optional(),
});

/**
 * Get list of user's referrals
 */
export const getUserReferrals = authActionClient
  .schema(getUserReferralsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { status } = parsedInput;

    let query = supabase
      .from('referrals')
      .select(
        'id, referral_code, status, created_at, application_id, referee_id',
      )
      .eq('referrer_id', authUser.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: referralsData, error } = await query;

    if (error) throw new Error(error.message);

    // Fetch referee data separately (from profile or application)
    const referralsWithReferee = await Promise.all(
      (referralsData || []).map(async (referral) => {
        let referee: { name: string; email: string } | null = null;
        console.log('Referral', referral);

        if (referral.referee_id) {
          // Fetch from profile table
          const { data: profile, error: profileError } = await supabase
            .from('profile')
            .select('first_name, last_name, email')
            .eq('id', referral.referee_id)
            .single();

          if (profileError) {
            console.error(
              'Error fetching referee profile:',
              profileError.message,
            );
          }

          if (!profileError && profile) {
            referee = {
              name: getFullName(profile.first_name, profile.last_name),
              email: profile.email,
            };
          }
        } else if (referral.application_id) {
          // Fetch from applications table
          const { data: application, error: appError } = await supabase
            .from('applications')
            .select('full_name, email')
            .eq('id', referral.application_id)
            .single();

          if (!appError && application) {
            referee = {
              name: application.full_name,
              email: application.email,
            };
          }
        }

        return {
          ...referral,
          referee,
        };
      }),
    );

    return {
      referrals: referralsWithReferee,
    };
  });

/**
 * Admin: Get all referrals
 */
export const getAllReferrals = adminActionClient
  .schema(
    z.object({
      referrer_id: z.string().optional(),
      status: z.enum(['pending', 'approved', 'invested']).optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { referrer_id, status } = parsedInput;

    let query = supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (referrer_id) {
      query = query.eq('referrer_id', referrer_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: referralsData, error } = await query;

    if (error) throw new Error(error.message);

    // Fetch referrer and referee data separately
    const referralsWithProfiles = await Promise.all(
      (referralsData || []).map(async (referral) => {
        // Fetch referrer (always from profile)
        const referrerResult = referral.referrer_id
          ? await supabase
              .from('profile')
              .select('id, first_name, last_name, email, referral_code')
              .eq('id', referral.referrer_id)
              .single()
          : { data: null, error: null };

        const referrer = referrerResult.data
          ? {
              name: getFullName(
                referrerResult.data.first_name,
                referrerResult.data.last_name,
              ),
              email: referrerResult.data.email,
              referral_code: referrerResult.data.referral_code,
            }
          : null;

        // Fetch referee (from profile if referee_id exists, otherwise from application)
        let referee: { name: string; email: string } | null = null;

        if (referral.referee_id) {
          const refereeResult = await supabase
            .from('profile')
            .select('id, first_name, last_name, email')
            .eq('id', referral.referee_id)
            .single();

          if (!refereeResult.error && refereeResult.data) {
            referee = {
              name: getFullName(
                refereeResult.data.first_name,
                refereeResult.data.last_name,
              ),
              email: refereeResult.data.email,
            };
          }
        } else if (referral.application_id) {
          const applicationResult = await supabase
            .from('applications')
            .select('full_name, email')
            .eq('id', referral.application_id)
            .single();

          if (!applicationResult.error && applicationResult.data) {
            referee = {
              name: applicationResult.data.full_name,
              email: applicationResult.data.email,
            };
          }
        }

        return {
          ...referral,
          referrer,
          referee,
        };
      }),
    );

    return {
      referrals: referralsWithProfiles,
    };
  });

/**
 * Admin: Set reward per referral for a user
 */
export const setRewardPerReferral = adminActionClient
  .schema(
    z.object({
      user_id: z.string(),
      reward_per_referral: z.number().min(0),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { user_id, reward_per_referral } = parsedInput;

    // Get or create reward record
    const { data: existing } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Count invested referrals
    const { data: investedReferrals } = await supabase
      .from('referrals')
      .select('id', { count: 'exact' })
      .eq('referrer_id', user_id)
      .eq('status', 'invested');

    const totalInvestedReferrals = investedReferrals?.length || 0;
    const totalRewards = totalInvestedReferrals * reward_per_referral;

    if (existing) {
      const { error } = await supabase
        .from('referral_rewards')
        .update({
          reward_per_referral,
          total_referrals: totalInvestedReferrals,
          total_rewards: totalRewards,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('referral_rewards').insert({
        user_id,
        reward_per_referral,
        total_referrals: totalInvestedReferrals,
        total_rewards: totalRewards,
      });

      if (error) throw new Error(error.message);
    }

    return { success: true };
  });

/**
 * Admin: Get all referral rewards
 */
export const getAllReferralRewards = adminActionClient.action(
  async ({ ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('referral_rewards')
      .select(
        `
        *,
        profile:user_id (
          id,
          first_name,
          last_name,
          email,
          referral_code
        )
      `,
      )
      .order('total_rewards', { ascending: false });

    if (error) throw new Error(error.message);

    return {
      rewards: data || [],
    };
  },
);
