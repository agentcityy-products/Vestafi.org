import { NextRequest, NextResponse } from 'next/server';

import { resend } from '@/lib/resend';

import { appConfig } from '@/config/app';
import { MeetingInviteEmail } from '@/emails/meeting-invite-email';

interface TestEmailRequest {
  to: string;
  recipientName?: string;
  calendlyUrl?: string;
  phoneNumber?: string;
  companyName?: string;
  logoUrl?: string;
  supportEmail?: string;
}

export const POST = async (request: NextRequest) => {
  try {
    const body: TestEmailRequest = await request.json();

    // Validate required fields
    if (!body.to) {
      return NextResponse.json(
        { error: 'Email address (to) is required' },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 },
      );
    }

    // Send test email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${appConfig.title} <${appConfig.emails.sender}>`,
      to: [body.to],
      subject: `Your ${body.companyName || appConfig.title} Application - Next Steps`,
      react: MeetingInviteEmail({
        recipientName: body.recipientName,
        calendlyUrl: body.calendlyUrl,
        phoneNumber: body.phoneNumber,
        companyName: body.companyName,
        logoUrl: body.logoUrl,
        supportEmail: body.supportEmail,
      }),
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: emailError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: emailData?.id,
      sentTo: body.to,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};

// Optional: Add GET endpoint to show API documentation
export const GET = async () => {
  return NextResponse.json({
    message: 'Meeting Invite Email Test API',
    method: 'POST',
    endpoint: '/api/test-meeting-invite',
    description: 'Send a test meeting invite email with custom parameters',
    requiredFields: {
      to: 'string (email address) - REQUIRED',
    },
    optionalFields: {
      recipientName: 'string - Name of the recipient',
      calendlyUrl: 'string - Custom Calendly URL',
      phoneNumber: 'string - Custom phone number',
      companyName: 'string - Custom company name',
      logoUrl: 'string - Custom logo URL',
      supportEmail: 'string - Custom support email',
    },
    example: {
      to: 'test@example.com',
      recipientName: 'John Doe',
      calendlyUrl: 'https://calendly.com/custom-link',
      phoneNumber: '+1234567890',
      companyName: 'Test Company',
    },
  });
};
