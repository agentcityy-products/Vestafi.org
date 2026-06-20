'use server';

import {
  createInvestmentSchema,
  updateInvestmentStatusSchema,
} from '@/schema/investment';
import { processReferralReward } from '@/actions/referrals';

import { resend } from '@/lib/resend';
import { adminActionClient, authActionClient } from '@/lib/server/safe-action';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateContributionAgreementPDF } from '@/utils/contribution-agreement-pdf';
import { formatTimestamp } from '@/utils/date-functions';
import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';
import { generateInvestmentReceiptPDF } from '@/utils/pdf-receipt';
import { getFullName } from '@/utils/string-functions';
import { uploadToSupabase } from '@/utils/supabase-bucket';

import { appConfig, businessConfig } from '@/config/app';
import AdminInvestmentNotification from '@/emails/admin-investment-notification';
import { InvestmentApprovedEmail } from '@/emails/investment-approved-email';
import InvestmentConfirmationEmail from '@/emails/investment-confirmation-email';
import { InvestmentRejectedEmail } from '@/emails/investment-rejected-email';

/**
 * @deprecated This action is deprecated. All new investments should use the vault system.
 * Use deployFromVault action instead.
 * This is kept for backward compatibility only.
 */
export const createInvestment = authActionClient
  .schema(createInvestmentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { propertyId, amount, paymentProofs } = parsedInput;

    // Note: Direct investment flow is deprecated. Users should use vault system.
    // This check ensures payment proofs are provided for direct investments
    if (!paymentProofs || paymentProofs.length === 0) {
      throw new Error(
        'Direct investment requires payment proofs. Please use the vault system to deploy funds instead.',
      );
    }

    // must not allow investment if it is greater than the remaining amount
    const { data: listing, error: listingError } = await supabase
      .from('listings_view')
      .select('*')
      .eq('id', propertyId)
      .single();
    if (listingError) throw new Error(listingError.message);
    const availableShares = listing.price! - (listing.total_investment || 0);

    if (availableShares < amount) {
      throw new Error(
        'Contribution amount is greater than the remaining amount',
      );
    }
    if (
      availableShares > businessConfig.minInvestmentAmount &&
      amount < businessConfig.minInvestmentAmount
    ) {
      throw new Error(
        `Contribution amount must be greater than ${formatCurrency(
          businessConfig.minInvestmentAmount,
        )}`,
      );
    }
    Logger.info('Creating contribution', {
      propertyId,
      amount,
      paymentProofs,
    });

    const transactionId = crypto.randomUUID();
    // Generate pending PDF receipt
    const pdfBytes = await generateInvestmentReceiptPDF({
      investorName: `${authUser.user.user_metadata.first_name} ${authUser.user.user_metadata.last_name}`,
      investmentAmount: amount,
      propertyTitle: listing.title!,
      propertyLocation: [
        listing.address_line_1,
        listing.address_line_2,
        listing.city,
        listing.state,
        listing.zip_code,
        listing.country,
      ]
        .filter(Boolean)
        .join(', '),
      investmentDate: formatTimestamp(new Date()),
      transactionId,
      status: 'pending',
    });

    // Upload to Supabase Storage
    const fileName = `${authUser.user.id}/${propertyId}/receipt-pending_${Date.now()}.pdf`;
    const { url: receiptUrl, error: uploadError } = await uploadToSupabase(
      Buffer.from(pdfBytes),
      fileName,
      'investment-receipts',
      'application/pdf',
    );
    if (uploadError) throw new Error('error here' + uploadError.message);

    const { data: investment, error: investmentError } = await supabase
      .from('investment')
      .insert({
        property_id: propertyId,
        amount,
        user_id: authUser.user.id,
        proof_images: paymentProofs,
        receipt_url: receiptUrl,
        id: transactionId,
      })
      .select('*, user:user_id(*)')
      .single();
    if (investmentError) throw new Error(investmentError.message);
    Logger.info('Contribution created', {
      investment,
    });
    const propertyLocation = [
      listing.address_line_1,
      listing.address_line_2,
      listing.city,
      listing.state,
      listing.zip_code,
      listing.country,
    ]
      .filter(Boolean)
      .join(', ');

    const investorName = `${investment.user.first_name} ${investment.user.last_name}`;
    const investmentDate = formatTimestamp(investment.created_at);
    Logger.info('Sending admin email', {
      investorName,
      investorEmail: authUser.user.email!,
      investmentAmount: amount,
      propertyTitle: listing.title!,
      propertyLocation,
    });
    // Send admin email (no attachment needed)
    const { error: adminEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: appConfig.emails.admin,
      subject: 'New Contribution',
      react: AdminInvestmentNotification({
        investorName,
        investorEmail: authUser.user.email!,
        investmentAmount: amount,
        propertyTitle: listing.title!,
        propertyLocation,
        investmentDate,
        transactionId,
      }),
      text: `New Contribution

A new contribution has been made on ${appConfig.title}.

Investor Details:
- Name: ${investorName}
- Email: ${authUser.user.email!}  
- Contribution Amount: ${formatCurrency(amount)}
- Property Title: ${listing.title!}
- Property Location: ${propertyLocation}
- Contribution Date: ${investmentDate}
- Transaction ID: ${transactionId}

Please review this contribution in the admin dashboard.`,
    });
    if (adminEmailError) throw new Error(adminEmailError.message);
    Logger.info('Admin email sent', {
      investorName,
      investorEmail: authUser.user.email!,
      investmentAmount: amount,
      propertyTitle: listing.title!,
      propertyLocation,
    });
    const { error: userEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: authUser.user.email!,
      subject: 'Contribution Confirmation',
      react: InvestmentConfirmationEmail({
        recipientName: investorName,
        investmentAmount: amount,
        propertyTitle: listing.title!,
        propertyLocation,
        investmentDate,
        transactionId,
      }),
      text: `Contribution Confirmation

Dear ${investorName},

Thank you for your contribution in ${listing.title!}.

Contribution Details:
- Amount: ${formatCurrency(amount)}
- Property: ${listing.title!}
- Location: ${propertyLocation}
- Date: ${investmentDate}
- Transaction ID: ${transactionId}

Your contribution is currently pending review. You will receive another email once your contribution has been approved.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      attachments: [
        {
          filename: `contribution-receipt-pending-${transactionId}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });
    if (userEmailError) throw new Error(userEmailError.message);

    return {
      success: true,
      message: 'Contribution created successfully',
    };
  });

