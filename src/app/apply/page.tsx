import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import Logo from '@/components/common/logo';
import { ApplicationForm } from '@/components/landing/application-form';
import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

export const metadata: Metadata = {
  title: 'Apply to Join',
  description:
    'Apply to join the VESTAFI inner circle. An exclusive community for real estate co-ownership in Uganda. Not everyone gets in.',
  keywords: [
    'VESTAFI',
    'real estate',
    'co-ownership',
    'Uganda',
    'investment',
    'application',
  ],
};

interface ApplyPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const { ref } = await searchParams;
  const referralCode = ref || null;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50'>
      {/* Header with back button */}
      <div className='border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link href={paths.home}>
              <Button variant='ghost' className='gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </Button>
            </Link>

            <Logo />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className='relative overflow-hidden py-12 sm:py-16'>
        <div className='container relative z-10 mx-auto px-6'>
          <div className='mx-auto max-w-screen-md'>
            {/* Page Header */}
            <div className='mb-12 text-center'>
              {/* <div className='mb-6 flex justify-center'>
                <div className='flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-600/10 px-4 py-2 backdrop-blur-sm'>
                  <Lock className='h-5 w-5 text-emerald-600' />
                  <span className='font-medium text-emerald-800'>
                    Exclusive Application
                  </span>
                </div>
              </div> */}

              <h1 className='mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl'>
                Join the Inner Circle
              </h1>
            </div>

            {/* Application Form */}
            <ApplicationForm initialReferralCode={referralCode} />
          </div>
        </div>
      </main>
    </div>
  );
}
