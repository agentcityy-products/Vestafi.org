'use client';

import { Sparkles } from 'lucide-react';

import { useUserMembershipStatus } from '@/hooks/queries/membership';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { MembershipActivationDialog } from './membership-activation-dialog';

export function MembershipActivationBanner() {
  const { data: membershipStatus, isLoading } = useUserMembershipStatus();

  if (
    isLoading ||
    !membershipStatus ||
    (!membershipStatus.needsActivation && !membershipStatus.isExpired) ||
    !membershipStatus.membershipEnabled
  ) {
    return null;
  }

  const pendingActivations = membershipStatus.pendingActivations.length;
  const isExpired = membershipStatus.isExpired;

  return (
    <Alert
      className={`mb-6 ${
        isExpired
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
          : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'
      }`}
    >
      <Sparkles
        className={`h-4 w-4 ${
          isExpired
            ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-400'
        }`}
      />
      <AlertTitle
        className={
          isExpired
            ? 'text-red-900 dark:text-red-100'
            : 'text-amber-900 dark:text-amber-100'
        }
      >
        {isExpired
          ? 'Your Membership Has Expired'
          : 'Activate Your Vestafi Membership'}
      </AlertTitle>
      <AlertDescription
        className={`mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
          isExpired
            ? 'text-red-800 dark:text-red-200'
            : 'text-amber-800 dark:text-amber-200'
        }`}
      >
        <div className='space-y-1'>
          <p>
            {isExpired
              ? 'Your membership has expired. Please renew your Vestafi Membership to regain access to all platform features, including withdrawals.'
              : 'To unlock full access to all platform features, please activate your Vestafi Membership.'}
          </p>
          {pendingActivations > 0 && (
            <p className='text-sm'>
              You have {pendingActivations} pending activation
              {pendingActivations > 1 ? 's' : ''} awaiting admin approval.
            </p>
          )}
        </div>
        <div className='flex-shrink-0'>
          <MembershipActivationDialog />
        </div>
      </AlertDescription>
    </Alert>
  );
}
