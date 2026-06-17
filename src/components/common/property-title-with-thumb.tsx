'use client';

import { Building2 } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PropertyTitleWithThumbProps = {
  title?: string | null;
  images?: string[] | null;
  /** Second line (e.g. location) */
  subtitle?: ReactNode;
  className?: string;
  /** Thumbnail size */
  size?: 'sm' | 'md' | 'lg';
};

const frame = {
  sm: 'h-10 w-14 rounded-md',
  md: 'h-12 w-16 rounded-lg',
  lg: 'h-16 w-[5.5rem] rounded-lg',
} as const;

const icon = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
} as const;

const sizesAttr = { sm: '56px', md: '64px', lg: '88px' } as const;

export function PropertyTitleWithThumb({
  title,
  images,
  subtitle,
  className,
  size = 'md',
}: PropertyTitleWithThumbProps) {
  const src = images?.[0];

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <div
        className={cn(
          'relative flex-shrink-0 overflow-hidden bg-muted',
          frame[size],
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={title || 'Property'}
            fill
            className='object-cover'
            sizes={sizesAttr[size]}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <Building2
              className={cn('text-muted-foreground', icon[size])}
            />
          </div>
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{title || 'Property'}</p>
        {subtitle != null && subtitle !== false ? (
          <div className='text-sm text-muted-foreground'>{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}
