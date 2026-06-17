'use client';

import { CheckCircle2, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { paths } from '@/constants/paths';

const benefits = [
  {
    icon: Users,
    title: 'For the disciplined saver',
    description:
      'You finally want to belong to an Elite society of landlords earning rental income. Apply.',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'from-emerald-50 to-green-50',
  },
  {
    icon: TrendingUp,
    title: 'For the established investor',
    description:
      'You seek structure? Vestafi offers clarity, visibility, and participation anchored to real apartments without performance theatrics.',
    color: 'from-green-500 to-teal-500',
    bgColor: 'from-green-50 to-teal-50',
  },
  {
    icon: Zap,
    title: 'For Airbnb operators & owners',
    description:
      "You already own the asset. Tap into Vestafi's short-stay demand, get more vetted guests, and internal booking flow.",
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'from-teal-50 to-cyan-50',
  },
  {
    icon: CheckCircle2,
    title: 'For those playing the long game',
    description:
      'Your position deepens with time, alignment, and contribution.',
    color: 'from-cyan-500 to-emerald-500',
    bgColor: 'from-cyan-50 to-emerald-50',
  },
];

export const WhyApplySection = () => {
  return (
    <section className='relative overflow-hidden bg-white py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
              Why you should apply to join
            </h2>
          </div>

          {/* Benefits Grid */}
          <div className='mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card
                  key={index}
                  className={`border-slate-200 bg-gradient-to-br ${benefit.bgColor} group transform shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                >
                  <CardContent className='relative overflow-hidden p-6 text-center'>
                    <div className='mb-4 flex justify-center'>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${benefit.color} shadow-lg transition-transform duration-200 group-hover:scale-110`}
                      >
                        <IconComponent className='h-6 w-6 text-white' />
                      </div>
                    </div>

                    <h3 className='mb-3 font-semibold text-slate-900 transition-colors duration-200 group-hover:text-slate-700'>
                      {benefit.title}
                    </h3>

                    <p className='text-sm leading-relaxed text-slate-600 transition-colors duration-200 group-hover:text-slate-700'>
                      {benefit.description}
                    </p>

                    {/* Decorative gradient overlay */}
                    <div
                      className={`absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-tl ${benefit.color} translate-x-8 translate-y-8 transform rounded-full opacity-5`}
                    ></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Note and CTA */}
          <div className='text-center'>
            <p className='mb-8 text-base font-medium text-slate-700 sm:text-lg'>
              Applications are reviewed by humans. Acceptance is not automatic.
            </p>
            <Button
              asChild
              size='lg'
              className='bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
            >
              <Link href={paths.auth.apply}>
                Apply to Join the Inner Circle
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-200/10 to-green-200/10 blur-3xl'></div>
        <div className='absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-green-200/10 to-teal-200/10 blur-3xl'></div>
      </div>
    </section>
  );
};

