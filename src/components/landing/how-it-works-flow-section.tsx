'use client';

import {
  Building2,
  CircleDollarSign,
  Key,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: UserCheck,
    title: 'Apply To Join',
    description:
      'Vestafi begins with an application, not a payment. This allows us to understand who is joining, align expectations early, and keep the circle intentional rather than open-ended.',
    color: 'from-emerald-700 to-emerald-600',
  },
  {
    icon: Key,
    title: 'Access Openings',
    description:
      'Once approved, you gain access to a private member area where all activity happens. This is where apartments are listed, contributions are made, and performance is tracked.',
    color: 'from-emerald-700 to-teal-600',
  },
  {
    icon: Building2,
    title: 'Secure Ownership',
    description:
      'Choose the apartment and ownership position that fits you. Each opening is tied to a specific apartment with clear context and operational details.',
    color: 'from-teal-700 to-teal-600',
  },
  {
    icon: CircleDollarSign,
    title: 'Receive Distributions',
    description:
      'When an apartment is operational and earning rental income, members receive distributions based on real performance.',
    color: 'from-teal-700 to-cyan-700',
  },
  {
    icon: ShieldCheck,
    title: 'Vestafi Manages',
    description:
      'Vestafi coordinates the apartment, reporting, and member experience so ownership remains structured, understandable, and professionally guided.',
    color: 'from-cyan-800 to-emerald-800',
  },
];

export const HowItWorksFlowSection = () => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/30 py-24 sm:py-32'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
              How Vestafi Works
            </h2>
            <p className='mx-auto mb-4 max-w-3xl text-lg text-slate-700'>
              Entry into a private apartment ownership system—clear, measured,
              and guided from application through distributions.
            </p>
            <p className='mx-auto max-w-2xl text-base text-slate-600'>
              Five deliberate steps. No marketplace noise.
            </p>
          </div>

          {/* Timeline/Flowchart */}
          <div className='relative'>
            {/* Vertical line connecting steps - only on desktop */}
            <div className='absolute bottom-0 left-6 top-0 hidden w-0.5 bg-gradient-to-b from-emerald-400 via-blue-400 via-cyan-400 via-teal-400 to-indigo-400 sm:left-8 sm:block'></div>

            <div className='space-y-12 sm:space-y-16'>
              {steps.map((step, index) => {
                const IconComponent = step.icon;

                return (
                  <div
                    key={index}
                    className='relative flex items-start gap-4 sm:gap-6'
                  >
                    {/* Icon circle */}
                    <div className='relative z-10 flex-shrink-0'>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${step.color} shadow-lg ring-2 ring-white transition-transform duration-300 hover:scale-110 sm:h-16 sm:w-16 sm:ring-4`}
                      >
                        <IconComponent className='h-6 w-6 text-white sm:h-8 sm:w-8' />
                      </div>
                      {/* Step number */}
                      <div className='absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-white sm:h-6 sm:w-6'>
                        <span className='text-[10px] font-bold text-white sm:text-xs'>
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Content card */}
                    <div className='flex-1 pt-1'>
                      <Card
                        className={`transform border-slate-200/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                          index % 2 === 0
                            ? 'bg-gradient-to-br from-white to-emerald-50/50'
                            : 'bg-gradient-to-br from-white to-teal-50/50'
                        }`}
                      >
                        <CardContent className='p-6'>
                          <h3 className='mb-3 text-xl font-semibold text-slate-900'>
                            {step.title}
                          </h3>
                          <p className='text-base leading-relaxed text-slate-700'>
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
