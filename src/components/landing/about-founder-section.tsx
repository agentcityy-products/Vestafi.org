'use client';

import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';

export const AboutFounderSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/30 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
              About the founder
            </h2>
          </div>

          <Card className='border-slate-200/80 bg-gradient-to-br from-white to-emerald-50/50 shadow-xl'>
            <CardContent className='p-8 sm:p-12'>
              <div className='flex flex-col gap-8 sm:flex-row sm:gap-12'>
                {/* Founder Image */}
                <div className='flex-shrink-0'>
                  <div className='relative overflow-hidden rounded-2xl shadow-lg ring-4 ring-white'>
                    <Image
                      src='/images/hakiza-ronald.jpg'
                      alt='Hakiza Ronald'
                      width={256}
                      height={256}
                      className='h-48 w-48 object-cover sm:h-64 sm:w-64'
                    />
                  </div>
                </div>

                {/* Founder Content */}
                <div className='flex-1'>
                  <h3 className='mb-2 text-2xl font-bold text-slate-900 sm:text-3xl'>
                    Hakiza Ronald
                  </h3>
                  <p className='mb-6 text-sm font-medium text-emerald-700'>
                    Founder & Operator
                  </p>
                  <div className='space-y-5 text-base leading-relaxed text-slate-700'>
                    <p>
                      Hakiza Ronald is an entrepreneur and operator with a
                      record of building, scaling, and exiting practical
                      ventures in East Africa. Before Vestafi, he founded
                      <span className='font-semibold text-slate-900'>
                        {' '}
                        Ugabus.com
                      </span>{' '}
                      in 2015, Uganda's first reliable bus e-ticketing platform,
                      which scaled across Sub-Saharan Africa and was successfully
                      exited in 2022.
                    </p>
                    <div className='rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50 p-4'>
                      <p className='text-base leading-relaxed text-slate-800'>
                        He is an alumnus of{' '}
                        <span className='font-semibold'>YALI</span> and the{' '}
                        <span className='font-semibold'>U.S. IVLP</span>, with a
                        philosophy rooted in discipline, documentation, and
                        long-term sustainability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-200/20 to-green-200/20 blur-3xl'></div>
        <div className='absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-green-200/20 to-teal-200/20 blur-3xl'></div>
      </div>
    </section>
  );
};
