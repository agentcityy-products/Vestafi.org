'use server';

import {
  createWithdrawalRequestSchema,
  updateWithdrawalRequestSchema,
} from '@/schema/withdrawal-request';

import { resend } from '@/lib/resend';
import { adminActionClient, authActionClient } from '@/lib/server/safe-action';
import { formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';

import { appConfig } from '@/config/app';
import { AdminWithdrawalNotification } from '@/emails/admin-withdrawal-notification';
import { WithdrawalPaidNotification } from '@/emails/withdrawal-paid-notification';
import { WithdrawalRejectedNotification } from '@/emails/withdrawal-rejected-notification';
import { WithdrawalRequestConfirmation } from '@/emails/withdrawal-request-confirmation';

export const createWithdrawalRequest = authActionClient
  .schema(createWithdrawalRequestSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { amount } = parsedInput;
    const { data, error } = await supabase
      .from('withdrawal_request')
      .insert({ user_id: authUser.user.id, amount })
      .select('*, user:user_id(*)')
      .single();
    if (error) throw new Error(error.message);

    const { error: adminError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: appConfig.emails.admin,
      subject: 'Withdrawal Request Confirmation',
      react: AdminWithdrawalNotification({
        requestDate: data.created_at,
        requestId: data.id,
        withdrawalAmount: amount,
        userEmail: data.user.email,
        userName: getFullName(data.user.first_name, data.user.last_name),
      }),
      text: `New Withdrawal Request

A new withdrawal request has been submitted on ${appConfig.title}.

Request Details:
- Request ID: ${data.id}
- Amount: ${formatCurrency(amount)}
- User: ${getFullName(data.user.first_name, data.user.last_name)}
- Email: ${data.user.email}
- Date: ${formatTimestamp(data.created_at)}

Please review this withdrawal request in the admin dashboard.`,
    });
    if (adminError) throw new Error(adminError.message);

    const { error: userError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: data.user.email,
      subject: 'Withdrawal Request Confirmation',
      react: WithdrawalRequestConfirmation({
        requestDate: data.created_at,
        requestId: data.id,
        recipientName: getFullName(data.user.first_name, data.user.last_name),
        withdrawalAmount: amount,
      }),
      text: `Withdrawal Request Confirmation

Dear ${getFullName(data.user.first_name, data.user.last_name)},

We have received your withdrawal request.

Request Details:
- Request ID: ${data.id}
- Amount: ${formatCurrency(amount)}
- Date: ${formatTimestamp(data.created_at)}

Your request is currently being reviewed. You will receive another email once your withdrawal has been processed.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
    });
    if (userError) throw new Error(userError.message);
    return data;
  });

export const updateWithdrawalRequest = adminActionClient
  .schema(updateWithdrawalRequestSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { id, status, payment_proof_url, rejection_reason } = parsedInput;
    const { data, error } = await supabase
      .from('withdrawal_request')
      .update({
        status,
        payment_proof_url,
        rejection_reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, user:user_id(*)')
      .single();
    if (error) throw new Error(error.message);

    if (status === 'paid') {
      const { error: userError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: data.user.email,
        subject: 'Withdrawal Request Paid',
        react: WithdrawalPaidNotification({
          recipientName: getFullName(data.user.first_name, data.user.last_name),
          withdrawalAmount: data.amount,
          requestId: data.id,
          paidDate: data.updated_at,
        }),
        text: `Withdrawal Request Paid

Dear ${getFullName(data.user.first_name, data.user.last_name)},

Your withdrawal request has been processed and paid.

Request Details:
- Request ID: ${data.id}
- Amount: ${formatCurrency(data.amount)}
- Paid Date: ${formatTimestamp(data.updated_at)}

The funds have been transferred to your registered bank account. Please allow 1-3 business days for the funds to appear in your account.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });
      if (userError) throw new Error(userError.message);
    }
    if (status === 'rejected') {
      const { error: userError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: data.user.email,
        subject: 'Withdrawal Request Rejected',
        react: WithdrawalRejectedNotification({
          recipientName: getFullName(data.user.first_name, data.user.last_name),
          withdrawalAmount: data.amount,
          requestId: data.id,
          rejectedDate: data.updated_at,
          reason: rejection_reason,
        }),
        text: `Withdrawal Request Rejected

Dear ${getFullName(data.user.first_name, data.user.last_name)},

We regret to inform you that your withdrawal request has been rejected.

Request Details:
- Request ID: ${data.id}
- Amount: ${formatCurrency(data.amount)}
- Rejected Date: ${formatTimestamp(data.updated_at)}
- Reason: ${rejection_reason || 'No reason provided'}

If you have any questions about this decision, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });
      if (userError) throw new Error(userError.message);
    }
    return data;
  });
