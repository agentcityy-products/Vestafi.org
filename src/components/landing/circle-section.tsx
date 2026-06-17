'use client';

import { Check, Crown, Gem, Star } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CircleSection = () => {
  const benefits = [
    'Access to co-own rental apartments → starting at UGX 1M',
    'Monthly rental income, directly tied to your contribution',
    'Priority access to new properties before the public',
    'A seat at the table where real estate decisions are made',
  ];

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl'>
              The Circle – What You Get When You're In
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-emerald-200'>
              This is not a product. This is a private circle of serious savers
              and silent earners.
            </p>
          </div>

          <Card className='border-emerald-400/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 shadow-2xl backdrop-blur-sm'>
            <CardHeader className='relative'>
              <div className='absolute right-4 top-4'>
                <Crown className='h-8 w-8 text-emerald-400/50' />
              </div>
              <CardTitle className='flex items-center justify-center gap-2 text-center text-xl text-white'>
                <Star className='h-5 w-5 text-emerald-400' />
                If accepted, you gain:
                <Star className='h-5 w-5 text-emerald-400' />
              </CardTitle>
            </CardHeader>
            <CardContent className='relative space-y-6'>
              {benefits.map((benefit, index) => (
                <div key={index} className='group flex items-start gap-4'>
                  <div className='mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg transition-transform duration-200 group-hover:scale-110'>
                    <Check className='h-4 w-4 font-bold text-white' />
                  </div>
                  <p className='font-medium text-white transition-colors duration-200 group-hover:text-emerald-100'>
                    {benefit}
                  </p>
                </div>
              ))}

              <div className='mt-8 border-t border-emerald-400/30 pt-6'>
                <p className='text-center text-emerald-200'>
                  No bank loans. No complicated jargon. No public noise.{' '}
                  <span className='bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text font-medium text-transparent text-white'>
                    Just real estate, made beautifully simple.
                  </span>
                </p>
              </div>

              {/* Decorative elements */}
              <div className='absolute left-4 top-4'>
                <Gem className='h-6 w-6 text-emerald-400/30' />
              </div>
              <div className='absolute bottom-4 right-4'>
                <Gem className='h-4 w-4 text-green-400/30' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating animated elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='animate-float absolute left-10 top-20'>
          <Star className='h-6 w-6 text-emerald-400/20' />
        </div>
        <div className='animate-float-delayed absolute right-20 top-40'>
          <Crown className='h-8 w-8 text-green-400/20' />
        </div>
        <div className='animate-float-slow absolute bottom-40 left-20'>
          <Gem className='h-5 w-5 text-teal-400/20' />
        </div>
        <div className='animate-float absolute bottom-20 right-10'>
          <Star className='h-4 w-4 text-emerald-400/20' />
        </div>
      </div>

      {/* Background decorative blobs */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-emerald-600/20 to-green-600/20 blur-3xl'></div>
        <div className='absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 transform rounded-full bg-gradient-to-r from-green-600/20 to-teal-600/20 blur-3xl'></div>
      </div>

      {/* Sparkle effect */}
      <div
        className='absolute inset-0 opacity-30'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(52 211 153 / 0.05)'%3e%3cpath d='m0 .5 32 0M.5 0v32'/%3e%3c/svg%3e")`,
        }}
      ></div>
    </section>
  );
};
