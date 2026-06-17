'use server';


import {
  createMembershipActivationSchema,
  getMembershipActivationsSchema,
  updateMembershipActivationStatusSchema,
} from '@/schema/membership';

import { resend } from '@/lib/resend';
import { adminActionClient, authActionClient } from '@/lib/server/safe-action';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';

import { appConfig, membershipConfig } from '@/config/app';
import { AdminMembershipActivationNotification } from '@/emails/admin-membership-activation-notification';
import { MembershipActivationApproved } from '@/emails/membership-activation-approved';
import { MembershipActivationRejected } from '@/emails/membership-activation-rejected';
import { MembershipActivationRequestConfirmation } from '@/emails/membership-activation-request-confirmation';

// Helper function to get app setting value
async function getAppSetting(
  key: string,
  defaultValue: unknown,
): Promise<unknown> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (!data) return defaultValue;
  return data.value;
}

// Helper function to check if membership is enabled globally
export async function isMembershipEnabled(): Promise<boolean> {
  const enabled = await getAppSetting('membership_enabled', true);
  return enabled === true || enabled === 'true';
}

// Helper function to get annual membership fee
export async function getMembershipAnnualFee(): Promise<number> {
  const fee = await getAppSetting(
    'membership_annual_fee',
    membershipConfig.defaultAnnualFee,
  );
  return typeof fee === 'number'
    ? fee
    : Number(fee) || membershipConfig.defaultAnnualFee;
}

// Helper function to check if membership is active (not expired)
function isMembershipActive(
  isFoundingMember: boolean,
  expiresAt: string | null,
): boolean {
  // Founding members have lifetime access
  if (isFoundingMember) return true;

  // No expiration date means no active membership
  if (!expiresAt) return false;

  // Check if expiration date is in the future
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  return expirationDate > now;
}

// Helper function to check membership access
export async function checkMembershipAccess(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  // Check if membership is enabled globally
  const membershipEnabled = await isMembershipEnabled();
  if (!membershipEnabled) return true; // If disabled, everyone has access

  // Check if user is admin (bypass check)
  const { data: userRole } = await supabase
    .from('user_role')
    .select('role')
    .eq('id', userId)
    .single();

  if (userRole?.role === 'admin') return true;

  // Check membership status with expiration
  const { data: profile } = await supabase
    .from('profile')
    .select('is_founding_member, membership_expires_at')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  return isMembershipActive(
    profile.is_founding_member,
    profile.membership_expires_at,
  );
}

