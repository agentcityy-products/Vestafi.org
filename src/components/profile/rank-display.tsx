'use client';

import { Award, Crown, TrendingUp, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { RankType } from '@/types/dao';

interface RankConfig {
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  badgeClassName: string;
}

const rankConfigs: Record<RankType, RankConfig> = {
  Associate: {
    icon: User,
    description: 'Entry-level rank for new members',
    badgeVariant: 'secondary',
    badgeClassName: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  Steward: {
    icon: TrendingUp,
    description:
      'Members who have begun to make significant deposits and referrals',
    badgeVariant: 'default',
    badgeClassName: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  Champion: {
    icon: Award,
    description:
      "High-level rank for those who consistently contribute to the society's success",
    badgeVariant: 'default',
    badgeClassName: 'bg-green-100 text-green-800 border-green-300',
  },
  Legacy: {
    icon: Crown,
    description:
      'Top tier for those who have been with the society from the start and have the most influence',
    badgeVariant: 'default',
    badgeClassName: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
};

interface RankDisplayProps {
  rank: RankType | null;
}

export function RankDisplay({ rank }: RankDisplayProps) {
  // Default to Associate if rank is null (though it shouldn't be based on user's info)
  const currentRank: RankType = rank || 'Associate';
  const config = rankConfigs[currentRank];
  const Icon = config.icon;

  return (
    <Card className='mx-auto max-w-4xl border-2'>
      <CardContent className='p-6'>
        <div className='flex flex-col items-center gap-4 sm:flex-row sm:items-start'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5'>
            <Icon className='h-8 w-8 text-primary' />
          </div>
          <div className='flex-1 text-center sm:text-left'>
            <div className='mb-2 flex items-center gap-2 justify-center sm:justify-start'>
              <span className='text-sm font-medium text-muted-foreground'>
                Rank:
              </span>
              <Badge
                variant={config.badgeVariant}
                className={`text-sm font-semibold ${config.badgeClassName}`}
              >
                {currentRank}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
