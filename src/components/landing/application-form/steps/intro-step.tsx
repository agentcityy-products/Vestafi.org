'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface IntroStepProps {
  onNext: () => void;
}

export const IntroStep = ({ onNext }: IntroStepProps) => {
  return (
    <Card className='flex min-h-[400px] flex-col justify-center border-emerald-200 bg-white/95 shadow-lg backdrop-blur-sm'>
      <CardContent className='space-y-8 py-12 text-center'>
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2'>
            <Sparkles className='h-4 w-4 text-emerald-600' />
            <span className='text-sm font-medium text-emerald-800'>
              The Inner Circle
            </span>
          </div>

          <h2 className='text-2xl font-bold text-slate-900'>
            Before we begin...
          </h2>

          <p className='mx-auto max-w-md text-lg text-slate-700'>
            This isn't a typical signup. We'll only ask what matters. One step
            at a time.
          </p>
        </div>

        <div className='mx-auto max-w-md rounded-xl bg-emerald-50 p-6'>
          <p className='text-sm text-emerald-800'>
            <strong>Fair warning:</strong> We're selective about who joins
            VESTAFI. The questions ahead will help us understand if you're
            aligned with what we're building.
          </p>
        </div>

        <Button
          type='button'
          onClick={onNext}
          size='lg'
          className='px-8'
          icon={ArrowRight}
        >
          I'm ready
        </Button>
      </CardContent>
    </Card>
  );
};
