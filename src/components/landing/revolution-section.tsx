'use client';

import { ArrowRight, Lock, Unlock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export const RevolutionSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
              The Quiet Revolution Has Begun
            </h2>
          </div>

          <div className='relative grid gap-8 lg:grid-cols-2'>
            {/* Arrow between cards on desktop */}
            <div className='absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 transform lg:flex'>
              <div className='rounded-full border-2 border-emerald-200 bg-white p-3 shadow-lg'>
                <ArrowRight className='h-6 w-6 text-emerald-600' />
              </div>
            </div>

            <Card className='transform border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl'>
              <CardContent className='relative overflow-hidden p-8'>
                <div className='absolute right-4 top-4'>
                  <Lock className='h-8 w-8 text-red-400/30' />
                </div>
                <h3 className='mb-4 text-xl font-semibold text-slate-900'>
                  The Old Way
                </h3>
                <div className='space-y-3 text-slate-700'>
                  <p>
                    For too long, real estate in Uganda has been a locked door.
                  </p>
                  <p>
                    Only those with millions or connections ever get the keys.
                    And the rest?
                  </p>
                  <p className='font-medium text-red-700'>
                    They hustle. They save. And they wait. Forever.
                  </p>
                </div>
                {/* Decorative gradient overlay */}
                <div className='absolute bottom-0 right-0 h-32 w-32 translate-x-16 translate-y-16 transform rounded-full bg-gradient-to-tl from-red-200/20 to-transparent'></div>
              </CardContent>
            </Card>

            <Card className='transform border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl'>
              <CardContent className='relative overflow-hidden p-8'>
                <div className='absolute right-4 top-4'>
                  <Unlock className='h-8 w-8 text-emerald-400/30' />
                </div>
                <h3 className='mb-4 text-xl font-semibold text-slate-900'>
                  The VESTAFI Way
                </h3>
                <div className='space-y-3 text-slate-700'>
                  <p className='font-medium text-slate-900'>But not anymore.</p>
                  <p>
                    VESTAFI is rewriting the rules. You don't need to go it
                    alone.
                  </p>
                  <p className='font-medium text-emerald-700'>
                    Together, we co-buy the future — one apartment at a time.
                  </p>
                </div>
                {/* Decorative gradient overlay */}
                <div className='absolute bottom-0 right-0 h-32 w-32 translate-x-16 translate-y-16 transform rounded-full bg-gradient-to-tl from-emerald-200/20 to-transparent'></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-20 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-200/20 to-green-200/20 blur-3xl'></div>
        <div className='absolute bottom-20 right-10 h-80 w-80 rounded-full bg-gradient-to-r from-green-200/20 to-teal-200/20 blur-3xl'></div>
      </div>

      {/* Animated grid pattern */}
      <div
        className='absolute inset-0 opacity-40'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(34 197 94 / 0.03)'%3e%3cpath d='m0 .5 32 0M.5 0v32'/%3e%3c/svg%3e")`,
        }}
      ></div>
    </section>
  );
};
