'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useAllReferralRewards,
  useAllReferrals,
} from '@/hooks/queries/referrals';

import { setRewardPerReferral } from '@/actions/referrals';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
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
import { getFullName } from '@/utils/string-functions';

import { QueryKeys } from '@/constants/query-keys';

const rewardSchema = z.object({
  reward_per_referral: z.number().min(0, 'Reward must be 0 or greater'),
});

type RewardFormData = z.infer<typeof rewardSchema>;

export function AdminReferralsContent() {
  const [filterStatus, setFilterStatus] = useState<
    'pending' | 'approved' | 'invested' | 'all'
  >('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: referrals, isLoading: referralsLoading } = useAllReferrals(
    undefined,
    filterStatus === 'all' ? undefined : filterStatus,
  );

  const { data: rewards, isLoading: rewardsLoading } = useAllReferralRewards();

  const rewardForm = useForm<RewardFormData>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      reward_per_referral: 50_000, // Default reward per referral
    },
  });

  const setRewardAction = useAction(setRewardPerReferral, {
    onSuccess: () => {
      toast.success('Reward per referral updated successfully');
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REFERRALS] });
      setIsRewardDialogOpen(false);
      setSelectedUserId(null);
      rewardForm.reset();
    },
    onError: (error) => {
      toast.error(
        error.error.serverError || 'Failed to update reward per referral',
      );
    },
  });

  const handleSetReward = (userId: string, currentReward: number) => {
    setSelectedUserId(userId);
    rewardForm.setValue('reward_per_referral', currentReward);
    setIsRewardDialogOpen(true);
  };

  const onSubmitReward = (data: RewardFormData) => {
    if (!selectedUserId) return;
    setRewardAction.execute({
      user_id: selectedUserId,
      reward_per_referral: data.reward_per_referral,
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant='secondary'>Pending</Badge>;
      case 'approved':
        return <Badge variant='default'>Approved</Badge>;
      case 'invested':
        return (
          <Badge variant='outline' className='bg-green-50 text-green-700'>
            Invested
          </Badge>
        );
      default:
        return <Badge variant='secondary'>Unknown</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>All Referrals</CardTitle>
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(
                  value as 'pending' | 'approved' | 'invested' | 'all',
                )
              }
            >
              <SelectTrigger className='w-48'>
                {filterStatus === 'all'
                  ? 'All Statuses'
                  : filterStatus.charAt(0).toUpperCase() +
                    filterStatus.slice(1)}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='approved'>Approved</SelectItem>
                <SelectItem value='invested'>Invested</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referee</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => {
                  type ReferralWithProfiles = typeof referral & {
                    referrer?: {
                      name: string;
                      email: string;
                      referral_code: string;
                    } | null;
                    referee?: { name: string; email: string } | null;
                  };
                  const referralWithProfiles = referral as ReferralWithProfiles;
                  const referrer = referralWithProfiles.referrer;
                  const referee = referralWithProfiles.referee;

                  return (
                    <TableRow key={referral.id}>
                      <TableCell>
                        {referrer
                          ? `${referrer.name} (${referrer.email})`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {referee ? `${referee.name} (${referee.email})` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <code className='rounded bg-muted px-2 py-1 text-sm'>
                          {referral.referral_code}
                        </code>
                      </TableCell>
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
              <AlertDescription>No referrals found.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Rewards Management */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Rewards Management</CardTitle>
        </CardHeader>
        <CardContent>
          {rewardsLoading ? (
            <div className='space-y-2'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : rewards && rewards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reward per Referral</TableHead>
                  <TableHead>Total Invested Referrals</TableHead>
                  <TableHead>Total Rewards</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => {
                  const profile = reward.profile as {
                    first_name: string;
                    last_name: string;
                    email: string;
                    referral_code: string;
                  } | null;

                  return (
                    <TableRow key={reward.id}>
                      <TableCell>
                        {profile
                          ? `${getFullName(profile.first_name, profile.last_name)} (${profile.email})`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(reward.reward_per_referral || 0)}
                      </TableCell>
                      <TableCell>{reward.total_referrals || 0}</TableCell>
                      <TableCell className='font-semibold'>
                        {formatCurrency(reward.total_rewards || 0)}
                      </TableCell>
                      <TableCell>
                        {reward.user_id && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleSetReward(
                                reward.user_id!,
                                reward.reward_per_referral || 0,
                              )
                            }
                          >
                            Set Reward
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>
                No reward records found. Rewards will be created automatically
                when users earn their first referral reward.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Set Reward Dialog */}
      <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Reward per Referral</DialogTitle>
            <DialogDescription>
              Set the reward amount that will be given for each invested
              referral.
            </DialogDescription>
          </DialogHeader>
          <Form {...rewardForm}>
            <form
              onSubmit={rewardForm.handleSubmit(onSubmitReward)}
              className='space-y-4'
            >
              <FormField
                control={rewardForm.control}
                name='reward_per_referral'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward per Referral (UGX)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step={1000}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsRewardDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  isLoading={setRewardAction.status === 'executing'}
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
