'use client';

import { Check, Key, UserCheck, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export const ProcessSection = () => {
  const steps = [
    {
      icon: UserCheck,
      title: 'Human Review',
      description: 'Your answers are reviewed by a real human (no bots).',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
    },
    {
      icon: Key,
      title: 'Private Invite',
      description:
        "If you're a fit, you'll receive a private invite to the VESTAFI platform.",
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-50 to-teal-50',
    },
    {
      icon: Check,
      title: 'Access Properties',
      description:
        "You'll access current and upcoming apartments available for co-ownership.",
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-50 to-cyan-50',
    },
    {
      icon: Users,
      title: 'Meet the Circle',
      description:
        "You'll meet the other insiders who, like you → chose differently.",
      color: 'from-cyan-500 to-emerald-500',
      bgColor: 'from-cyan-50 to-emerald-50',
    },
  ];

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
              What Happens After You Apply
            </h2>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card
                  key={index}
                  className={`border-slate-200 bg-gradient-to-br ${step.bgColor} group transform shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                >
                  <CardContent className='relative overflow-hidden p-6 text-center'>
                    <div className='mb-4 flex justify-center'>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${step.color} shadow-lg transition-transform duration-200 group-hover:scale-110`}
                      >
                        <IconComponent className='h-6 w-6 text-white' />
                      </div>
                    </div>

                    <div className='mb-3 flex items-center justify-center gap-2'>
                      <h3 className='font-semibold text-slate-900 transition-colors duration-200 group-hover:text-slate-700'>
                        {step.title}
                      </h3>
                    </div>

                    <p className='text-sm text-slate-600 transition-colors duration-200 group-hover:text-slate-700'>
                      {step.description}
                    </p>

                    {/* Step number */}
                    <div className='absolute right-2 top-2'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/50'>
                        <span className='text-xs font-bold text-slate-600'>
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Decorative gradient overlay */}
                    <div
                      className={`absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-tl ${step.color} translate-x-8 translate-y-8 transform rounded-full opacity-5`}
                    ></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-200/20 to-green-200/20 blur-3xl'></div>
        <div className='absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-green-200/20 to-teal-200/20 blur-3xl'></div>
      </div>

      {/* Grid pattern */}
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(34 197 94 / 0.1)'%3e%3cpath d='m0 .5 32 0M.5 0v32'/%3e%3c/svg%3e")`,
        }}
      ></div>
    </section>
  );
};
