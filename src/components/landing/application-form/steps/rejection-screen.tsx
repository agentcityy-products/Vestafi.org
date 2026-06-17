'use client';

import { XCircle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const RejectionScreen = () => {
  return (
    <Card className='border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg'>
      <CardHeader className='pb-6 text-center'>
        <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
          <XCircle className='h-10 w-10 text-red-600' />
        </div>
        <CardTitle className='mb-2 text-3xl text-red-900'>
          Thank You for Your Interest
        </CardTitle>
        <CardDescription className='text-lg text-red-700'>
          We appreciate you taking the time to apply
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 text-center'>
        <div className='rounded-xl bg-white/60 p-6 backdrop-blur-sm'>
          <p className='mb-4 font-medium text-red-800'>
            After careful review, we are unable to proceed with your application
            at this time.
          </p>
          <p className='text-red-700'>
            Our membership requirements are designed to ensure the best
            experience for all members of our community. We encourage you to
            reach out again in the future as your circumstances change.
          </p>
        </div>

        <div className='rounded-xl bg-red-600/10 p-4'>
          <p className='text-sm font-medium text-red-800'>
            We're always looking for passionate individuals who align with our
            mission. Thank you again for your interest in VESTAFI.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
