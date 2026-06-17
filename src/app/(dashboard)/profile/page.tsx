'use client';

import { AlertCircle } from 'lucide-react';

import { useProfile } from '@/hooks/queries/profile';

import { SettingsForm } from '@/components/profile/profile-form';
import { RankDisplay } from '@/components/profile/rank-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { data: profile, isLoading, error } = useProfile();

  // Transform profile data to match the required form type
  const flattenedProfile = profile
    ? {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        country_code: profile.country_code || 'UG',
        bank_name: profile.bank_info?.bank_name || '',
        account_number: profile.bank_info?.account_number || '',
        account_name: profile.bank_info?.account_name || '',
        next_of_kin: profile.next_of_kin || undefined,
      }
    : null;

  if (error) {
    return (
      <div className='container mx-auto py-10'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load profile data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='container mx-auto space-y-6 py-10'>
        <Card className='mx-auto max-w-4xl'>
          <CardContent className='p-6'>
            <div className='flex flex-col items-center gap-4 sm:flex-row sm:items-start'>
              <Skeleton className='h-16 w-16 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-full' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='mx-auto max-w-4xl'>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <Skeleton className='h-4 w-[250px]' />
          </CardHeader>
          <CardContent className='space-y-8'>
            <div className='space-y-4'>
              <Skeleton className='h-8 w-[200px]' />
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Skeleton className='h-20' />
                <Skeleton className='h-20' />
              </div>
              <Skeleton className='h-20' />
            </div>
            <Skeleton className='h-[1px] w-full' />
            <div className='space-y-4'>
              <Skeleton className='h-8 w-[200px]' />
              <Skeleton className='h-20' />
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Skeleton className='h-20' />
                <Skeleton className='h-20' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6 py-10'>
      <RankDisplay rank={profile?.rank_types || null} />
      <SettingsForm profile={flattenedProfile} />
    </div>
  );
}
