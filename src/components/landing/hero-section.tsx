'use client';

import { Building2, Shield, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

export const HeroSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-900 to-slate-900 pb-24 pt-32 sm:pb-32 sm:pt-40'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl'>
            Own a Condominium Apartment
            <span className='bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent'>
              {' '}Without Buying It Alone{' '}
            </span>
            .
          </h1>

          <p className='mx-auto mt-8 max-w-2xl text-lg text-slate-300 sm:text-xl'>
            Vestafi is an invite-only elite Inner circle you join to earn rent
            and grow into apartment ownership.
          </p>

          <p className='mx-auto mt-6 max-w-2xl text-lg font-medium text-emerald-200 sm:text-xl'>
            This is ownership by the bold, for the bold.
          </p>

          <p className='mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl'>
            Apartments are being acquired. Rent is already flowing. Will your
            name be on the next payout list?
          </p>

          <div className='mt-12'>
            <Button
              asChild
              size='lg'
              className='transform bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6 text-lg font-semibold text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:from-emerald-600 hover:to-green-700'
            >
              <Link href={paths.auth.apply}>
                Apply to Join the Inner Circle
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating animated icons */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='animate-float absolute left-10 top-20'>
          <Building2 className='h-8 w-8 text-emerald-400/30' />
        </div>
        <div className='animate-float-delayed absolute right-20 top-40'>
          <TrendingUp className='h-6 w-6 text-green-400/30' />
        </div>
        <div className='animate-float-slow absolute bottom-40 left-20'>
          <Users className='h-7 w-7 text-teal-400/30' />
        </div>
        <div className='animate-float absolute bottom-20 right-10'>
          <Shield className='h-5 w-5 text-emerald-400/30' />
        </div>
      </div>

      {/* Enhanced background decoration */}
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]'>
          <div className='aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-teal-600/20 opacity-30'></div>
        </div>
        <div className='absolute bottom-10 right-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl'>
          <div className='aspect-[1108/632] w-[50rem] bg-gradient-to-l from-teal-400/20 via-emerald-500/20 to-green-600/20 opacity-20'></div>
        </div>
      </div>

      {/* Animated grid pattern */}
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(52 211 153 / 0.05)'%3e%3cpath d='m0 .5 32 0M.5 0v32'/%3e%3c/svg%3e")`,
        }}
      ></div>
    </section>
  );
};
