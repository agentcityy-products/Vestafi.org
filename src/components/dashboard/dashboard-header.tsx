'use client';

import { MembershipTicker } from '@/components/dashboard/membership/membership-ticker';
import { UserMenuWithRank } from '@/components/dashboard/user-menu-with-rank';

type DashboardHeaderProps = {
  userEmail: string;
};

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <header className='fixed left-0 right-0 top-0 z-40 hidden h-16 border-b bg-background lg:ml-64 lg:flex lg:items-center lg:justify-between lg:gap-4 lg:px-6'>
      {/* Left: Membership Ticker */}
      <div className='flex min-w-0 flex-1 items-center'>
        <MembershipTicker />
      </div>

      {/* Right: User Menu */}
      <div className='flex-shrink-0'>
        <UserMenuWithRank userEmail={userEmail} />
      </div>
    </header>
  );
}
