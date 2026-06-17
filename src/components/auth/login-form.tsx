'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  type EmailFormData,
  emailSchema,
  type OTPFormData,
  otpSchema,
} from '@/schema/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

import { supabase } from '@/lib/supabase/client';

import { paths } from '@/constants/paths';

export function LoginForm() {
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
      });

      if (error) {
        if (error.code === 'signup_disabled')
          toast.error(
            'Your email does not have an account. Please join the waitlist to get access.',
            {
              action: (
                <Link href={paths.auth.apply}>
                  <Button variant='secondary'>Apply</Button>
                </Link>
              ),
            },
          );
        else toast.error(error.message);
      } else {
        setEmail(data.email);
        setShowOTP(true);
        toast.success('OTP sent to your email!');
      }
    } catch {
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: data.otp,
        type: 'email',
      });

      if (error) throw new Error(error.message);

      toast.success('Successfully logged in!');
      window.location.href = paths.dashboard.root;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    }
  };

  return (
    <div className='w-full space-y-6'>
      {!showOTP ? (
        <>
          <div className='space-y-2 text-center'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Sign in to your account
            </h2>
            <p className='text-sm text-muted-foreground'>
              We'll send you a secure login code
            </p>
          </div>

          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email address
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email address'
                  className='h-11 pl-10'
                  {...emailForm.register('email')}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className='text-sm text-destructive'>
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button
              type='submit'
              className='h-11 w-full'
              isLoading={emailForm.formState.isSubmitting}
            >
              Send login code
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className='space-y-2 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
              <Shield className='h-6 w-6 text-green-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Enter verification code
            </h2>
            <p className='text-sm text-muted-foreground'>
              We sent a 6-digit code to{' '}
              <span className='font-medium text-gray-900'>{email}</span>
            </p>
          </div>

          <form
            onSubmit={otpForm.handleSubmit(onOTPSubmit)}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor='otp' className='text-sm font-medium'>
                Verification code
              </Label>
              <Controller
                control={otpForm.control}
                name='otp'
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    className='w-full'
                  >
                    <InputOTPGroup className='w-full justify-center gap-2'>
                      <InputOTPSlot index={0} className='h-12 w-12' />
                      <InputOTPSlot index={1} className='h-12 w-12' />
                      <InputOTPSlot index={2} className='h-12 w-12' />
                      <InputOTPSlot index={3} className='h-12 w-12' />
                      <InputOTPSlot index={4} className='h-12 w-12' />
                      <InputOTPSlot index={5} className='h-12 w-12' />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {otpForm.formState.errors.otp && (
                <p className='text-sm text-destructive'>
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>
            <Button
              type='submit'
              className='h-11 w-full'
              isLoading={otpForm.formState.isSubmitting}
            >
              Verify code
            </Button>
            <Button
              type='button'
              variant='ghost'
              className='h-11 w-full'
              onClick={() => setShowOTP(false)}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to email
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