// Create membership activation request
export const createMembershipActivation = authActionClient
  .schema(createMembershipActivationSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { proof_images } = parsedInput;

    // Check if membership is enabled globally
    const membershipEnabled = await isMembershipEnabled();
    if (!membershipEnabled) {
      throw new Error('Membership requirement is currently disabled.');
    }

    // Get annual fee from app_settings
    const annualFee = await getMembershipAnnualFee();

    // Check if user already has active membership
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('is_founding_member, membership_expires_at')
      .eq('id', authUser.user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    // Check if user has active membership
    if (
      isMembershipActive(
        profile.is_founding_member,
        profile.membership_expires_at,
      )
    ) {
      throw new Error(
        'You already have an active membership. Please wait until your membership expires to renew.',
      );
    }

    // Create membership activation request
    const { data: activation, error: activationError } = await supabase
      .from('membership_activations')
      .insert({
        user_id: authUser.user.id,
        amount: annualFee,
        proof_images,
        status: 'pending',
      })
      .select('*')
      .single();

    if (activationError) throw new Error(activationError.message);

    // Get user details for emails
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profile')
      .select('first_name, last_name, email')
      .eq('id', authUser.user.id)
      .single();

    if (userProfileError) throw new Error(userProfileError.message);

    const userName = getFullName(userProfile.first_name, userProfile.last_name);

    Logger.info('Membership activation request created', {
      userId: authUser.user.id,
      activationId: activation.id,
    });

    // Send admin notification email
    const { error: adminEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: appConfig.emails.admin,
      subject: 'New Membership Activation Request',
      react: AdminMembershipActivationNotification({
        userName,
        userEmail: userProfile.email,
        activationId: activation.id,
        amount: annualFee,
        activationDate: new Date(activation.created_at).toLocaleDateString(),
      }),
      text: `New Membership Activation Request

A new membership activation request has been submitted.

User Details:
- Name: ${userName}
- Email: ${userProfile.email}
- Activation ID: ${activation.id}
- Amount: ${formatCurrency(annualFee)}
- Date: ${new Date(activation.created_at).toLocaleDateString()}

Please review and approve or reject this request in the admin dashboard.

Best regards,
The ${appConfig.title} Team`,
    });

    if (adminEmailError) {
      Logger.error('Failed to send admin notification email', {
        error: adminEmailError,
      });
      // Don't throw, activation request is created successfully
    }

    // Send user confirmation email
    const { error: userEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: userProfile.email,
      subject: 'Membership Activation Request Received',
      react: MembershipActivationRequestConfirmation({
        recipientName: userName,
        activationId: activation.id,
        amount: annualFee,
        activationDate: new Date(activation.created_at).toLocaleDateString(),
      }),
      text: `Membership Activation Request Received

Dear ${userName},

Thank you for submitting your membership activation request.

Activation Details:
- Activation ID: ${activation.id}
- Amount: ${formatCurrency(annualFee)}
- Date: ${new Date(activation.created_at).toLocaleDateString()}

Your request is now pending admin approval. You will receive an email notification once your request has been reviewed.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
    });

    if (userEmailError) {
      Logger.error('Failed to send user confirmation email', {
        error: userEmailError,
      });
      // Don't throw, activation request is created successfully
    }

    return {
      success: true,
      message: 'Membership activation request submitted successfully',
      activationId: activation.id,
    };
  });

// Update membership activation status (Admin)
export const updateMembershipActivationStatus = adminActionClient
  .schema(updateMembershipActivationStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser: adminUser } = ctx;
    const { id, status, rejection_reason } = parsedInput;

    // Validate rejection reason if status is rejected
    if (status === 'rejected' && !rejection_reason) {
      throw new Error('Rejection reason is required when rejecting a request');
    }

    // Get activation details
    const { data: activation, error: fetchError } = await supabase
      .from('membership_activations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    // Get user profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profile')
      .select('first_name, last_name, email')
      .eq('id', activation.user_id)
      .single();

    if (userProfileError) throw new Error(userProfileError.message);

    const userName = getFullName(userProfile.first_name, userProfile.last_name);

    // Update activation status
    const updateData: {
      status: 'approved' | 'rejected';
      approved_at?: string;
      approved_by?: string;
      rejection_reason?: string;
      updated_at: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = adminUser.user.id;
    } else if (status === 'rejected') {
      updateData.rejection_reason = rejection_reason;
      updateData.approved_by = adminUser.user.id;
    }

    const { data: updatedActivation, error: updateError } = await supabase
      .from('membership_activations')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw new Error(updateError.message);

    // If approved, update user profile with expiration date (12 months from now)
    if (status === 'approved') {
      const expirationDate = new Date();
      expirationDate.setMonth(
        expirationDate.getMonth() + membershipConfig.durationMonths,
      );

      const { error: profileUpdateError } = await supabase
        .from('profile')
        .update({ membership_expires_at: expirationDate.toISOString() })
        .eq('id', activation.user_id);

      if (profileUpdateError) {
        Logger.error('Failed to update user profile', {
          error: profileUpdateError,
        });
        throw new Error('Failed to update user membership status');
      }

      Logger.info('Membership activated', {
        userId: activation.user_id,
        activationId: id,
      });

      // Get annual fee for email
      const annualFee = await getMembershipAnnualFee();

      // Send approval email
      const { error: emailError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: userProfile.email,
        subject: 'Membership Activation Approved',
        react: MembershipActivationApproved({
          recipientName: userName,
          activationId: id,
          amount: annualFee,
          approvedDate: new Date().toLocaleDateString(),
        }),
        text: `Membership Activation Approved

Dear ${userName},

Congratulations! Your membership activation request has been approved.

Activation Details:
- Activation ID: ${id}
- Amount: ${formatCurrency(annualFee)}
- Approved Date: ${new Date().toLocaleDateString()}

Your membership is now active. You can now access all features of the platform.

Welcome to Vestafi!

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });

      if (emailError) {
        Logger.error('Failed to send approval email', { error: emailError });
      }
    } else if (status === 'rejected') {
      // Send rejection email
      const { error: emailError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: userProfile.email,
        subject: 'Membership Activation Request Rejected',
        react: MembershipActivationRejected({
          recipientName: userName,
          activationId: id,
          rejectionReason: rejection_reason || '',
        }),
        text: `Membership Activation Request Rejected

Dear ${userName},

We regret to inform you that your membership activation request has been rejected.

Activation Details:
- Activation ID: ${id}
- Rejection Reason: ${rejection_reason}

Please review the rejection reason and submit a new activation request with the correct payment proof if needed.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });

      if (emailError) {
        Logger.error('Failed to send rejection email', { error: emailError });
      }
    }

    return {
      success: true,
      message: `Membership activation request ${status} successfully`,
      activation: updatedActivation,
    };
  });

// Get user membership status
export const getUserMembershipStatus = authActionClient.action(
  async ({ ctx }) => {
    const { supabase, authUser } = ctx;

    // Check if membership is enabled globally
    const membershipEnabled = await isMembershipEnabled();

    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('is_founding_member, membership_expires_at')
      .eq('id', authUser.user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    // Check for pending activation requests
    const { data: pendingActivations } = await supabase
      .from('membership_activations')
      .select('id, created_at')
      .eq('user_id', authUser.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // Check if membership is active
    const isActive = isMembershipActive(
      profile.is_founding_member,
      profile.membership_expires_at,
    );

    // If membership is disabled globally, everyone has access
    const hasAccess = !membershipEnabled || isActive;
    const needsActivation =
      membershipEnabled && !isActive && !profile.is_founding_member;

    // Get annual fee for display
    const annualFee = await getMembershipAnnualFee();

    return {
      success: true,
      isFoundingMember: profile.is_founding_member,
      membershipExpiresAt: profile.membership_expires_at,
      hasAccess,
      needsActivation,
      isExpired: membershipEnabled && !isActive && !profile.is_founding_member,
      pendingActivations: pendingActivations || [],
      membershipEnabled,
      annualFee,
    };
  },
);

// Get all membership activations (Admin)
export const getAllMembershipActivations = adminActionClient
  .schema(getMembershipActivationsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { page, pageSize, status, search } = parsedInput;

    let query = supabase
      .from('membership_activations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // Get all activations first, then filter by search if needed
    const { data: allActivations, error, count } = await query;

    if (error) throw new Error(error.message);

    // If search is provided, filter by user details
    let filteredData = allActivations || [];
    if (search && allActivations) {
      const userIds = allActivations.map((a) => a.user_id);
      const { data: profiles } = await supabase
        .from('profile')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profiles) {
        const searchLower = search.toLowerCase();
        const matchingUserIds = profiles
          .filter(
            (p) =>
              p.first_name.toLowerCase().includes(searchLower) ||
              p.last_name.toLowerCase().includes(searchLower) ||
              p.email.toLowerCase().includes(searchLower),
          )
          .map((p) => p.id);

        filteredData = allActivations.filter((a) =>
          matchingUserIds.includes(a.user_id),
        );
      }
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const paginatedData = filteredData.slice(from, to);

    // Fetch user profiles for the paginated results
    const paginatedUserIds = paginatedData.map((a) => a.user_id);
    const { data: userProfiles } = await supabase
      .from('profile')
      .select('id, first_name, last_name, email')
      .in('id', paginatedUserIds);

    // Fetch approved_by profiles if needed
    const approvedByIds = paginatedData
      .map((a) => a.approved_by)
      .filter((id): id is string => !!id);
    const { data: approvedByProfiles } = approvedByIds.length
      ? await supabase
          .from('profile')
          .select('id, first_name, last_name')
          .in('id', approvedByIds)
      : { data: null };

    // Combine data
    const enrichedData = paginatedData.map((activation) => {
      const user = userProfiles?.find((p) => p.id === activation.user_id);
      const approvedBy = approvedByProfiles?.find(
        (p) => p.id === activation.approved_by,
      );
      return {
        ...activation,
        user: user
          ? {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
            }
          : null,
        approved_by_user: approvedBy
          ? {
              id: approvedBy.id,
              first_name: approvedBy.first_name,
              last_name: approvedBy.last_name,
            }
          : null,
      };
    });

    return {
      success: true,
      data: enrichedData,
      pagination: {
        page,
        pageSize,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / pageSize),
      },
    };
  });
