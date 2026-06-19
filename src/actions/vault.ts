'use server';

import { z } from 'zod';

import {
  createVaultDepositSchema,
  createVaultWithdrawalSchema,
  deployFromVaultSchema,
  getVaultTransactionsSchema,
  updateVaultTransactionStatusSchema,
} from '@/schema/vault';
import { processReferralReward } from '@/actions/referrals';

import { resend } from '@/lib/resend';
import { adminActionClient, authActionClient } from '@/lib/server/safe-action';
import { getOrCreateUserVault } from '@/lib/server/vault';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateContributionAgreementPDF } from '@/utils/contribution-agreement-pdf';
import { formatTimestamp } from '@/utils/date-functions';
import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';
import {
  generateInvestmentReceiptPDF,
  generateVaultDepositReceiptPDF,
} from '@/utils/pdf-receipt';
import { getFullName } from '@/utils/string-functions';

import { appConfig, businessConfig } from '@/config/app';
import { AdminVaultDepositNotification } from '@/emails/admin-vault-deposit-notification';
import { VaultDeploymentConfirmation } from '@/emails/vault-deployment-confirmation';
import { VaultDepositApproved } from '@/emails/vault-deposit-approved';
import { VaultDepositRejected } from '@/emails/vault-deposit-rejected';
import { VaultDepositRequestConfirmation } from '@/emails/vault-deposit-request-confirmation';

