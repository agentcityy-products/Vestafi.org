'use client';

import Link from 'next/link';

import Logo from '@/components/common/logo';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

export const LandingFooter = () => {
  return (
    <footer className='border-t bg-muted/30'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='space-y-4'>
            <Logo width={100} />
            <p className='max-w-xs text-sm text-muted-foreground'>
              Making real estate ownership simple, profitable & accessible
              across East Africa.
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
              Invite-only real estate co-ownership platform
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
