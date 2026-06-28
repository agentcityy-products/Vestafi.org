'use server';

import { z } from 'zod';

import {
  applicationFormSchema,
  determineCategory,
} from '@/schema/applications';

import { resend } from '@/lib/resend';
import {
  safeActionClient,
  serviceRoleActionClient,
} from '@/lib/server/safe-action';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatTimestamp } from '@/utils/date-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import AdminApplicationNotification from '@/emails/admin-application-notification';
import AdminCategory3Notification from '@/emails/admin-category-3-notification';
import ApplicantEliteCircleCallEmail from '@/emails/applicant-elite-circle-call-email';
import ApplicantInviteEmail from '@/emails/applicant-invite-email';
import ApplicantRejectionEmail from '@/emails/applicant-rejection-email';
import ApplicantSubmitEmail from '@/emails/applicant-submit-email';

// import { Database } from '@/types/supabase';
import { ApplicationInsert, ReferralInsert } from '@/types/dao';

async function createReferralRecord(
  applicationId: string,
  applicationEmail: string,
  referredByCode: string,
  category: number,
): Promise<void> {
  if (category < 2) return;

  const supabase = await createSupabaseAdminClient();
  const { data: application } = await supabase
    .from('applications')
    .select('id, email')
    .eq('id', applicationId)
    .eq('email', applicationEmail)
    .single();

  if (!application) return;

  const { data: referrer } = await supabase
    .from('profile')
    .select('id, email')
    .eq('referral_code', referredByCode)
    .maybeSingle();

  if (
    !referrer ||
    referrer.email.toLowerCase() === applicationEmail.toLowerCase()
  ) {
    return;
  }

  const referralData: ReferralInsert = {
    referrer_id: referrer.id,
    application_id: application.id,
    referee_id: null,
    referral_code: referredByCode.toLowerCase(),
    status: 'pending',
  };

  const { error } = await supabase.from('referrals').insert(referralData);
  if (error && error.code !== '23505') {
    console.error('Failed to create referral record:', error);
  }
}

async function getMarketplaceAutoApprovalMode() {
  const supabase = await createSupabaseAdminClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'marketplace_auto_approval_mode')
    .maybeSingle();

  return typeof data?.value === 'string' ? data.value : 'prime-only';
}

