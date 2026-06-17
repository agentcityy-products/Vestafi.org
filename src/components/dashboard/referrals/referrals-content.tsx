'use client';

import { Copy, ExternalLink, Gift, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useReferralStats, useUserReferrals } from '@/hooks/queries/referrals';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatCurrency } from '@/utils/number-functions';

export function ReferralsContent() {
  const [copied, setCopied] = useState(false);
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const { data: referrals, isLoading: referralsLoading } = useUserReferrals();

  const referralUrl = stats?.referral_code
    ? `${window.location.origin}/apply?ref=${stats.referral_code}`
    : '';

  const copyReferralLink = async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy referral link');
    }
  };

  const copyReferralCode = async () => {
    if (!stats?.referral_code) return;

    try {
      await navigator.clipboard.writeText(stats.referral_code);
      toast.success('Referral code copied to clipboard!');
    } catch {
      toast.error('Failed to copy referral code');
    }
  };

  if (statsLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (!stats?.referral_code) {
    return (
      <Alert>
        <AlertDescription>
          Your referral code is being generated. Please refresh the page in a
          moment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Referral Code & Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              Referral Code
            </label>
            <div className='flex items-center gap-2'>
              <code className='flex-1 rounded-md border bg-muted px-4 py-3 font-mono text-lg'>
                {stats.referral_code}
              </code>
              <Button
                variant='outline'
                size='icon'
                onClick={copyReferralCode}
                className='h-10 w-10'
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              Referral Link
            </label>
            <div className='flex items-center gap-2'>
              <code className='flex-1 truncate rounded-md border bg-muted px-4 py-3 text-sm'>
                {referralUrl}
              </code>
              <Button
                variant='outline'
                size='icon'
                onClick={copyReferralLink}
                className='h-10 w-10'
              >
                {copied ? (
                  <ExternalLink className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Referrals
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_referrals}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Total number of people you've referred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <Badge variant='secondary'>{stats.pending_referrals}</Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.pending_referrals}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Referrals awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Approved</CardTitle>
            <Badge variant='default'>{stats.approved_referrals}</Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.approved_referrals}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Referrals that have been approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Invested</CardTitle>
            <Badge variant='outline' className='bg-green-50 text-green-700'>
              {stats.invested_referrals}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.invested_referrals}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Referrals who have made investments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Card */}
      {(stats.total_rewards > 0 || stats.reward_per_referral > 0) && (
        <Card className='border-green-200 bg-green-50/50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Gift className='h-5 w-5 text-green-600' />
              Referral Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Reward per Referral
              </span>
              <span className='font-semibold'>
                {formatCurrency(stats.reward_per_referral)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Total Rewards Earned
              </span>
              <span className='text-2xl font-bold text-green-700'>
                {formatCurrency(stats.total_rewards)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className='space-y-2'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : referrals && referrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => {
                  type ReferralWithReferee = typeof referral & {
                    referee?: { name: string; email: string } | null;
                  };
                  const referralWithReferee = referral as ReferralWithReferee;
                  const referee = referralWithReferee.referee;

                  const getStatusBadge = (status: string | null) => {
                    switch (status) {
                      case 'pending':
                        return <Badge variant='secondary'>Pending</Badge>;
                      case 'approved':
                        return <Badge variant='default'>Approved</Badge>;
                      case 'invested':
                        return (
                          <Badge
                            variant='outline'
                            className='bg-green-50 text-green-700'
                          >
                            Invested
                          </Badge>
                        );
                      default:
                        return <Badge variant='secondary'>Unknown</Badge>;
                    }
                  };

                  return (
                    <TableRow key={referral.id}>
                      <TableCell>{referee?.name || 'N/A'}</TableCell>
                      <TableCell>{referee?.email || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell>
                        {referral.created_at
                          ? new Date(referral.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>
                You haven't referred anyone yet. Share your referral link to
                start earning rewards!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
