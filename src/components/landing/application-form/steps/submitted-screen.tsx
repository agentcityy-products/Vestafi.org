'use client';

import { CheckCircle, Crown } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SubmittedScreenProps {
  category?: number;
}

export const SubmittedScreen = ({ category }: SubmittedScreenProps) => {
  // Ensure category is a number for comparison
  const categoryNumber =
    category !== undefined
      ? typeof category === 'string'
        ? parseInt(category, 10)
        : category
      : undefined;

  console.log(
    'SubmittedScreen category:',
    category,
    'categoryNumber:',
    categoryNumber,
  ); // Debug log

  return (
    <Card className='border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg'>
      <CardHeader className='pb-6 text-center'>
        <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100'>
          <CheckCircle className='h-10 w-10 text-emerald-600' />
        </div>
        <CardTitle className='mb-2 text-3xl text-emerald-900'>
          Welcome to the Circle
        </CardTitle>
        <CardDescription className='text-lg text-emerald-700'>
          Your application has been received
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 text-center'>
        <div className='rounded-xl bg-white/60 p-6 backdrop-blur-sm'>
          <p className='mb-4 font-medium text-emerald-800'>
            A real human from the VESTAFI inner circle will review your
            responses and reach out to you privately.
          </p>
          <p className='text-emerald-700'>
            <strong>Usually within 24 hours.</strong> If you're a fit, you'll be
            guided through the final steps to activate your membership.
          </p>
        </div>

        <div className='rounded-xl bg-emerald-600/10 p-4'>
          <p className='text-sm font-medium text-emerald-800'>
            Not everyone gets in. But if you do, you'll know why.
          </p>
        </div>

        {categoryNumber === 3 && (
          <Card className='border-emerald-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-2xl text-emerald-900'>
                <Crown className='h-6 w-6 text-amber-600' />
                Welcome to the Elite Circle
              </CardTitle>
              <CardDescription className='text-lg text-emerald-700'>
                You've qualified for our exclusive Elite Circle membership.
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div className='rounded-xl bg-white/60 p-6 backdrop-blur-sm'>
                <p className='mb-4 font-medium text-emerald-800'>
                  As an Elite Circle member, you'll receive:
                </p>
                <ul className='space-y-2 text-emerald-700'>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1'>✨</span>
                    <span>
                      <strong>Personalized onboarding call</strong> - A
                      dedicated team member will guide you through the process
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1'>🏆</span>
                    <span>
                      <strong>Direct entry into House of Gold</strong> - Access
                      to premium investment opportunities
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1'>👑</span>
                    <span>
                      <strong>Custodian Rank</strong> - Exclusive privileges and
                      benefits
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1'>💎</span>
                    <span>
                      <strong>Priority support</strong> - Dedicated assistance
                      whenever you need it
                    </span>
                  </li>
                </ul>
              </div>

              <div className='rounded-xl bg-amber-600/10 p-4'>
                <p className='text-sm font-medium text-amber-800'>
                  <strong>Next Steps:</strong> A member of our team will contact
                  you shortly to schedule your onboarding call. This call is
                  required to activate your Elite Circle membership and
                  dashboard access.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
