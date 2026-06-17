'use server';

import { profileSchema } from '@/schema/profile';
import { updateReferralOnProfileCreation } from '@/actions/referrals';

import { authActionClient } from '@/lib/server/safe-action';
import {
  generateReferralCodeFromEmail,
  generateUniqueReferralCode,
} from '@/utils/referral-code';

export const upsertProfile = authActionClient
  .schema(profileSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const {
      first_name,
      last_name,
      phone,
      country_code,
      bank_name,
      account_number,
      account_name,
      next_of_kin,
    } = parsedInput;

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        first_name,
        last_name,
        phone,
        country_code,
        onboarded: true,
      },
    });
    if (authError) throw new Error(authError.message);

    if (next_of_kin) {
      const { error: nextOfKinError } = await supabase
        .from('next_of_kin')
        .upsert({
          id: authUser.user.id,
          first_name: next_of_kin.first_name,
          last_name: next_of_kin.last_name,
          phone: next_of_kin.phone,
          country_code: next_of_kin.country_code,
          address: next_of_kin.address,
          relationship: next_of_kin.relationship,
          email: next_of_kin.email,
        });
      if (nextOfKinError) throw new Error(nextOfKinError.message);
    }

    // Check if profile exists to see if we need to generate referral code
    const { data: existingProfile } = await supabase
      .from('profile')
      .select('referral_code')
      .eq('id', authUser.user.id)
      .single();

    let referralCode = existingProfile?.referral_code;

    // Generate referral code if it doesn't exist
    if (!referralCode) {
      const baseCode = generateReferralCodeFromEmail(authUser.user.email!);

      // Get all existing referral codes to ensure uniqueness
      const { data: allProfiles } = await supabase
        .from('profile')
        .select('referral_code')
        .not('referral_code', 'is', null);

      const existingCodes = new Set(
        (allProfiles || [])
          .map((p) => p.referral_code)
          .filter((code): code is string => !!code),
      );

      referralCode = generateUniqueReferralCode(baseCode, existingCodes);
    }

    // Set is_founding_member = false for new users (existing users are already set to true by migration)
    const isNewProfile = !existingProfile;

    const { error } = await supabase.from('profile').upsert({
      id: authUser.user.id,
      first_name,
      last_name,
      phone,
      country_code,
      email: authUser.user.email!,
      referral_code: referralCode,
      // New users are not founding members (they need to activate membership)
      is_founding_member: isNewProfile ? false : undefined, // Don't update if existing
    });
    if (error) throw new Error(error.message);

    // Update referral record if this is a new profile (first time onboarding)
    // Find application by email, then find referral by application_id
    if (!existingProfile) {
      await updateReferralOnProfileCreation(
        authUser.user.email!,
        authUser.user.id,
      );
    }

    const { error: bankError } = await supabase.from('bank_info').upsert({
      profile_id: authUser.user.id,
      bank_name,
      account_number,
      account_name,
    });
    if (bankError) throw new Error(bankError.message);

    return { success: true };
  });
