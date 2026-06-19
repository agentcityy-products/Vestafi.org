'use client';

import {
  Award,
  BarChart3,
  Building,
  CalendarDays,
  ChevronDown,
  Crown,
  DollarSign,
  DoorOpen,
  FileText,
  HelpCircle,
  Home,
  Inbox,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Star,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useProfile } from '@/hooks/queries/profile';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { getFullName } from '@/utils/string-functions';

import { paths } from '@/constants/paths';

import { InnerAccessModal } from './inner-access-modal';
import Logo from './logo';
import SupportDialog from './support-dialog';

import { RankType } from '@/types/dao';

// Rank configuration for display
const rankConfigs: Record<
  RankType,
  { icon: React.ComponentType<{ className?: string }>; badgeClassName: string }
> = {
  Associate: {
    icon: User,
    badgeClassName: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  Steward: {
    icon: TrendingUp,
    badgeClassName: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  Champion: {
    icon: Award,
    badgeClassName: 'bg-green-100 text-green-800 border-green-300',
  },
  Legacy: {
    icon: Crown,
    badgeClassName: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
};

type SidebarLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent) => void;
  /** Optional badge next to the label (e.g. exit window closed). */
  badge?: React.ReactNode;
  subLinks?: {
    label: string;
    href: string;
  }[];
};

const SidebarNavItem = ({
  link,
  pathname,
  onClick,
}: {
  link: SidebarLink;
  pathname: string;
  onClick: (link: SidebarLink) => (e: React.MouseEvent) => void;
}) => {
  const isParentActive =
    pathname === link.href ||
    !!(link.subLinks && link.subLinks.some((s) => pathname.startsWith(s.href)));
  const [isOpen, setIsOpen] = React.useState(isParentActive);

  React.useEffect(() => {
    if (isParentActive) setIsOpen(true);
  }, [isParentActive]);

  if (!link.subLinks || link.subLinks.length === 0) {
    return (
      <Link
        href={link.href}
        className={cn(
          'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          pathname === link.href
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
        onClick={onClick(link)}
      >
        <link.icon className='mr-3 h-5 w-5' />
        <span className='flex flex-1 items-center gap-2'>
          {link.label}
          {link.badge}
        </span>
      </Link>
    );
  }

  return (
    <div className='space-y-1'>
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isParentActive && !isOpen
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <div className='flex min-w-0 items-center'>
          <link.icon className='mr-3 h-5 w-5 flex-shrink-0' />
          <span className='flex min-w-0 items-center gap-2'>
            {link.label}
            {link.badge}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className='ml-9 space-y-1'>
          {link.subLinks.map((subLink) => (
            <Link
              key={subLink.href}
              href={subLink.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === subLink.href ||
                  pathname.startsWith(subLink.href + '/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              onClick={(e) => {
                onClick({ ...link, href: subLink.href })(e);
              }}
            >
              {subLink.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

type SidebarProps = {
  userEmail: string;
  isAdmin: boolean;
};

const Sidebar = ({ userEmail, isAdmin }: SidebarProps) => {
  const [innerAccessModalOpen, setInnerAccessModalOpen] = useState(false);

  const userLinks: SidebarLink[] = [
    // Always show "Upload Rental Property" button
    // {
    //   label: 'Upload Rental Property',
    //   href: paths.rentalProperties.submit,
    //   icon: Upload,
    //   onClick: canSubmitRentalProperty
    //     ? undefined
    //     : (e: React.MouseEvent) => {
    //         e.preventDefault();
    //         setInnerAccessModalOpen(true);
    //       },
    // },
    {
      label: 'Inside Opportunities',
      href: paths.listings.list,
      icon: Search,
    },
    {
      label: 'My Ownership',
      href: paths.dashboard.savingsOverview,
      icon: BarChart3,
    },
    {
      label: 'Monthly Distributions',
      href: paths.dashboard.distributions,
      icon: CalendarDays,
    },
    {
      label: 'Ownership Activity',
      href: paths.dashboard.contributions,
      icon: Building,
      subLinks: [
        { label: 'Activity', href: paths.dashboard.contributions },
        { label: 'Ownership Vault', href: paths.dashboard.vault },
        { label: 'Transfer Ownership', href: paths.dashboard.exitWindow.root },
      ],
    },
    {
      label: 'My Watchlist',
      href: paths.dashboard.watchlist,
      icon: Star,
    },
    {
      label: 'Messages',
      href: paths.dashboard.messages,
      icon: Inbox,
    },
    {
      label: 'Society Briefings',
      href: paths.dashboard.briefings,
      icon: FileText,
    },
    {
      label: 'Support',
      href: '#',
      icon: HelpCircle,
      onClick: () => setOpenSupport(true),
    },
  ];

  const pathname = usePathname();
  const router = useRouter();
  const links = isAdmin ? adminLinks : userLinks;
  const initial = userEmail?.[0]?.toUpperCase() || 'U';
  const [open, setOpen] = React.useState(false);
  const [openSupport, setOpenSupport] = useState(false);

  const { data: profile } = useProfile();
  const currentRank: RankType = profile?.rank_types || 'Associate';
  const rankConfig = rankConfigs[currentRank];
  const RankIcon = rankConfig.icon;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(paths.auth.login);
  };

  const handleLinkClick = (link: SidebarLink) => (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick(e);
    }
    setOpen(false); // Close mobile sidebar after click
  };

  const SidebarContent = () => (
    <>
      {/* Logo section */}
      <div className='flex h-16 items-center border-b px-6'>
        <Logo />
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-4 py-6'>
        {!isAdmin && (
          <p className='mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70'>
            Vestafi Inner Society
          </p>
        )}
        <ul className='space-y-1'>
          {links.map((link) => (
            <li key={link.href}>
              <SidebarNavItem
                link={link}
                pathname={pathname}
                onClick={handleLinkClick}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* User profile section - Mobile only */}
      <div className='border-t p-4 lg:hidden'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-auto w-full justify-start px-2 py-2'
            >
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <Avatar className='h-8 w-8 flex-shrink-0'>
                  <AvatarFallback className='text-xs'>{initial}</AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1 text-left'>
                  <p className='truncate text-sm font-medium'>
                    {getFullName(profile?.first_name, profile?.last_name)}
                  </p>
                  {profile?.rank_types && (
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs text-muted-foreground'>
                        Rank:
                      </span>
                      <Badge
                        variant='secondary'
                        className={`px-1.5 py-0 text-xs font-semibold ${rankConfig.badgeClassName}`}
                      >
                        {currentRank}
                      </Badge>
                    </div>
                  )}
                  <p className='truncate text-xs text-muted-foreground'>
                    {userEmail}
                  </p>
                </div>
                <ChevronDown className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-2'>
                <p className='text-sm font-medium leading-none'>
                  {getFullName(profile?.first_name, profile?.last_name)}
                </p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {userEmail}
                </p>
                {profile?.rank_types && (
                  <div className='flex items-center gap-2 pt-1'>
                    <RankIcon className='h-3.5 w-3.5 text-muted-foreground' />
                    <span className='text-xs text-muted-foreground'>Rank:</span>
                    <Badge
                      variant='secondary'
                      className={`text-xs font-semibold ${rankConfig.badgeClassName}`}
                    >
                      {currentRank}
                    </Badge>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={paths.profile} className='cursor-pointer'>
                <User className='mr-2 h-4 w-4' />
                <span>My profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      <SupportDialog open={openSupport} onOpenChange={setOpenSupport} />
      <InnerAccessModal
        open={innerAccessModalOpen}
        onOpenChange={setInnerAccessModalOpen}
      />
      {/* Mobile header with menu button */}
      <div className='fixed left-0 right-0 top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden'>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-64 p-0'>
            <div className='flex h-full flex-col'>
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <Logo />
      </div>

      {/* Desktop sidebar */}
      <aside className='fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-background lg:flex'>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;

const adminLinks: SidebarLink[] = [
  {
    label: 'Dashboard',
    href: paths.admin.root,
    icon: LayoutDashboard,
  },
  {
    label: 'Properties',
    href: paths.admin.properties.list,
    icon: Building,
  },
  {
    label: 'Rental Properties',
    href: paths.admin.rentalProperties.list,
    icon: Home,
  },
  {
    label: 'Withdrawal Requests',
    href: paths.admin.withdrawalRequests,
    icon: FileText,
  },
  {
    label: 'Investments',
    href: paths.admin.pendingInvestments,
    icon: DollarSign,
  },
  {
    label: 'Exit Windows',
    href: paths.admin.exitWindows,
    icon: DoorOpen,
  },
  {
    label: 'Vault Transactions',
    href: paths.admin.vault,
    icon: Wallet,
  },
  {
    label: 'Membership Activations',
    href: paths.admin.memberships,
    icon: Key,
  },
  {
    label: 'Settings',
    href: paths.admin.settings,
    icon: FileText,
  },
  {
    label: 'Referrals',
    href: paths.admin.referrals,
    icon: Users,
  },
  {
    label: 'Reports & Exports',
    href: paths.admin.reports,
    icon: BarChart3,
  },
];

/* 
the users have these pages
- dashboard or overview: it shows them the list of properties which they have invested in along with overall stats of their investments
- monthly returns: it shows them the return they get from any property they have invested in
- withdrawals: it shows them the list of withdrawals they have made and they can create a new withdrawal request from here
- explore properties: this is the page where they can see the list of properties which are available to invest in
- help and support: it shows them the help and support page
*/
