'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { type EmailFormData, emailSchema } from '@/schema/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { supabase } from '@/lib/supabase/client';

import { paths } from '@/constants/paths';

export function LoginForm() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}${paths.auth.callback}`,
        },
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
        setEmailSent(true);
        toast.success('Secure sign-in link sent!');
      }
    } catch {
      toast.error('Failed to send sign-in link. Please try again.');
    }
  };

  return (
    <div className='w-full space-y-6'>
      {!emailSent ? (
        <>
          <div className='space-y-2 text-center'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Sign in to your account
            </h2>
            <p className='text-sm text-muted-foreground'>
              We'll email you a secure sign-in link
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
              Send sign-in link
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className='space-y-2 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
              <MailCheck className='h-6 w-6 text-green-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Check your email
            </h2>
            <p className='text-sm text-muted-foreground'>
              We sent a secure sign-in link to{' '}
              <span className='font-medium text-gray-900'>{email}</span>
            </p>
            <p className='text-sm text-muted-foreground'>
              Open the link in the same browser to finish signing in.
            </p>
          </div>
          <Button
            type='button'
            variant='ghost'
            className='h-11 w-full'
            onClick={() => setEmailSent(false)}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Use a different email
          </Button>
        </>
      )}
    </div>
  );
}