export const updateInvestmentStatus = adminActionClient
  .schema(updateInvestmentStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { id, status } = parsedInput;
    const adminSupabase = await createSupabaseAdminClient();

    await adminSupabase.rpc('expire_ownership_reservations');

    const { data: pendingInvestment, error: pendingInvestmentError } =
      await adminSupabase
        .from('investment')
        .select('reservation_id')
        .eq('id', id)
        .single();
    if (pendingInvestmentError) {
      throw new Error(pendingInvestmentError.message);
    }

    if (status === 'successful' && pendingInvestment.reservation_id) {
      const { data: reservation, error: reservationError } = await adminSupabase
        .from('ownership_reservations')
        .select('status, expires_at')
        .eq('id', pendingInvestment.reservation_id)
        .single();
      if (reservationError) throw new Error(reservationError.message);
      if (
        reservation.status === 'expired' ||
        new Date(reservation.expires_at) <= new Date()
      ) {
        throw new Error(
          'This seven-day reservation has expired and cannot be approved.',
        );
      }
    }

    let receiptUrl: string | undefined = undefined;
    let pdfBytes: Uint8Array | undefined = undefined;

    if (status === 'successful') {
      // Get investment details with user and property info
      const { data: investmentData, error: investmentError } = await supabase
        .from('investment')
        .select('*, property:property_id(*), user:user_id(*)')
        .eq('id', id)
        .single();
      if (investmentError) throw new Error(investmentError.message);

      const propertyLocation = [
        investmentData.property.address_line_1,
        investmentData.property.address_line_2,
        investmentData.property.city,
        investmentData.property.state,
        investmentData.property.zip_code,
        investmentData.property.country,
      ]
        .filter(Boolean)
        .join(', ');

      // Generate PDF receipt
      pdfBytes = await generateInvestmentReceiptPDF({
        investorName: `${investmentData.user.first_name} ${investmentData.user.last_name}`,
        investmentAmount: investmentData.amount,
        propertyTitle: investmentData.property.title,
        propertyLocation,
        investmentDate: formatTimestamp(investmentData.created_at),
        transactionId: investmentData.id,
        status: 'successful',
      });

      // Upload to Supabase Storage
      const fileName = `${investmentData.user.id}/${investmentData.property.id}/receipt-${investmentData.id}_${Date.now()}.pdf`;
      const { url, error: uploadError } = await uploadToSupabase(
        Buffer.from(pdfBytes),
        fileName,
        'investment-receipts',
        'application/pdf',
      );
      if (uploadError) throw new Error(uploadError.message);

      receiptUrl = url;
    }

    const { data, error } = await supabase
      .from('investment')
      .update({
        status,
        updated_at: new Date().toISOString(),
        receipt_url: receiptUrl,
      })
      .eq('id', id)
      .select('*, property:property_id(*), user:user_id(*)')
      .single();
    if (error) throw new Error(error.message);

    if (data.reservation_id) {
      const { error: reservationUpdateError } = await adminSupabase
        .from('ownership_reservations')
        .update({
          status: status === 'successful' ? 'completed' : 'rejected',
          completed_at:
            status === 'successful' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.reservation_id);
      if (reservationUpdateError) {
        throw new Error(reservationUpdateError.message);
      }
    }

    const propertyLocation = [
      data.property.address_line_1,
      data.property.address_line_2,
      data.property.city,
      data.property.state,
      data.property.zip_code,
      data.property.country,
    ]
      .filter(Boolean)
      .join(', ');

    const investorName = getFullName(data.user.first_name, data.user.last_name);
    const investmentAmount = data.amount;
    const investmentDate = formatTimestamp(data.created_at);
    const transactionId = data.id;
    const propertyTitle = data.property.title;

    if (status === 'successful') {
      // Sync ownership ledger for exit window (admin client to bypass RLS)
      const { error: movementError } = await adminSupabase
        .from('property_ownership_movements')
        .insert({
          property_id: data.property.id,
          user_id: data.user.id,
          amount_delta: data.amount,
          reason: 'primary_investment',
          ref_id: data.id,
        });
      if (movementError) {
        Logger.error('Failed to sync ownership movement (exit window ledger)', {
          error: movementError.message,
          investmentId: data.id,
        });
      }

      // Generate personalized contribution agreement PDF; on failure send email without it and do not fail the contribution
      const agreementPdfBuffer = await generateContributionAgreementPDF({
        fullName: investorName,
        email: data.user.email ?? '',
        phone: data.user.phone ?? 'N/A',
        contributionAmount: investmentAmount,
        propertyTitle,
        propertyDetails: propertyLocation,
        propertyId: data.property.id,
        contributionDate: investmentDate,
      });

      const attachments: { filename: string; content: Buffer }[] = [];
      if (pdfBytes) {
        attachments.push({
          filename: `contribution-receipt-${transactionId}.pdf`,
          content: Buffer.from(pdfBytes),
        });
      }
      if (agreementPdfBuffer) {
        const safeLastName = (data.user.last_name ?? 'agreement')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '');
        const dateStr = new Date().toISOString().slice(0, 10);
        attachments.push({
          filename: `vestafi-contribution-agreement-${safeLastName}-${dateStr}.pdf`,
          content: agreementPdfBuffer,
        });
      }

      const { error: userEmailError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: data.user.email!,
        subject: 'Contribution Confirmation',
        react: InvestmentApprovedEmail({
          recipientName: investorName,
          investmentAmount,
          propertyTitle,
          propertyLocation,
          investmentDate,
          transactionId,
        }),
        text: `Contribution Approved

Dear ${investorName},

Great news! Your contribution has been approved.

Contribution Details:
- Amount: ${formatCurrency(investmentAmount)}
- Property: ${propertyTitle}
- Location: ${propertyLocation}
- Date: ${investmentDate}
- Transaction ID: ${transactionId}

Please reply to this email confirming receipt. Your reply will act as your digital signature.

You can now view your contribution details in your dashboard.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
        ...(attachments.length > 0 && { attachments }),
      });
      if (userEmailError) throw new Error(userEmailError.message);

      // Process referral reward when referee's bank transfer investment is approved
      // This ensures the referrer only gets paid when money is locked in a property
      await processReferralReward(data.user.id);
    } else {
      const { error: userEmailError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: data.user.email!,
        subject: 'Contribution Rejected',
        react: InvestmentRejectedEmail({
          recipientName: investorName,
          investmentAmount,
          propertyTitle,
          propertyLocation,
          submissionDate: investmentDate,
          transactionId,
        }),
        text: `Contribution Rejected

Dear ${investorName},

We regret to inform you that your contribution has been rejected.

Contribution Details:
- Amount: ${formatCurrency(investmentAmount)}
- Property: ${propertyTitle}
- Location: ${propertyLocation}
- Date: ${investmentDate}
- Transaction ID: ${transactionId}

If you have any questions about this decision, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });
      if (userEmailError) throw new Error(userEmailError.message);
    }
    return data;
  });

