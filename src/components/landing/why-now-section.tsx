'use client';

import { Clock, Target, TrendingUp, Zap } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export const WhyNowSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mb-12 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
            Why Now?
          </h2>

          <Card className='hover:shadow-3xl transform border-emerald-200 bg-gradient-to-br from-white/90 to-emerald-50/90 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105'>
            <CardContent className='relative overflow-hidden p-8 sm:p-12'>
              <div className='relative z-10 space-y-6 text-lg'>
                <p className='flex items-center justify-center gap-3 font-medium text-slate-900'>
                  <Clock className='h-6 w-6 text-emerald-600' />
                  The first units are already owned. The rent is already being
                  distributed. The circle is already growing.
                </p>

                <p className='flex items-center justify-center gap-3 text-slate-700'>
                  <Target className='h-6 w-6 text-teal-600' />
                  We're not inviting everyone. We're inviting a few brave first
                  movers who want to build quietly and earn openly.
                </p>

                <p className='flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-semibold text-transparent'>
                  <Zap className='h-7 w-7 text-emerald-600' />
                  This is your whisper before the wave.
                </p>
              </div>

              {/* Decorative elements */}
              <div className='absolute left-4 top-4'>
                <TrendingUp className='h-8 w-8 text-emerald-400/20' />
              </div>
              <div className='absolute bottom-4 right-4'>
                <Clock className='h-6 w-6 text-teal-400/20' />
              </div>

              {/* Animated pulse effect */}
              <div className='animate-pulse-glow absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/5 to-teal-400/5'></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute right-10 top-10 h-72 w-72 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/20 blur-3xl'></div>
        <div className='absolute bottom-10 left-10 h-64 w-64 rounded-full bg-gradient-to-r from-teal-200/20 to-cyan-200/20 blur-3xl'></div>
      </div>

      {/* Grid pattern */}
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(5 150 105 / 0.1)'%3e%3cpath d='m0 .5 32 0M.5 0v32'/%3e%3c/svg%3e")`,
        }}
      ></div>
    </section>
  );
};
