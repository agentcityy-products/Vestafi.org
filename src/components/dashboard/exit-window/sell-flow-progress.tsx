'use client';

import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'stakes', label: 'My stakes' },
  { id: 'amount', label: 'Enter amount' },
  { id: 'fee', label: 'Fee review' },
  { id: 'confirm', label: 'Confirm' },
  { id: 'live', label: 'Order live' },
] as const;

type SellFlowProgressProps = {
  /** 0 = My stakes … 4 = Order live */
  currentStep: number;
  className?: string;
};

export function SellFlowProgress({ currentStep, className }: SellFlowProgressProps) {
  const clamped = Math.max(0, Math.min(4, currentStep));
  const fillPct = (clamped / 4) * 100;

  return (
    <div className={cn('relative mb-8', className)}>
      <div className='relative flex items-center justify-between'>
        <div
          className='absolute left-3 right-3 top-[13px] z-0 h-0.5 bg-border'
          aria-hidden
        />
        <div
          className='absolute left-3 top-[13px] z-[1] h-0.5 max-w-[calc(100%-1.5rem)] bg-[#1EB45A] transition-[width] duration-300 ease-out'
          style={{
            width:
              fillPct === 0
                ? 0
                : `calc((100% - 1.5rem) * ${fillPct} / 100)`,
          }}
          aria-hidden
        />
        {STEPS.map((s, i) => {
          const isActive = i === clamped;
          const isDone = i < clamped;
          return (
            <div
              key={s.id}
              className='relative z-[2] flex flex-col items-center gap-1.5'
            >
              <div
                className={cn(
                  'flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-colors',
                  isDone && 'border-[#1EB45A] bg-[#1EB45A] text-white',
                  isActive &&
                    !isDone &&
                    'border-[#0A0E17] bg-[#0A0E17] text-white',
                  !isActive &&
                    !isDone &&
                    'border-border bg-background text-muted-foreground',
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'max-w-[60px] text-center text-[10px] leading-snug text-muted-foreground',
                  isActive && 'font-medium text-[#0A0E17]',
                  isDone && 'text-[#27500A]',
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
