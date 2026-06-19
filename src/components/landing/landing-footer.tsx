'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

import Logo from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

export const LandingFooter = () => {
  const [email, setEmail] = useState('');

  const requestUpdates = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    window.location.href = `mailto:${appConfig.emails.support}?subject=${encodeURIComponent(
      'Private Vestafi Updates',
    )}&body=${encodeURIComponent(`Please add ${email} to Vestafi updates.`)}`;
  };

  return (
    <footer className='border-t bg-muted/30'>
      <div className='container mx-auto px-4 pt-12'>
        <div className='mb-12 grid gap-6 rounded-[2rem] bg-stone-950 p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300'>
              Inside Vestafi
            </p>
            <h2 className='mt-3 text-2xl font-semibold tracking-tight sm:text-3xl'>
              Receive Private Vestafi Updates
            </h2>
            <p className='mt-2 text-sm text-stone-300'>
              Apartment openings, distributions, and society updates.
            </p>
          </div>
          <form
            onSubmit={requestUpdates}
            className='flex w-full max-w-md flex-col gap-3 sm:flex-row'
          >
            <Input
              type='email'
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='Your email address'
              className='h-11 border-stone-700 bg-stone-900 text-white placeholder:text-stone-500'
              aria-label='Email address for Vestafi updates'
            />
            <Button
              type='submit'
              className='h-11 shrink-0 bg-white text-stone-950 hover:bg-stone-100'
            >
              Stay Updated
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </div>
      </div>

      <div className='container mx-auto px-4 pb-12'>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='space-y-4'>
            <Logo width={100} />
            <p className='max-w-xs text-sm text-muted-foreground'>
              A private apartment ownership society built around clarity,
              structure, and long-term trust.
            </p>
          </div>

          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground'>Company</h3>
            <div className='space-y-2 text-sm'>
              <Link
                href={paths.howItWorks}
                className='block text-muted-foreground transition-colors hover:text-foreground'
              >
                How It Works
              </Link>
              <Link
                href={paths.about}
                className='block text-muted-foreground transition-colors hover:text-foreground'
              >
                About
              </Link>
              <Link
                href={paths.auth.apply}
                className='block text-muted-foreground transition-colors hover:text-foreground'
              >
                Apply to Join
              </Link>
              <Link
                href={paths.support}
                className='block text-muted-foreground transition-colors hover:text-foreground'
              >
                Support
              </Link>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground'>Legal</h3>
            <div className='space-y-2 text-sm'>
              <Link
                href={paths.legal.privacy}
                className='block text-muted-foreground transition-colors hover:text-foreground'
              >
                Privacy Policy
              </Link>
              <Link
                href={paths.legal.terms}
                className='block text-muted-foreground transition-colors hover:text-foreground'
              >
                Terms of Service
              </Link>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground'>Contact</h3>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>{appConfig.emails.support}</p>
              <p>Uganda, East Africa</p>
            </div>
          </div>
        </div>

        <div className='mt-8 border-t border-border pt-8'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <p className='text-sm text-muted-foreground'>
              © {new Date().getFullYear()} {appConfig.title}. All rights
              reserved.
            </p>
            <p className='text-sm text-muted-foreground'>
              Private apartment ownership, thoughtfully managed
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
