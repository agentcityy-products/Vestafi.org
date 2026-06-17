'use client';

import {
  Award,
  ChevronDown,
  Crown,
  LogOut,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useProfile } from '@/hooks/queries/profile';
import { useLoggedInUser } from '@/hooks/queries/profile';

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

import { supabase } from '@/lib/supabase/client';
import { getFullName } from '@/utils/string-functions';

import { paths } from '@/constants/paths';

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

type UserMenuWithRankProps = {
  userEmail: string;
};

export function UserMenuWithRank({ userEmail }: UserMenuWithRankProps) {
  const router = useRouter();
  const { data: user } = useLoggedInUser();
  const { data: profile } = useProfile();

  const initial = userEmail?.[0]?.toUpperCase() || 'U';
  const currentRank: RankType = profile?.rank_types || 'Associate';
  const rankConfig = rankConfigs[currentRank];
  const RankIcon = rankConfig.icon;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(paths.auth.login);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='h-auto gap-3 px-3 py-2 hover:bg-accent'
        >
          <Avatar className='h-8 w-8 flex-shrink-0'>
            <AvatarFallback className='text-xs'>{initial}</AvatarFallback>
          </Avatar>
          <div className='hidden min-w-0 flex-1 flex-col items-start text-left xl:flex'>
            <div className='flex items-center gap-2'>
              <p className='truncate text-sm font-medium'>
                {getFullName(profile?.first_name, profile?.last_name)}
              </p>
              {profile?.rank_types && (
                <div className='flex items-center gap-1.5'>
                  <span className='text-xs text-muted-foreground'>Rank:</span>
                  <Badge
                    variant='secondary'
                    className={`px-1.5 py-0 text-xs font-semibold ${rankConfig.badgeClassName}`}
                  >
                    {currentRank}
                  </Badge>
                </div>
              )}
            </div>
            <p className='truncate text-xs text-muted-foreground'>
              {userEmail}
            </p>
          </div>
          <ChevronDown className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
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
  );
}
