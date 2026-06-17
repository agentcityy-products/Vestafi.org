'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  CheckCircle,
  CreditCard,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { type ProfileFormData, profileSchema } from '@/schema/profile';
import { upsertProfile } from '@/actions/profile';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import PhoneInput from '@/components/ui/form/controlled-phone-input';
import { Input } from '@/components/ui/input';

import { onError } from '@/lib/show-error-toast';

import { paths } from '@/constants/paths';

export function OnboardingForm({ email }: { email: string }) {
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      country_code: 'UG',
      phone: '',
      first_name: '',
      last_name: '',
      bank_name: '',
      account_number: '',
      account_name: '',
    },
    mode: 'onChange',
  });

  const { execute: executeProfile, isExecuting: isProfileExecuting } =
    useAction(upsertProfile, {
      onSuccess: () => {
        toast.success('Profile created successfully!', {
          description: 'Redirecting to dashboard...',
        });
        router.push(paths.dashboard.root);
      },
      onError,
    });

  const onSubmit = async (data: ProfileFormData) => {
    executeProfile(data);
  };

  return (
    <div className='min-h-screen px-4 py-12'>
      <div className='mx-auto max-w-4xl'>
        {/* Header Section */}
        <div className='mb-8 text-center'>
          <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary'>
            <User className='h-8 w-8 text-primary-foreground' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Complete Your Profile
          </h1>
          <p className='mx-auto max-w-2xl text-lg text-gray-600'>
            We need a few more details to set up your account and enable
            payments
          </p>
        </div>

        {/* Progress Indicator */}
        <div className='mb-8 flex items-center justify-center'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500'>
                <CheckCircle className='h-5 w-5 text-white' />
              </div>
              <span className='ml-2 text-sm font-medium text-green-600'>
                Account Created
              </span>
            </div>
            <div className='h-1 w-16 rounded bg-gray-200'>
              <div className='h-1 w-full rounded bg-primary'></div>
            </div>
            <div className='flex items-center'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary'>
                <span className='text-sm font-bold text-white'>2</span>
              </div>
              <span className='ml-2 text-sm font-medium text-primary'>
                Profile Setup
              </span>
            </div>
            <div className='h-1 w-16 rounded bg-gray-200'></div>
            <div className='flex items-center'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200'>
                <span className='text-sm font-bold text-gray-500'>3</span>
              </div>
              <span className='ml-2 text-sm font-medium text-gray-500'>
                Dashboard
              </span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Personal Information Card */}
            <Card className='bg-white/80 shadow-lg backdrop-blur-sm'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-lg bg-blue-100 p-2'>
                    <User className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Tell us about yourself so we can personalize your
                      experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='first_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          First Name
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                            <Input
                              placeholder='Enter your first name'
                              className='h-11 border-gray-200 pl-10 focus:border-primary focus:ring-primary'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='last_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                            <Input
                              placeholder='Enter your last name'
                              className='h-11 border-gray-200 pl-10 focus:border-primary focus:ring-primary'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <FormLabel className='text-sm font-medium'>
                      Email Address
                    </FormLabel>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                      <Input
                        value={email}
                        disabled
                        className='h-11 border-gray-200 bg-gray-50 pl-10'
                      />
                      <Badge
                        variant='secondary'
                        className='absolute right-2 top-2 text-xs'
                      >
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <PhoneInput
                      control={form.control}
                      codeName='country_code'
                      phoneName='phone'
                      label='Phone Number'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Information Card */}
            <Card className='bg-white/80 shadow-lg backdrop-blur-sm'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-lg bg-green-100 p-2'>
                    <Building2 className='h-5 w-5 text-green-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Bank Information</CardTitle>
                    <CardDescription>
                      Secure payment details for receiving funds and withdrawals
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='bank_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Bank Name
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Building2 className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                            <Input
                              placeholder='e.g., Chase Bank, Wells Fargo'
                              className='h-11 border-gray-200 pl-10 focus:border-primary focus:ring-primary'
                              autoComplete='off'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='account_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium'>
                          Account Holder Name
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                            <Input
                              placeholder='Name as it appears on account'
                              className='h-11 border-gray-200 pl-10 focus:border-primary focus:ring-primary'
                              autoComplete='off'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='account_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>
                        Account Number
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <CreditCard className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                          <Input
                            placeholder='Enter your account number'
                            className='h-11 border-gray-200 pl-10 focus:border-primary focus:ring-primary'
                            autoComplete='off'
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Security Notice */}
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                  <div className='flex items-start gap-3'>
                    <Shield className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                    <div>
                      <h4 className='mb-1 text-sm font-semibold text-blue-900'>
                        Your data is secure
                      </h4>
                      <p className='text-sm text-blue-700'>
                        All bank information is encrypted using
                        industry-standard security protocols. We never store
                        sensitive data in plain text and only use this
                        information for authorized transactions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className='flex justify-center pt-4'>
              <Button
                type='submit'
                size='lg'
                className='h-12 w-full px-12 text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl md:w-auto'
                disabled={isProfileExecuting}
              >
                {isProfileExecuting ? (
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Setting up your profile...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5' />
                    Complete Registration
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Footer */}
        <div className='mt-8 text-center text-sm text-gray-500'>
          <p>
            By completing registration, you agree to our{' '}
            <a href='#' className='text-primary hover:underline'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href='#' className='text-primary hover:underline'>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
