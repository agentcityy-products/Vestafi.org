'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { paths } from '@/constants/paths';

export const FractionalOwnershipSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl'>
              The future of real estate investing is fractional
            </h2>
          </div>

          <Card className='border-emerald-400/30 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-2xl backdrop-blur-sm'>
            <CardContent className='p-8 sm:p-12'>
              <div className='space-y-6 text-lg leading-relaxed text-slate-200 sm:text-xl'>
                <p>
                  Fractional ownership has for many institutions and is likely
                  to continue into the future as Uganda races to solve the
                  housing deficit of 2.4 Million units.
                </p>
                <p>
                  Fractional ownership democratizes access to real estate, and
                  therefore distributes and minimizes the risks and labor
                  involved with owning property. And Vestafi makes it even
                  simpler!
                </p>
              </div>
            </CardContent>
          </Card>

          <div className='mt-12 text-center'>
            <Button
              asChild
              size='lg'
              className='bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
            >
              <Link href={paths.auth.apply}>
                Apply to join the inner Circle
              </Link>
            </Button>
          </div>
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