/**
 * Total current stakes (ownership) from the ledger across all properties.
 * Includes direct investments and exit-window acquisitions. Used for listing access and display.
 */
export const getTotalInvested = async (): Promise<number> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    throw new Error(userError?.message || 'User not found');

  const { data, error } = await supabase
    .from('property_ownership_movements')
    .select('amount_delta')
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  const total = (data || []).reduce(
    (sum, row) => sum + Number(row.amount_delta),
    0,
  );
  return total;
};

export type StakeType = 'direct' | 'acquired' | 'both' | 'pending';

export type InvestmentDisplayStatus = 'pending' | 'successful' | 'rejected';

export type MyStakeRow = {
  property_id: string;
  property: {
    id: string;
    title: string | null;
    images: string[] | null;
    city: string | null;
    country: string | null;
    price: number;
  };
  amount: number;
  type: StakeType;
  /** Investment outcome for contributions UI (ledger stakes are successful). */
  status: InvestmentDisplayStatus;
  date: string;
  receipt_url?: string | null;
};

/**
 * Returns the current user's stakes: ledger-based ownership (direct/acquired) plus pending investments.
 * Used by the contributions table to show Property, Amount, Type, Status, Date.
 */
export const getMyStakes = async (): Promise<MyStakeRow[]> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    throw new Error(userError?.message || 'User not found');

  const [movementsRes, pendingRejectedRes] = await Promise.all([
    supabase
      .from('property_ownership_movements')
      .select(
        'property_id, amount_delta, reason, created_at, property(id, title, images, city, country, price)',
      )
      .eq('user_id', user.id),
    supabase
      .from('investment')
      .select(
        'id, property_id, amount, created_at, receipt_url, status, property:property_id(id, title, images, city, country, price)',
      )
      .eq('user_id', user.id)
      .in('status', ['pending', 'rejected']),
  ]);

  if (movementsRes.error) throw new Error(movementsRes.error.message);
  if (pendingRejectedRes.error)
    throw new Error(pendingRejectedRes.error.message);

  const movements = movementsRes.data ?? [];
  const pendingAndRejected = pendingRejectedRes.data ?? [];

  const byProperty = new Map<
    string,
    {
      amount: number;
      hasDirect: boolean;
      hasAcquired: boolean;
      latestAt: string;
      property: MyStakeRow['property'];
    }
  >();

  for (const m of movements) {
    const prop = m.property as MyStakeRow['property'] | null;
    if (!prop || typeof m.property_id !== 'string') continue;
    const existing = byProperty.get(m.property_id);
    const amount = Number((m as { amount_delta?: number }).amount_delta ?? 0);
    const reason = (m as { reason?: string }).reason ?? '';
    const at = (m as { created_at?: string }).created_at ?? '';

    if (existing) {
      existing.amount += amount;
      if (reason === 'primary_investment') existing.hasDirect = true;
      if (reason === 'secondary_trade') existing.hasAcquired = true;
      if (at > existing.latestAt) existing.latestAt = at;
    } else {
      byProperty.set(m.property_id, {
        amount,
        hasDirect: reason === 'primary_investment',
        hasAcquired: reason === 'secondary_trade',
        latestAt: at,
        property: { ...prop, id: m.property_id },
      });
    }
  }

  const stakes: MyStakeRow[] = [];

  for (const [, agg] of byProperty) {
    if (agg.amount <= 0) continue;
    const type: StakeType =
      agg.hasDirect && agg.hasAcquired
        ? 'both'
        : agg.hasDirect
          ? 'direct'
          : 'acquired';
    stakes.push({
      property_id: agg.property.id,
      property: agg.property,
      amount: agg.amount,
      type,
      status: 'successful',
      date: agg.latestAt,
    });
  }

  for (const inv of pendingAndRejected) {
    const prop = inv.property as MyStakeRow['property'] | null;
    const propertyId = (inv as { property_id?: string }).property_id;
    const invStatus = (inv as { status?: string }).status;
    if (!prop || !propertyId) continue;
    const isRejected = invStatus === 'rejected';
    stakes.push({
      property_id: propertyId,
      property: {
        id: prop.id ?? propertyId,
        title: prop.title ?? null,
        images: prop.images ?? null,
        city: prop.city ?? null,
        country: prop.country ?? null,
        price: prop.price ?? 0,
      },
      amount: Number((inv as { amount?: number }).amount ?? 0),
      type: 'pending',
      status: isRejected ? 'rejected' : 'pending',
      date: (inv as { created_at?: string }).created_at ?? '',
      receipt_url: (inv as { receipt_url?: string | null }).receipt_url ?? null,
    });
  }

  stakes.sort((a, b) => (b.date > a.date ? 1 : -1));
  return stakes;
};
