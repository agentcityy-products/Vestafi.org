'use client';

import { Sparkles } from 'lucide-react';

import { useAdminNotification } from '@/hooks/queries/admin-notification';
import { useUserMembershipStatus } from '@/hooks/queries/membership';

import { MembershipActivationDialog } from './membership-activation-dialog';

export function MembershipTicker() {
  const { data: membershipStatus, isLoading } = useUserMembershipStatus();
  const { data: adminNotification } = useAdminNotification();

  // Build list of notifications to display (membership first, then admin)
  const notifications: string[] = [];

  // Add membership notifications first if needed
  if (
    !isLoading &&
    membershipStatus &&
    membershipStatus.membershipEnabled &&
    (membershipStatus.needsActivation || membershipStatus.isExpired)
  ) {
    const pendingActivations = membershipStatus.pendingActivations.length;
    const isExpired = membershipStatus.isExpired;

    const tickerMessage = isExpired
      ? 'Your membership has expired. Please renew your Vestafi Membership to regain access to all platform features, including withdrawals.'
      : 'To unlock full access to all platform features, please activate your Vestafi Membership.';

    const pendingMessage =
      pendingActivations > 0
        ? `You have ${pendingActivations} pending activation${pendingActivations > 1 ? 's' : ''} awaiting admin approval`
        : '';

    // Build membership message
    const membershipMessage = pendingMessage
      ? `${tickerMessage} • ${pendingMessage}`
      : tickerMessage;

    notifications.push(membershipMessage);
  }

  // Add admin notification after membership notification
  if (adminNotification) {
    notifications.push(adminNotification.message);
  }

  // Don't render if no notifications
  if (notifications.length === 0) {
    return null;
  }

  // Determine if we should show activation button (only for membership notifications)
  const showActivationButton =
    membershipStatus &&
    membershipStatus.membershipEnabled &&
    (membershipStatus.needsActivation || membershipStatus.isExpired);

  // Build the full scrolling message with spacing between notifications
  // Add significant spacing to create delay and make it feel like a new notification is coming
  const separator = ' • • • • • ';
  const fullMessage = notifications.join(separator);

  // Use fixed red theme for all notifications
  return (
    <div className='flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-md bg-red-50 px-3 py-2 dark:bg-red-950'>
      <Sparkles className='h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
      {/* Scrolling ticker */}
      <div className='flex min-w-0 flex-1 items-center overflow-hidden'>
        <div className='animate-scroll whitespace-nowrap'>
          <span className='text-sm font-medium text-red-900 dark:text-red-100'>
            {fullMessage}
          </span>
          {/* Duplicate for seamless loop */}
          <span className='ml-8 text-sm font-medium text-red-900 dark:text-red-100'>
            {fullMessage}
          </span>
        </div>
      </div>
      {/* Action button - only show for membership notifications */}
      {showActivationButton && (
        <div className='flex-shrink-0'>
          <MembershipActivationDialog />
        </div>
      )}
    </div>
  );
}