import { VaultTransactionUpdate } from '@/types/dao';
// Create vault deposit
export const createVaultDeposit = authActionClient
  .schema(createVaultDepositSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { amount, proof_images } = parsedInput;

    // Validate minimum deposit amount
    if (amount < businessConfig.minVaultDeposit) {
      throw new Error(
        `Minimum deposit amount is ${formatCurrency(businessConfig.minVaultDeposit)}`,
      );
    }

    // Get or create user vault
    await getOrCreateUserVault(authUser.user.id);

    // Create vault transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('vault_transactions')
      .insert({
        user_id: authUser.user.id,
        type: 'deposit',
        amount,
        proof_images,
        status: 'pending',
      })
      .select('*')
      .single();

    if (transactionError) throw new Error(transactionError.message);

    // Get user details for emails
    const { data: userProfile, error: profileError } = await supabase
      .from('profile')
      .select('first_name, last_name, email')
      .eq('id', authUser.user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    const userName = getFullName(userProfile.first_name, userProfile.last_name);

    Logger.info('Vault deposit created', {
      userId: authUser.user.id,
      amount,
      transactionId: transaction.id,
    });

    // Send admin notification email
    const { error: adminEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: appConfig.emails.admin,
      subject: 'New Vault Deposit Request',
      react: AdminVaultDepositNotification({
        userName,
        userEmail: userProfile.email,
        depositAmount: amount,
        transactionId: transaction.id,
        requestDate: formatTimestamp(transaction.created_at),
      }),
      text: `New Vault Deposit Request

A new vault deposit request has been submitted on ${appConfig.title}.

Request Details:
- Transaction ID: ${transaction.id}
- Amount: ${formatCurrency(amount)}
- User: ${userName}
- Email: ${userProfile.email}
- Date: ${formatTimestamp(transaction.created_at)}

Please review this deposit request in the admin dashboard.`,
    });

    if (adminEmailError) {
      Logger.error('Failed to send admin email', { error: adminEmailError });
      // Don't throw, continue with user email
    }

    // Send user confirmation email
    const { error: userEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: userProfile.email,
      subject: 'Vault Deposit Request Confirmation',
      react: VaultDepositRequestConfirmation({
        recipientName: userName,
        depositAmount: amount,
        transactionId: transaction.id,
        requestDate: formatTimestamp(transaction.created_at),
      }),
      text: `Vault Deposit Request Confirmation

Dear ${userName},

We have received your vault deposit request.

Request Details:
- Transaction ID: ${transaction.id}
- Amount: ${formatCurrency(amount)}
- Date: ${formatTimestamp(transaction.created_at)}

Your request is currently being reviewed. You will receive another email once your deposit has been approved.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
    });

    if (userEmailError) {
      Logger.error('Failed to send user email', { error: userEmailError });
      // Don't throw, transaction is already created
    }

    return {
      success: true,
      message: 'Vault deposit request created successfully',
      transactionId: transaction.id,
    };
  });

// Deploy from vault to property
export const deployFromVault = authActionClient
  .schema(deployFromVaultSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { propertyId, amount } = parsedInput;

    // // Validate minimum deployment amount
    // if (amount < businessConfig.minVaultDeployment) {
    //   throw new Error(
    //     `Minimum deployment amount is ${formatCurrency(businessConfig.minVaultDeployment)}`,
    //   );
    // }

    // Get user vault
    const vault = await getOrCreateUserVault(authUser.user.id);

    // Check if user has sufficient balance
    if (vault.balance < amount) {
      throw new Error('Insufficient vault balance');
    }

    // Check property availability
    const { data: listing, error: listingError } = await supabase
      .from('listings_view')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (listingError) throw new Error(listingError.message);

    const availableShares = listing.price! - (listing.total_investment || 0);

    if (availableShares < amount) {
      throw new Error(
        'Deployment amount is greater than the remaining property shares',
      );
    }

    if (
      availableShares > businessConfig.minInvestmentAmount &&
      amount < businessConfig.minInvestmentAmount
    ) {
      throw new Error(
        `Deployment amount must be at least ${formatCurrency(businessConfig.minInvestmentAmount)}`,
      );
    }

    // Start transaction: Create vault transaction and investment
    const transactionId = crypto.randomUUID();

    // Create vault transaction (deployment)
    const { data: vaultTransaction, error: vaultTxError } = await supabase
      .from('vault_transactions')
      .insert({
        id: transactionId,
        user_id: authUser.user.id,
        type: 'deploy',
        amount,
        property_id: propertyId,
        status: 'approved',
      })
      .select('*')
      .single();

    if (vaultTxError) throw new Error(vaultTxError.message);

    // Create investment record
    const { data: investment, error: investmentError } = await supabase
      .from('investment')
      .insert({
        property_id: propertyId,
        amount,
        user_id: authUser.user.id,
        proof_images: [],
        status: 'successful',
        vault_transaction_id: transactionId,
      })
      .select('*, property:property_id(*), user:user_id(*)')
      .single();

    if (investmentError) {
      // Rollback: Delete vault transaction
      await supabase
        .from('vault_transactions')
        .delete()
        .eq('id', transactionId);
      throw new Error(investmentError.message);
    }

    const { data: capacityCheck, error: capacityError } = await supabase
      .from('listings_view')
      .select('price, total_investment')
      .eq('id', propertyId)
      .single();

    if (
      capacityError ||
      !capacityCheck ||
      Number(capacityCheck.total_investment) > Number(capacityCheck.price)
    ) {
      await supabase.from('investment').delete().eq('id', investment.id);
      await supabase
        .from('vault_transactions')
        .delete()
        .eq('id', transactionId);
      throw new Error(
        capacityError?.message ||
          'Property capacity changed while processing. Please retry.',
      );
    }

    // Update user vault balance
    const newBalance = vault.balance - amount;
    const newTotalDeployed = vault.total_deployed + amount;

    const { data: updatedVault, error: vaultUpdateError } = await supabase
      .from('user_vault')
      .update({
        balance: newBalance,
        total_deployed: newTotalDeployed,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authUser.user.id)
      .eq('balance', vault.balance)
      .gte('balance', amount)
      .select('user_id')
      .maybeSingle();

    if (vaultUpdateError || !updatedVault) {
      // Rollback: Delete both records
      await supabase.from('investment').delete().eq('id', investment.id);
      await supabase
        .from('vault_transactions')
        .delete()
        .eq('id', transactionId);
      throw new Error(
        vaultUpdateError?.message ||
          'Vault balance changed while processing. Please retry.',
      );
    }

    // Sync ownership ledger for exit window (admin client to bypass RLS)
    const adminSupabase = await createSupabaseAdminClient();
    const { error: movementError } = await adminSupabase
      .from('property_ownership_movements')
      .insert({
        property_id: propertyId,
        user_id: authUser.user.id,
        amount_delta: amount,
        reason: 'primary_investment',
        ref_id: investment.id,
      });
    if (movementError) {
      Logger.error('Failed to sync ownership movement (exit window ledger)', {
        error: movementError.message,
        investmentId: investment.id,
      });
    }

    // Process referral reward when referee successfully deploys to property
    // This ensures the referrer only gets paid when money is locked in a property
    Logger.info('Processing referral reward', {
      userId: authUser.user.id,
      propertyId,
      amount,
      transactionId,
    });
    await processReferralReward(authUser.user.id);

    Logger.info('Vault deployment successful', {
      userId: authUser.user.id,
      propertyId,
      amount,
      transactionId,
    });

    // Get user details for email
    const userName = getFullName(
      investment.user.first_name,
      investment.user.last_name,
    );

    const propertyLocation = [
      investment.property.address_line_1,
      investment.property.address_line_2,
      investment.property.city,
      investment.property.state,
      investment.property.zip_code,
      investment.property.country,
    ]
      .filter(Boolean)
      .join(', ');

    // Generate receipt PDF
    const receiptPdfBytes = await generateInvestmentReceiptPDF({
      investorName: userName,
      investmentAmount: amount,
      propertyTitle: investment.property.title,
      propertyLocation,
      investmentDate: formatTimestamp(investment.created_at),
      transactionId: investment.id,
      status: 'successful',
    });

    // Upload receipt to Supabase Storage using server client
    const receiptFileName = `${investment.user.id}/${investment.property.id}/receipt-${investment.id}_${Date.now()}.pdf`;

    const { data: uploadData, error: receiptUploadError } =
      await supabase.storage
        .from('investment-receipts')
        .upload(receiptFileName, Buffer.from(receiptPdfBytes), {
          contentType: 'application/pdf',
          upsert: true,
        });

    if (receiptUploadError) {
      Logger.error('Failed to upload receipt', { error: receiptUploadError });
      // Don't throw, deployment is successful but receipt upload failed
    } else {
      // Get public URL for the uploaded file
      const {
        data: { publicUrl: receiptUrl },
      } = supabase.storage
        .from('investment-receipts')
        .getPublicUrl(receiptFileName);

      // Update investment record with receipt URL
      const { error: receiptUpdateError } = await supabase
        .from('investment')
        .update({ receipt_url: receiptUrl })
        .eq('id', investment.id);

      if (receiptUpdateError) {
        Logger.error('Failed to update investment receipt URL', {
          error: receiptUpdateError,
        });
        // Don't throw, deployment is successful but receipt URL update failed
      } else {
        Logger.info('Investment receipt uploaded and saved successfully', {
          investmentId: investment.id,
          receiptUrl,
        });
      }

      // Also update vault_transactions record with receipt URL
      const { error: vaultTxReceiptUpdateError } = await supabase
        .from('vault_transactions')
        .update({
          receipt_url: receiptUrl,
        } as VaultTransactionUpdate & { receipt_url?: string | null })
        .eq('id', transactionId);

      if (vaultTxReceiptUpdateError) {
        Logger.error('Failed to update vault transaction receipt URL', {
          error: vaultTxReceiptUpdateError,
        });
        // Don't throw, deployment is successful but receipt URL update failed
      } else {
        Logger.info('Vault transaction receipt URL updated successfully', {
          transactionId,
          receiptUrl,
        });
      }
    }

    // Generate personalized contribution agreement PDF (or null on failure; do not fail the contribution)
    const agreementPdfBuffer = await generateContributionAgreementPDF({
      fullName: userName,
      email: investment.user.email ?? '',
      phone: investment.user.phone ?? 'N/A',
      contributionAmount: amount,
      propertyTitle: investment.property.title,
      propertyDetails: propertyLocation,
      propertyId: investment.property.id,
      contributionDate: formatTimestamp(investment.created_at),
    });

    const emailAttachments = [];
    if (receiptPdfBytes) {
      emailAttachments.push({
        filename: `contribution-receipt-${investment.id}.pdf`,
        content: Buffer.from(receiptPdfBytes),
      });
    }
    if (agreementPdfBuffer) {
      const safeLastName = (investment.user.last_name ?? 'agreement')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '');
      const dateStr = new Date().toISOString().slice(0, 10);
      emailAttachments.push({
        filename: `vestafi-contribution-agreement-${safeLastName}-${dateStr}.pdf`,
        content: agreementPdfBuffer,
      });
    }

    const { error: emailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: investment.user.email!,
      subject: 'Vault Deployment Confirmation',
      react: VaultDeploymentConfirmation({
        recipientName: userName,
        deploymentAmount: amount,
        propertyTitle: investment.property.title,
        propertyLocation,
        transactionId,
        deploymentDate: formatTimestamp(investment.created_at),
      }),
      text: `Vault Deployment Confirmation

Dear ${userName},

Your funds have been successfully deployed from your vault to a property.

Deployment Details:
- Transaction ID: ${transactionId}
- Amount: ${formatCurrency(amount)}
- Property: ${investment.property.title}
- Location: ${propertyLocation}
- Date: ${formatTimestamp(investment.created_at)}

Your investment is now active. You can view your investment details in your dashboard.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      ...(emailAttachments.length > 0 && {
        attachments: emailAttachments,
      }),
    });

    if (emailError) {
      Logger.error('Failed to send deployment email', { error: emailError });
      // Don't throw, deployment is successful
    }

    return {
      success: true,
      message: 'Funds deployed successfully',
      investmentId: investment.id,
      transactionId,
      newBalance,
    };
  });

