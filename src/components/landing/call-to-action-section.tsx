'use client';

import { ArrowRight, Lock, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { paths } from '@/constants/paths';

export const CallToActionSection = () => {
  return (
    <section
      id='apply'
      className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 py-24 sm:py-32'
    >
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl'>
            There is no public sign-up. There is only a quiet application.
          </h2>

          <div className='mb-12 space-y-6'>
            <p className='text-lg text-emerald-200'>
              We don't believe in mass marketing. We believe in alignment.
            </p>
            <p className='text-xl font-medium text-white'>
              If this resonates, you're ready. Raise your hand → quietly.
            </p>
          </div>

          <Card className='hover:shadow-3xl mx-auto max-w-md transform border-emerald-400/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105'>
            <CardHeader className='relative'>
              <div className='absolute right-4 top-4'>
                <Sparkles className='h-6 w-6 text-emerald-400/50' />
              </div>
              <CardTitle className='flex items-center justify-center gap-2 text-emerald-400'>
                <Lock className='h-5 w-5' />
                Exclusive Access
              </CardTitle>
            </CardHeader>
            <CardContent className='relative space-y-6'>
              <p className='text-sm text-emerald-200'>
                Join the inner circle of real estate co-owners
              </p>

              <Button
                asChild
                size='lg'
                className='group w-full transform bg-gradient-to-r from-emerald-500 to-green-600 py-6 text-lg font-semibold text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:from-emerald-600 hover:to-green-700'
              >
                <Link
                  href={paths.auth.apply}
                  className='flex items-center justify-center gap-2'
                >
                  🔐 Apply to Join the Inner Circle
                  <ArrowRight className='h-5 w-5 transition-transform duration-200 group-hover:translate-x-1' />
                </Link>
              </Button>

              <p className='text-xs text-emerald-300'>
                Applications are reviewed by real humans, not bots
              </p>

              {/* Decorative elements */}
              <div className='absolute left-4 top-4'>
                <Shield className='h-5 w-5 text-emerald-400/30' />
              </div>
              <div className='absolute bottom-4 right-4'>
                <Lock className='h-4 w-4 text-green-400/30' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating animated elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='animate-float absolute left-10 top-20'>
          <Sparkles className='h-6 w-6 text-emerald-400/20' />
        </div>
        <div className='animate-float-delayed absolute right-20 top-40'>
          <Lock className='h-8 w-8 text-green-400/20' />
        </div>
        <div className='animate-float-slow absolute bottom-40 left-20'>
          <Shield className='h-5 w-5 text-teal-400/20' />
        </div>
        <div className='animate-float absolute bottom-20 right-10'>
          <ArrowRight className='h-4 w-4 text-emerald-400/20' />
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-emerald-600/20 to-green-600/20 blur-3xl'></div>
        <div className='absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 transform rounded-full bg-gradient-to-r from-green-600/20 to-teal-600/20 blur-3xl'></div>
      </div>

      {/* Animated grid pattern */}
      <div
        className='absolute inset-0 opacity-10'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(52 211 153 / 0.3)'%3e%3cpath d='m0 .5 32 0M.5 0v32'/%3e%3c/svg%3e")`,
        }}
      ></div>
    </section>
  );
};