export const submitApplication = safeActionClient
  .schema(applicationFormSchema)
  .action(async ({ parsedInput }) => {
    // Use admin client to bypass RLS for public form submissions
    const supabase = await createSupabaseAdminClient();

    // Determine category based on contribution capacity
    const category = determineCategory(parsedInput.contribution_capacity);
    const autoApprovalMode = await getMarketplaceAutoApprovalMode();
    const shouldAutoApprove =
      category !== 1 &&
      (autoApprovalMode === 'all' ||
        (autoApprovalMode === 'prime-only' &&
          parsedInput.preferred_ownership_path === 'prime'));

    // Prepare application data
    // Use country directly (full country name)
    const applicationData: ApplicationInsert = {
      ...parsedInput,
      country: parsedInput.country || 'Uganda', // Use full country name
      savings: parsedInput.savings || '', // Required in DB
      why_vestafi: parsedInput.why_vestafi || [], // Required in DB
      category,
      status:
        category === 1
          ? ('rejected' as const)
          : shouldAutoApprove
            ? ('approved' as const)
            : ('pending' as const),
    };

    // Public submissions are insert-only. Never let possession of an email
    // address authorize updates to an existing application.
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('email', parsedInput.email)
      .maybeSingle();

    if (existing) {
      throw new Error(
        'APPLICATION_ALREADY_EXISTS: This email address has already been used for an application.',
      );
    }

    const { data: newApp, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    const applicationId = newApp.id;

    // Handle Category 1 (Rejected - below 1M UGX)
    if (category === 1) {
      // Send rejection email
      await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: parsedInput.email,
        subject: 'Thank you for your interest in VESTAFI',
        react: ApplicantRejectionEmail({
          logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
          supportEmail: appConfig.emails.support,
          companyName: appConfig.title,
          recipientName: parsedInput.full_name,
        }),
        text: `Thank you for your interest in ${appConfig.title}.

Unfortunately, we are unable to proceed with your application at this time. We appreciate your interest and encourage you to reach out again in the future.

If you have any questions, please contact us at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });

      return {
        success: true,
        category: 1,
        rejected: true,
        message: 'Application processed',
      };
    }

    // Handle Category 3 (Elite Circle - $3,500+)
    if (category === 3 && !shouldAutoApprove) {
      // Send call scheduling email to user
      await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: parsedInput.email,
        subject: "Welcome to VESTAFI Elite Circle - Let's Schedule a Call",
        react: ApplicantEliteCircleCallEmail({
          logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
          supportEmail: appConfig.emails.support,
          companyName: appConfig.title,
          recipientName: parsedInput.full_name,
        }),
        text: `Welcome to ${appConfig.title} Elite Circle!

A member of our team will contact you shortly to schedule a personalized onboarding call. We're excited to have you join our exclusive community.

If you have any questions, please contact us at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });

      // Send admin notification for Category 3
      await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: appConfig.emails.admin,
        subject: '🚨 Elite Circle Application - Category 3 Candidate',
        react: AdminCategory3Notification({
          logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
          companyName: appConfig.title,
          applicationData: parsedInput,
          category: 3,
          submittedAt: formatTimestamp(new Date()),
        }),
        text: `Elite Circle Application - Category 3 Candidate

A high-value candidate has submitted an application to ${appConfig.title}.

Applicant Details:
- Name: ${parsedInput.full_name}
- Email: ${parsedInput.email}
- Phone: ${parsedInput.phone}
- Category: 3 (Elite Circle)
- Contribution Capacity: ${parsedInput.contribution_capacity}

Submitted at: ${formatTimestamp(new Date())}

Please follow up with this candidate to schedule an onboarding call.`,
      });

      // Create referral record if referred_by exists
      if (parsedInput.referred_by) {
        console.log('Creating referral record for Category 3');
        await createReferralRecord(
          applicationId,
          parsedInput.email,
          parsedInput.referred_by,
          category,
        );
      }

      return {
        success: true,
        category: 3,
        message: 'Application submitted - Elite Circle candidate',
      };
    }

    if (shouldAutoApprove) {
      const { error: createUserError } = await supabase.auth.admin.createUser({
        email: parsedInput.email,
        email_confirm: true,
        user_metadata: {
          full_name: parsedInput.full_name,
          preferred_ownership_path: parsedInput.preferred_ownership_path,
        },
      });

      if (
        createUserError &&
        !createUserError.message.toLowerCase().includes('already')
      ) {
        throw new Error(createUserError.message);
      }

      await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: parsedInput.email,
        subject: `Welcome to ${appConfig.title} - Your Application is Approved!`,
        react: ApplicantInviteEmail({
          logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
          supportEmail: appConfig.emails.support,
          companyName: appConfig.title,
          recipientName: parsedInput.full_name,
          loginUrl: `${appConfig.appUrl}${paths.auth.login}`,
        }),
        text: `Welcome to ${appConfig.title} - Your Application is Approved!

Your application has been approved. You can now login and enter the Vestafi apartment marketplace.

Login URL: ${appConfig.appUrl}${paths.auth.login}

Best regards,
The ${appConfig.title} Team`,
      });

      await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: appConfig.emails.admin,
        subject: 'Prime Applicant Auto-Approved',
        react: AdminApplicationNotification({
          logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
          companyName: appConfig.title,
          applicationData: parsedInput,
          submittedAt: formatTimestamp(new Date()),
        }),
        text: `Prime Applicant Auto-Approved

Applicant Details:
- Name: ${parsedInput.full_name}
- Email: ${parsedInput.email}
- Phone: ${parsedInput.phone}
- Preferred Path: ${parsedInput.preferred_ownership_path}
- Category: ${category || 'Not determined'}

The applicant was auto-approved based on the current marketplace setting.`,
      });

      if (category && category >= 2 && parsedInput.referred_by) {
        await createReferralRecord(
          applicationId,
          parsedInput.email,
          parsedInput.referred_by,
          category,
        );
      }

      return {
        success: true,
        category: category || 2,
        approved: true,
        message: 'Application approved automatically',
      };
    }

    // Handle Category 2 (Regular - $500-$3,500)
    // Send regular submission email
    await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: parsedInput.email,
      subject: 'Application Submitted',
      react: ApplicantSubmitEmail({
        logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
        supportEmail: appConfig.emails.support,
        companyName: appConfig.title,
        responseTimeframe: '24 hours',
      }),
      text: `Thank you for submitting your application to ${appConfig.title}!

We have received your application and will review it within 24 hours. You will receive an email notification once your application has been reviewed.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
    });

    // Send admin notification
    await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: appConfig.emails.admin,
      subject: 'New Application Submitted',
      react: AdminApplicationNotification({
        logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
        companyName: appConfig.title,
        applicationData: parsedInput,
        submittedAt: formatTimestamp(new Date()),
      }),
      text: `New Application Submitted

A new application has been submitted to ${appConfig.title}.

Applicant Details:
- Name: ${parsedInput.full_name}
- Email: ${parsedInput.email}
- Phone: ${parsedInput.phone}
- Category: ${category || 'Not determined'}

Submitted at: ${formatTimestamp(new Date())}

Please review this application in the admin dashboard.`,
    });

    // Create referral record if Category 2+ and referred_by exists
    if (category && category >= 2 && parsedInput.referred_by) {
      console.log('Creating referral record');
      await createReferralRecord(
        applicationId,
        parsedInput.email,
        parsedInput.referred_by,
        category,
      );
    }

    return {
      success: true,
      category: category || 2,
      message: 'Application submitted successfully',
    };
  });

export const inviteUser = serviceRoleActionClient
  .schema(z.object({ applicationId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const { supabase } = ctx;
    const { applicationId } = parsedInput;

    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (applicationError) throw new Error(applicationError.message);

    const { error } = await supabase.auth.admin.createUser({
      email: application.email,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);

    const { error: emailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: application.email,
      subject: `Welcome to ${appConfig.title} - Your Application is Approved!`,
      react: ApplicantInviteEmail({
        logoUrl: `${appConfig.appUrl}${appConfig.logo}`,
        supportEmail: appConfig.emails.support,
        companyName: appConfig.title,
        recipientName: application.full_name,
        loginUrl: `${appConfig.appUrl}${paths.auth.login}`,
      }),
      text: `Welcome to ${appConfig.title} - Your Application is Approved!

Congratulations! Your application has been approved. You can now login to your account and start using the platform.

Login URL: ${appConfig.appUrl}${paths.auth.login}

Best regards,
The ${appConfig.title} Team`,
    });

    if (emailError) throw new Error(emailError.message);

    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    if (updateError) throw new Error(updateError.message);

    return {
      success: true,
      message: 'User invited to the platform',
    };
  });
