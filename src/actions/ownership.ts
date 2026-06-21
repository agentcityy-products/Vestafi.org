'use server';

import {
  createOwnershipCheckoutSchema,
  getMyOwnershipReservationsSchema,
} from '@/schema/ownership';
import { processReferralReward } from '@/actions/referrals';

import { authActionClient } from '@/lib/server/safe-action';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/utils/number-functions';

type SupportedOwnershipType = 'prime' | 'live';

function calculateCheckout(
  ownershipType: SupportedOwnershipType,
  propertyPrice: number,
  requestedAmount: number,
) {
  const ownershipAmount =
    ownershipType === 'prime' ? propertyPrice : requestedAmount;
  const legalFee =
    ownershipType === 'prime' ? Math.round(propertyPrice * 0.015) : 0;
  const serviceFee =
    ownershipType === 'prime' ? Math.round(propertyPrice * 0.01) : 0;

  return {
    ownershipAmount,
    legalFee,
    serviceFee,
    totalDue: ownershipAmount + legalFee + serviceFee,
  };
}

async function getCheckoutContext(propertyId: string, requestedAmount: number) {
  const admin = await createSupabaseAdminClient();
  await admin.rpc('expire_ownership_reservations');

  const { data: property, error } = await admin
    .from('listings_view')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (error || !property) {
    throw new Error(error?.message || 'Ownership opening not found');
  }

  if (property.opportunity_type === 'fractional') {
    throw new Error(
      'Fractional opportunities continue through the contribution flow.',
    );
  }

  const ownershipType = property.opportunity_type as SupportedOwnershipType;
  const propertyPrice = Number(property.price || 0);
  const availableOwnership = Number(
    property.available_ownership ??
      propertyPrice - Number(property.total_investment || 0),
  );
  const checkout = calculateCheckout(
    ownershipType,
    propertyPrice,
    requestedAmount,
  );

  if (ownershipType === 'prime' && property.is_reserved) {
    throw new Error(
      'This Prime apartment is already reserved by another member.',
    );
  }

  if (checkout.ownershipAmount > availableOwnership) {
    throw new Error(
      `Only ${formatCurrency(availableOwnership)} remains available.`,
    );
  }

  return { admin, property, ownershipType, checkout };
}

export const createOwnershipCheckout = authActionClient
  .schema(createOwnershipCheckoutSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { authUser } = ctx;
    const { propertyId, ownershipAmount, paymentMethod, proofImages } =
      parsedInput;
    const { admin, property, ownershipType, checkout } =
      await getCheckoutContext(propertyId, ownershipAmount);

    if (paymentMethod === 'bank_transfer' && proofImages.length === 0) {
      throw new Error('Upload proof of your bank transfer to continue.');
    }

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const reservationId = crypto.randomUUID();

    const { error: reservationError } = await admin
      .from('ownership_reservations')
      .insert({
        id: reservationId,
        property_id: propertyId,
        user_id: authUser.user.id,
        opportunity_type: ownershipType,
        payment_method: paymentMethod,
        status:
          paymentMethod === 'bank_transfer' ? 'pending_review' : 'reserved',
        ownership_amount: checkout.ownershipAmount,
        legal_fee: checkout.legalFee,
        service_fee: checkout.serviceFee,
        total_due: checkout.totalDue,
        proof_images: proofImages,
        expires_at: expiresAt,
      });

    if (reservationError) throw new Error(reservationError.message);

    if (paymentMethod === 'bank_transfer') {
      const investmentId = crypto.randomUUID();
      const { error: investmentError } = await admin.from('investment').insert({
        id: investmentId,
        property_id: propertyId,
        user_id: authUser.user.id,
        amount: checkout.ownershipAmount,
        proof_images: proofImages,
        status: 'pending',
        ownership_type: ownershipType,
        payment_method: paymentMethod,
        reservation_id: reservationId,
      });

      if (investmentError) {
        await admin
          .from('ownership_reservations')
          .delete()
          .eq('id', reservationId);
        throw new Error(investmentError.message);
      }

      await admin
        .from('ownership_reservations')
        .update({ investment_id: investmentId })
        .eq('id', reservationId);

      return {
        completed: false,
        reservationId,
        investmentId,
        expiresAt,
        ownershipType,
        checkout,
        propertyTitle: property.title,
      };
    }

    const { data: vault, error: vaultError } = await admin
      .from('user_vault')
      .select('*')
      .eq('user_id', authUser.user.id)
      .single();

    if (vaultError || !vault) {
      await admin
        .from('ownership_reservations')
        .delete()
        .eq('id', reservationId);
      throw new Error('Your Vestafi Wallet could not be loaded.');
    }

    if (Number(vault.balance) < checkout.totalDue) {
      await admin
        .from('ownership_reservations')
        .delete()
        .eq('id', reservationId);
      throw new Error(
        `Your Vestafi Wallet needs ${formatCurrency(
          checkout.totalDue - Number(vault.balance),
        )} more to complete this ownership.`,
      );
    }

    const transactionId = crypto.randomUUID();
    const investmentId = crypto.randomUUID();

    const { error: transactionError } = await admin
      .from('vault_transactions')
      .insert({
        id: transactionId,
        user_id: authUser.user.id,
        type: 'deploy',
        amount: checkout.totalDue,
        property_id: propertyId,
        status: 'approved',
      });

    if (transactionError) throw new Error(transactionError.message);

    const { error: investmentError } = await admin.from('investment').insert({
      id: investmentId,
      property_id: propertyId,
      user_id: authUser.user.id,
      amount: checkout.ownershipAmount,
      proof_images: [],
      status: 'successful',
      vault_transaction_id: transactionId,
      ownership_type: ownershipType,
      payment_method: paymentMethod,
      reservation_id: reservationId,
    });

    if (investmentError) {
      await admin.from('vault_transactions').delete().eq('id', transactionId);
      throw new Error(investmentError.message);
    }

    const { data: updatedVault, error: vaultUpdateError } = await admin
      .from('user_vault')
      .update({
        balance: Number(vault.balance) - checkout.totalDue,
        total_deployed: Number(vault.total_deployed || 0) + checkout.totalDue,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authUser.user.id)
      .eq('balance', Number(vault.balance))
      .select('user_id')
      .maybeSingle();

    if (vaultUpdateError || !updatedVault) {
      await admin.from('investment').delete().eq('id', investmentId);
      await admin.from('vault_transactions').delete().eq('id', transactionId);
      throw new Error(
        'Your Vestafi Wallet balance changed. Please review it and try again.',
      );
    }

    await admin.from('property_ownership_movements').insert({
      property_id: propertyId,
      user_id: authUser.user.id,
      amount_delta: checkout.ownershipAmount,
      reason: 'primary_investment',
      ref_id: investmentId,
    });

    await admin
      .from('ownership_reservations')
      .update({
        investment_id: investmentId,
        vault_transaction_id: transactionId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservationId);

    await processReferralReward(authUser.user.id);

    return {
      completed: true,
      reservationId,
      investmentId,
      expiresAt,
      ownershipType,
      checkout,
      propertyTitle: property.title,
    };
  });

export const getMyOwnershipReservations = authActionClient
  .schema(getMyOwnershipReservationsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const admin = await createSupabaseAdminClient();
    await admin.rpc('expire_ownership_reservations');

    let query = admin
      .from('ownership_reservations')
      .select('*, property:property_id(*)')
      .eq('user_id', ctx.authUser.user.id)
      .order('created_at', { ascending: false });

    if (parsedInput.propertyId) {
      query = query.eq('property_id', parsedInput.propertyId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  });
