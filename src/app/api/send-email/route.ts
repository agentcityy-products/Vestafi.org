import { subHours } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

import { resend } from '@/lib/resend';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

import { appConfig } from '@/config/app';
import { MeetingInviteEmail } from '@/emails/meeting-invite-email';
import { env } from '@/env';

const isAuthorized = (request: NextRequest) => {
  const authorization = request.headers.get('authorization');
  const expected = `Bearer ${env.CRON_SECRET}`;

  if (!authorization || authorization.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(authorization), Buffer.from(expected));
};

export const GET = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createSupabaseAdminClient();

    // Calculate timestamp for 1 hour ago
    const oneHourAgo = subHours(new Date(), 1).toISOString();

    // Fetch applications that:
    // 1. Were created more than 30 minutes ago
    // 2. Have meeting_link_sent as false
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('meeting_link_sent', false)
      .lt('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    console.log(data);

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No applications found to send emails to',
        emailsSent: 0,
        emailsFailed: 0,
      });
    }

    // Use batch API to send all emails in a single request (avoids 2/sec rate limit)
    const emails = data.map((application) => ({
      from: `${appConfig.title} <${appConfig.emails.sender}>`,
      to: [application.email],
      subject: `Your ${appConfig.title} Journey - Let's Talk`,
      react: MeetingInviteEmail({
        recipientName: application.full_name,
      }),
    }));

    const { data: batchResult, error: batchError } =
      await resend.batch.send(emails);

    // Process results and update database for successful sends
    const successfulApplicationIds: string[] = [];
    const finalResults: {
      email: string;
      status: string;
      emailId?: string;
      error?: string;
    }[] = [];
    let emailsSent = 0;
    let emailsFailed = 0;

    if (batchError) {
      // All emails failed
      emailsFailed = data.length;
      data.forEach((application) => {
        finalResults.push({
          email: application.email,
          status: 'failed',
          error: batchError.message,
        });
      });
    } else if (batchResult) {
      // Process individual results from batch
      batchResult.data.forEach((result, index) => {
        const application = data[index];
        if (result.id) {
          successfulApplicationIds.push(application.id);
          finalResults.push({
            email: application.email,
            status: 'success',
            emailId: result.id,
          });
          emailsSent++;
        } else {
          finalResults.push({
            email: application.email,
            status: 'failed',
          });
          emailsFailed++;
        }
      });
    }

    console.log(finalResults);

    // Update meeting_link_sent flag for all successful emails in a single query
    if (successfulApplicationIds.length > 0) {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ meeting_link_sent: true })
        .in('id', successfulApplicationIds);

      if (updateError) {
        console.error('Failed to update applications:', updateError);
        // Mark the successful emails as having update issues
        finalResults.forEach((result) => {
          if (result.status === 'success') {
            result.status = 'email_sent_but_update_failed';
            result.error = updateError.message;
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Email sending completed. ${emailsSent} sent, ${emailsFailed} failed.`,
      emailsSent,
      emailsFailed,
      totalApplications: data.length,
      results: finalResults,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};
