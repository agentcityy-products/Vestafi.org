'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

export const AboutCTASection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-3xl text-center'>
          <h2 className='mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl'>
            Why apply now
          </h2>
          <p className='mb-8 text-xl leading-relaxed text-emerald-200'>
            Because Vestafi is still practical enough to be intentional, early
            enough to matter, and disciplined enough to remain private.
          </p>
          <p className='mb-12 text-lg leading-relaxed text-slate-300'>
            Vestafi operates as a private, invitation-based collective.
            Participation is voluntary, non-public, and tied to specific
            apartments held internally, with outcomes dependent on actual
            operations rather than guarantees.
          </p>
          <Button
            asChild
            size='lg'
            className='bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
          >
            <Link href={paths.auth.apply}>Apply to Join</Link>
          </Button>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-400/10 to-green-400/10 blur-3xl'></div>
        <div className='absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-green-400/10 to-teal-400/10 blur-3xl'></div>
      </div>
    </section>
  );
};

