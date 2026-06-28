'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { useListingById } from '@/hooks/queries/listing';
import { useMembershipAccess } from '@/hooks/queries/membership';
import { useLoggedInUser } from '@/hooks/queries/profile';
import { useVaultBalance } from '@/hooks/queries/vault';

import { createInvestment } from '@/actions/investment';
import { deployFromVault } from '@/actions/vault';

import { InvestmentCalculator } from '@/components/listings/investment-calculator';
import { PaymentInstructionsDialog } from '@/components/listings/payment-instructions-dialog';
import { PropertyDetails } from '@/components/listings/property-details';
import { Button } from '@/components/ui/button';

import { onError } from '@/lib/show-error-toast';
import { uploadToSupabase } from '@/utils/supabase-bucket';

import { QueryKeys } from '@/constants/query-keys';

import { ListingsViewRow } from '@/types/dao';

interface PropertyDetailsContainerProps {
  initialProperty: ListingsViewRow;
}

export const PropertyDetailsContainer = ({
  initialProperty,
}: PropertyDetailsContainerProps) => {
  const queryClient = useQueryClient();
  const { data: fetchedProperty } = useListingById({
    id: initialProperty.id!,
    defaultData: initialProperty,
  });
  const property = fetchedProperty || initialProperty;
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [expectedReturns, setExpectedReturns] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 0 });

  const { data: loggedInUser } = useLoggedInUser();
  const { data: vaultBalanceData, isLoading: isVaultBalanceLoading } =
    useVaultBalance();
  const { hasAccess, needsActivation, isExpired, membershipEnabled } =
    useMembershipAccess();
  const vaultBalance = vaultBalanceData?.balance || 0;
  const isFractionalLocked =
    membershipEnabled && !hasAccess && (needsActivation || isExpired);

  const handleInvest = (
    amount: number,
    expectedReturns: { min: number; max: number },
  ) => {
    if (isFractionalLocked) {
      toast.error(
        'Activate your Vestafi Membership to join Fractional ownership.',
      );
      return;
    }
    setInvestmentAmount(amount);
    setExpectedReturns(expectedReturns);
    setIsPaymentDialogOpen(true);
  };

  const deployAction = useAction(deployFromVault, {
    onSuccess: () => {
      toast.success('Funds deployed successfully!');
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LISTINGS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VAULT] });
      setIsPaymentDialogOpen(false);
    },
    onError,
  });

  const investAction = useAction(createInvestment, {
    onSuccess: () => {
      toast.success(
        'Contribution submitted successfully! We will review your payment and confirm within 24-48 hours.',
      );
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LISTINGS] });
      setIsPaymentDialogOpen(false);
    },
    onError,
  });

  const handleDeploy = async () => {
    if (!property.id) {
      toast.error('Property ID is missing');
      return;
    }
    await deployAction.executeAsync({
      propertyId: property.id,
      amount: investmentAmount,
    });
  };

  const handleSubmitPayment = async (paymentProofFiles: File[]) => {
    if (!loggedInUser) {
      toast.error('Please login to submit your payment');
      return;
    }
    const uploadPromises = paymentProofFiles.map((file) => {
      return uploadToSupabase(
        file,
        `${loggedInUser.id}/${property.id}/${file.name}_${Date.now()}`,
        'payment-proofs',
      );
    });
    const uploadedFiles = await Promise.all(uploadPromises);
    const failedUploads = uploadedFiles.filter((file) => file.error !== null);
    if (failedUploads.length > 0) {
      toast.error(
        'Failed to upload one or more payment proofs. Please try again.',
      );
      return;
    }
    const paymentProofs = uploadedFiles
      .map((file) => file.url)
      .filter((url): url is string => url !== null);
    if (paymentProofs.length === 0) {
      toast.error('Please upload at least one payment proof');
      return;
    }
    await investAction.executeAsync({
      propertyId: property.id!,
      amount: investmentAmount,
      paymentProofs,
    });
  };

  const remainingAmount =
    (property.price || 0) - (property.total_investment || 0);
  const isFullyFunded = remainingAmount <= 0;

  return (
    <>
      <div className='mb-6 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-emerald-50 p-5'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-violet-700'>
          Vestafi Fractional
        </p>
        <h1 className='mt-2 text-2xl font-bold'>
          Own this apartment together.
        </h1>
        <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>
          Choose a contribution, receive a documented ownership share, and
          participate in rental income through the existing Vestafi contribution
          and wallet mechanics.
        </p>
      </div>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <PropertyDetails property={property} />
        </div>

        <div className='lg:col-span-1'>
          {isFractionalLocked ? (
            <div className='rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950'>
              <p className='text-sm font-semibold uppercase tracking-[0.16em]'>
                Membership required
              </p>
              <h2 className='mt-2 text-xl font-bold'>
                Unlock Fractional participation
              </h2>
              <p className='mt-2 text-sm'>
                Fractional apartment contribution flows are available after
                Vestafi Membership activation. Prime remains open, and Live
                members receive gentle reminders after their first week.
              </p>
              <Button className='mt-5 w-full' asChild>
                <a href='/dashboard/inner-access'>Activate Membership</a>
              </Button>
            </div>
          ) : !isFullyFunded ? (
            <InvestmentCalculator property={property} onInvest={handleInvest} />
          ) : (
            <div className='rounded-2xl border p-5 text-sm text-muted-foreground'>
              This apartment is fully subscribed.
            </div>
          )}
        </div>
      </div>

      {/* Payment/Deployment Dialog */}
      <PaymentInstructionsDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        property={property}
        investmentAmount={investmentAmount}
        expectedReturns={expectedReturns}
        vaultBalance={vaultBalance}
        isVaultBalanceLoading={isVaultBalanceLoading}
        onDeploy={handleDeploy}
        isDeploying={deployAction.status === 'executing'}
        onSubmit={(paymentProofFiles) => {
          const promise = handleSubmitPayment(paymentProofFiles);
          toast.promise(promise, {
            loading: 'Submitting your payment...',
          });
        }}
      />
    </>
  );
};
