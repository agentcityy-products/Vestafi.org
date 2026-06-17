'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { type ProfileFormData, profileSchema } from '@/schema/profile';
import { upsertProfile } from '@/actions/profile';

import { BankDetailsForm } from '@/components/profile/bank-details-form';
import { NextOfKinForm } from '@/components/profile/next-of-kin-form';
import { PersonalInfoForm } from '@/components/profile/personal-info-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

interface SettingsFormProps {
  profile?: ProfileFormData | null;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {
      first_name: '',
      last_name: '',
      phone: '',
      country_code: 'UG',
      bank_name: '',
      account_number: '',
      account_name: '',
      next_of_kin: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country_code: 'UG',
        address: '',
        relationship: '',
      },
    },
  });

  const { execute: executeProfile, isExecuting: isProfileExecuting } =
    useAction(upsertProfile, {
      onSuccess: () => {
        toast.success('Profile updated successfully!');
        queryClient.invalidateQueries({ queryKey: [QueryKeys.PROFILE] });
      },
      onError,
    });

  function onSubmit(values: ProfileFormData) {
    executeProfile(values);
  }

  return (
    <Card className='mx-auto max-w-4xl'>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and bank details for payments.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-8'>
            <PersonalInfoForm />
            <Separator />
            <NextOfKinForm />
            <Separator />
            <BankDetailsForm />
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button type='submit' isLoading={isProfileExecuting}>
              Save Settings
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