// Create vault withdrawal request
export const createVaultWithdrawal = authActionClient
  .schema(createVaultWithdrawalSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { amount } = parsedInput;

    // Get user vault
    const vault = await getOrCreateUserVault(authUser.user.id);

    // Validate withdrawal amount
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    if (vault.balance < amount) {
      throw new Error('Insufficient vault balance');
    }

    // Check for pending withdrawals
    const { data: pendingWithdrawals, error: pendingError } = await supabase
      .from('vault_transactions')
      .select('id, amount')
      .eq('user_id', authUser.user.id)
      .eq('type', 'withdrawal')
      .eq('status', 'pending');

    if (pendingError) throw new Error(pendingError.message);

    const totalPending =
      pendingWithdrawals?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    if (vault.balance < amount + totalPending) {
      throw new Error(
        'Insufficient vault balance. You have pending withdrawal requests.',
      );
    }

    // Create vault transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('vault_transactions')
      .insert({
        user_id: authUser.user.id,
        type: 'withdrawal',
        amount,
        status: 'pending',
      })
      .select('*')
      .single();

    if (transactionError) throw new Error(transactionError.message);

    // Get user details for emails
    const { data: userProfile, error: profileError } = await supabase
      .from('profile')
      .select('first_name, last_name, email')
      .eq('id', authUser.user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    const userName = getFullName(userProfile.first_name, userProfile.last_name);

    Logger.info('Vault withdrawal request created', {
      userId: authUser.user.id,
      amount,
      transactionId: transaction.id,
    });

    // Send admin notification email
    const { error: adminEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: appConfig.emails.admin,
      subject: 'New Vault Withdrawal Request',
      react: AdminVaultDepositNotification({
        requestDate: formatTimestamp(transaction.created_at || new Date()),
        transactionId: transaction.id,
        depositAmount: amount,
        userEmail: userProfile.email,
        userName,
      }),
      text: `New Vault Withdrawal Request

A new vault withdrawal request has been submitted on ${appConfig.title}.

Request Details:
- Transaction ID: ${transaction.id}
- Amount: ${formatCurrency(amount)}
- User: ${userName}
- Email: ${userProfile.email}
- Date: ${formatTimestamp(transaction.created_at || new Date())}

Please review this withdrawal request in the admin dashboard.`,
    });

    if (adminEmailError) {
      Logger.error('Failed to send admin email', { error: adminEmailError });
      // Don't throw, continue with user email
    }

    // Send user confirmation email
    const { error: userEmailError } = await resend.emails.send({
      from: `VESTAFI HQ <${appConfig.emails.sender}>`,
      to: userProfile.email,
      subject: 'Vault Withdrawal Request Confirmation',
      react: VaultDepositRequestConfirmation({
        recipientName: userName,
        depositAmount: amount,
        transactionId: transaction.id,
        requestDate: formatTimestamp(transaction.created_at || new Date()),
      }),
      text: `Vault Withdrawal Request Confirmation

Dear ${userName},

We have received your vault withdrawal request.

Request Details:
- Transaction ID: ${transaction.id}
- Amount: ${formatCurrency(amount)}
- Date: ${formatTimestamp(transaction.created_at || new Date())}

Your request is currently being reviewed. You will receive another email once your withdrawal has been processed.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
    });

    if (userEmailError) {
      Logger.error('Failed to send user email', { error: userEmailError });
      // Don't throw, transaction is already created
    }

    return {
      success: true,
      message: 'Withdrawal request created successfully',
      transactionId: transaction.id,
    };
  });

// Get vault balance
export const getVaultBalance = authActionClient.action(async ({ ctx }) => {
  const { supabase, authUser } = ctx;

  const vault = await getOrCreateUserVault(authUser.user.id);

  return {
    success: true,
    data: vault,
  };
});

// Get vault transactions
export const getVaultTransactions = authActionClient
  .schema(getVaultTransactionsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase, authUser } = ctx;
    const { type, status, startDate, endDate } = parsedInput;

    let query = supabase
      .from('vault_transactions')
      .select('*, property:property_id(*)')
      .eq('user_id', authUser.user.id)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return {
      success: true,
      data: data || [],
    };
  });

// Update vault transaction status (Admin only)
export const updateVaultTransactionStatus = adminActionClient
  .schema(updateVaultTransactionStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { id, status, rejection_reason } = parsedInput;

    // Get transaction details
    const { data: transaction, error: fetchError } = await supabase
      .from('vault_transactions')
      .select('*, user:user_id(*)')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    // Only allow status updates for deposit or withdrawal transactions
    if (transaction.type !== 'deposit' && transaction.type !== 'withdrawal') {
      throw new Error(
        'Can only update status for deposit or withdrawal transactions',
      );
    }

    // Update transaction status
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('vault_transactions')
      .update({ status })
      .eq('id', id)
      .select('*, user:user_id(*)')
      .single();

    if (updateError) throw new Error(updateError.message);

    if (!updatedTransaction.user) {
      throw new Error('User information not found for transaction');
    }

    const userName = getFullName(
      updatedTransaction.user.first_name,
      updatedTransaction.user.last_name,
    );

    // If approved, update user vault balance and generate receipt
    if (status === 'approved') {
      if (!transaction.user_id) {
        throw new Error('Transaction user_id is missing');
      }
      const vault = await getOrCreateUserVault(transaction.user_id);

      // Calculate new balance and update vault
      let newBalance = 0;
      let receiptPdfBytes: Uint8Array | null = null;

      if (transaction.type === 'deposit') {
        // For deposits: increase balance
        newBalance = (vault.balance || 0) + transaction.amount;
        const newTotalDeposited =
          (vault.total_deposited || 0) + transaction.amount;

        const { error: vaultUpdateError } = await supabase
          .from('user_vault')
          .update({
            balance: newBalance,
            total_deposited: newTotalDeposited,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', transaction.user_id);

        if (vaultUpdateError) throw new Error(vaultUpdateError.message);

        // Generate receipt PDF for deposits
        receiptPdfBytes = await generateVaultDepositReceiptPDF({
          depositorName: userName,
          depositAmount: transaction.amount,
          transactionId: transaction.id,
          depositDate: formatTimestamp(transaction.created_at || new Date()),
          approvedDate: formatTimestamp(new Date()),
          currentVaultBalance: newBalance,
        });
      } else if (transaction.type === 'withdrawal') {
        // For withdrawals: decrease balance
        newBalance = (vault.balance || 0) - transaction.amount;

        if (newBalance < 0) {
          throw new Error('Insufficient vault balance for withdrawal');
        }

        const { error: vaultUpdateError } = await supabase
          .from('user_vault')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', transaction.user_id);

        if (vaultUpdateError) throw new Error(vaultUpdateError.message);
      }

      // Upload receipt to Supabase Storage (only for deposits)
      if (receiptPdfBytes) {
        // Upload receipt to Supabase Storage
        const receiptFileName = `${transaction.user_id}/vault-deposit-receipt-${transaction.id}_${Date.now()}.pdf`;

        const { data: uploadData, error: receiptUploadError } =
          await supabase.storage
            .from('investment-receipts')
            .upload(receiptFileName, Buffer.from(receiptPdfBytes), {
              contentType: 'application/pdf',
              upsert: true,
            });

        if (receiptUploadError) {
          Logger.error('Failed to upload receipt', {
            error: receiptUploadError,
          });
          // Don't throw, approval is successful but receipt upload failed
        } else {
          // Get public URL for the uploaded file
          const {
            data: { publicUrl: receiptUrl },
          } = supabase.storage
            .from('investment-receipts')
            .getPublicUrl(receiptFileName);

          // Update vault_transactions record with receipt URL
          const { error: receiptUpdateError } = await supabase
            .from('vault_transactions')
            .update({
              receipt_url: receiptUrl,
            } as VaultTransactionUpdate & { receipt_url?: string | null })
            .eq('id', transaction.id);

          if (receiptUpdateError) {
            Logger.error('Failed to update receipt URL', {
              error: receiptUpdateError,
            });
            // Don't throw, approval is successful but receipt URL update failed
          } else {
            Logger.info('Receipt uploaded and saved successfully', {
              transactionId: transaction.id,
              receiptUrl,
            });
          }
        }
      }

      // Send status update email
      const emailAttachments = [];
      if (receiptPdfBytes) {
        emailAttachments.push({
          filename: `vault-deposit-receipt-${transaction.id}.pdf`,
          content: Buffer.from(receiptPdfBytes),
        });
      }

      if (transaction.type === 'deposit') {
        const { error: emailError } = await resend.emails.send({
          from: `VESTAFI HQ <${appConfig.emails.sender}>`,
          to: updatedTransaction.user.email!,
          subject: 'Vault Deposit Approved',
          react: VaultDepositApproved({
            recipientName: userName,
            depositAmount: transaction.amount,
            transactionId: transaction.id,
            approvedDate: formatTimestamp(new Date()),
          }),
          text: `Vault Deposit Approved

Dear ${userName},

Your vault deposit has been approved.

Deposit Details:
- Transaction ID: ${transaction.id}
- Amount: ${formatCurrency(transaction.amount)}
- Approved Date: ${formatTimestamp(new Date())}

The funds have been added to your vault balance. You can now deploy these funds to properties.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
          ...(emailAttachments.length > 0 && {
            attachments: emailAttachments,
          }),
        });

        if (emailError) {
          Logger.error('Failed to send approval email', { error: emailError });
        }
      } else if (transaction.type === 'withdrawal') {
        const { error: emailError } = await resend.emails.send({
          from: `VESTAFI HQ <${appConfig.emails.sender}>`,
          to: updatedTransaction.user.email!,
          subject: 'Vault Withdrawal Approved',
          react: VaultDepositApproved({
            recipientName: userName,
            depositAmount: transaction.amount,
            transactionId: transaction.id,
            approvedDate: formatTimestamp(new Date()),
          }),
          text: `Vault Withdrawal Approved

Dear ${userName},

Your vault withdrawal request has been approved and processed.

Withdrawal Details:
- Transaction ID: ${transaction.id}
- Amount: ${formatCurrency(transaction.amount)}
- Approved Date: ${formatTimestamp(new Date())}

The funds have been deducted from your vault balance and will be transferred to your registered bank account. Please allow 1-3 business days for the funds to appear in your account.

If you have any questions, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
        });

        if (emailError) {
          Logger.error('Failed to send withdrawal approval email', {
            error: emailError,
          });
        }
      }
    } else if (status === 'rejected') {
      const subject =
        transaction.type === 'withdrawal'
          ? 'Vault Withdrawal Rejected'
          : 'Vault Deposit Rejected';
      const transactionType =
        transaction.type === 'withdrawal' ? 'withdrawal' : 'deposit';

      const { error: emailError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: updatedTransaction.user.email!,
        subject,
        react: VaultDepositRejected({
          recipientName: userName,
          depositAmount: transaction.amount,
          transactionId: transaction.id,
          rejectedDate: formatTimestamp(new Date()),
          reason: rejection_reason || 'No reason provided',
        }),
        text: `Vault ${transactionType === 'withdrawal' ? 'Withdrawal' : 'Deposit'} Rejected

Dear ${userName},

We regret to inform you that your vault ${transactionType} has been rejected.

${transactionType === 'withdrawal' ? 'Withdrawal' : 'Deposit'} Details:
- Transaction ID: ${transaction.id}
- Amount: ${formatCurrency(transaction.amount)}
- Rejected Date: ${formatTimestamp(new Date())}
- Reason: ${rejection_reason || 'No reason provided'}

If you have any questions about this decision, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });

      if (emailError) {
        Logger.error('Failed to send rejection email', { error: emailError });
      }
    }

    return {
      success: true,
      data: updatedTransaction,
    };
  });

// Admin: Get all vault transactions
export const getAllVaultTransactions = adminActionClient
  .schema(
    getVaultTransactionsSchema.extend({
      userId: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { type, status, startDate, endDate, userId } = parsedInput;

    let query = supabase
      .from('vault_transactions')
      .select('*, user:user_id(*, bank_info(*)), property:property_id(*)')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return {
      success: true,
      data: data || [],
    };
  });

// Admin: Get all user vaults
export const getAllUserVaults = adminActionClient.action(async ({ ctx }) => {
  const { supabase } = ctx;

  const { data, error } = await supabase
    .from('user_vault')
    .select('*, user:user_id(*)')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return {
    success: true,
    data: data || [],
  };
});
