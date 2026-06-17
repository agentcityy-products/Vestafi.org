'use client';

import { Lock } from 'lucide-react';
import { ReactNode } from 'react';

import { useMembershipAccess } from '@/hooks/queries/membership';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FeatureLockProps {
  children: ReactNode;
  featureName?: string;
}

/**
 * Component that disables children if user hasn't activated membership
 * Shows a tooltip explaining why the feature is locked
 */
export function FeatureLock({
  children,
  featureName = 'this feature',
}: FeatureLockProps) {
  const { hasAccess, needsActivation, isExpired, membershipEnabled } =
    useMembershipAccess();

  // If membership is disabled globally, everyone has access
  if (!membershipEnabled || hasAccess) {
    return <>{children}</>;
  }

  if (!needsActivation && !isExpired) {
    // Still loading, show children normally
    return <>{children}</>;
  }

  // Determine tooltip message based on state and feature
  const isWithdrawal = featureName?.toLowerCase().includes('withdrawal');
  let tooltipMessage: string;
  
  if (isWithdrawal) {
    tooltipMessage = isExpired
      ? 'Your membership has expired. Active membership is required to withdraw funds. Please renew your Vestafi Membership.'
      : 'Active membership is required to withdraw funds. Please activate your Vestafi Membership.';
  } else {
    tooltipMessage = isExpired
      ? `Your membership has expired. Please renew your Vestafi Membership to use ${featureName}`
      : `Activate your Vestafi Membership to use ${featureName}`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='relative inline-block'>
            <div className='pointer-events-none opacity-50'>{children}</div>
            <div className='pointer-events-auto absolute inset-0 flex items-center justify-center'>
              <div className='rounded-md bg-background/80 p-2 shadow-sm'>
                <Lock className='h-4 w-4 text-muted-foreground' />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
