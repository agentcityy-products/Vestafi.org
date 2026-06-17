'use server';

import { z } from 'zod';

import {
  applicationFormSchema,
  determineCategory,
} from '@/schema/applications';
import { createReferralRecord } from '@/actions/referrals';

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
import { ApplicationInsert, ApplicationUpdate } from '@/types/dao';

// Helper function to upsert application data
// Uses admin client to bypass RLS for public form submissions
async function upsertApplicationData(
  email: string,
  data: Partial<z.infer<typeof applicationFormSchema>>,
) {
  const supabase = await createSupabaseAdminClient();

  // Check if application exists
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('email', email)
    .single();

  // Build update data - use country directly (full country name)
  const updateData: ApplicationUpdate = {
    ...data,
    country: data.country || 'Uganda', // Use full country name, default to Uganda
    savings: data.savings || '', // Required field in DB
    why_vestafi: data.why_vestafi || [], // Required field in DB
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    // Update existing application
    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', existing.id);

    if (error) throw new Error(error.message);

    return existing.id;
  } else {
    // Create new application
    if (!data.full_name) {
      throw new Error('Full name is required');
    }

    const insertData: ApplicationInsert = {
      email,
      full_name: data.full_name,
      phone: data.phone || '',
      phone_country_code: data.phone_country_code || 'UG',
      country: data.country || 'Uganda', // Use full country name
      savings: data.savings || '',
      why_vestafi: data.why_vestafi || [],
      ...updateData,
    };

    // Remove location if it exists (we only use country now)
    if ('location' in insertData) {
      delete insertData.location;
    }

    const { data: newApp, error } = await supabase
      .from('applications')
      .insert(insertData)
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    return newApp.id;
  }
}

// Save Section 1: Personal Information
export const savePersonalInfo = safeActionClient
  .schema(
    z.object({
      email: z.string().email(),
      full_name: z.string().min(2),
      phone: z.string().min(1),
      phone_country_code: z.string().min(1),
      country: z.string().min(1),
      age_range: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { email, ...data } = parsedInput;

    const applicationId = await upsertApplicationData(email, data);

    return {
      success: true,
      applicationId,
      message: 'Personal information saved',
    };
  });

// Save Section 2: Financial Identity
export const saveFinancialIdentity = safeActionClient
  .schema(
    z.object({
      email: z.string().email(),
      monthly_income: z.string().min(1),
      contribution_capacity: z.string().min(1),
      contribution_frequency: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { email, ...data } = parsedInput;

    const applicationId = await upsertApplicationData(email, data);

    return {
      success: true,
      applicationId,
      message: 'Financial identity saved',
    };
  });

// Save Section 3: Goals & Mindset
export const saveGoalsMindset = safeActionClient
  .schema(
    z.object({
      email: z.string().email(),
      goals: z.array(z.string()).min(1),
      investment_timeline: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { email, ...data } = parsedInput;

    const applicationId = await upsertApplicationData(email, data);

    return {
      success: true,
      applicationId,
      message: 'Goals & mindset saved',
    };
  });

// Save Section 4: Behavior & Trust
export const saveBehaviorTrust = safeActionClient
  .schema(
    z.object({
      email: z.string().email(),
      webinar_willing: z.boolean(),
      joining_as: z.string().min(1),
      referral_source: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { email, ...data } = parsedInput;

    const applicationId = await upsertApplicationData(email, data);

    return {
      success: true,
      applicationId,
      message: 'Behavior & trust saved',
    };
  });

export const submitApplication = safeActionClient
  .schema(applicationFormSchema)
  .action(async ({ parsedInput }) => {
    // Use admin client to bypass RLS for public form submissions
    const supabase = await createSupabaseAdminClient();

    // Determine category based on contribution capacity
    const category = determineCategory(parsedInput.contribution_capacity);

    // Prepare application data
    // Use country directly (full country name)
    const applicationData: ApplicationInsert = {
      ...parsedInput,
      country: parsedInput.country || 'Uganda', // Use full country name
      savings: parsedInput.savings || '', // Required in DB
      why_vestafi: parsedInput.why_vestafi || [], // Required in DB
      category,
      status: category === 1 ? ('rejected' as const) : ('pending' as const),
    };

    // Check if application already exists (from progress saving)
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('email', parsedInput.email)
      .single();

    let applicationId: string;

    if (existing) {
      // If application is already approved, don't allow updates
      if (existing.status === 'approved') {
        throw new Error(
          'APPLICATION_ALREADY_APPROVED: This email address has already been approved. You cannot resubmit an application that has already been approved.',
        );
      }

      // Update existing application (only if not approved)
      const { error } = await supabase
        .from('applications')
        .update({
          ...applicationData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      applicationId = existing.id;
    } else {
      // Insert new application
      const { data: newApp, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      applicationId = newApp.id;
    }

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
    if (category === 3) {
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
