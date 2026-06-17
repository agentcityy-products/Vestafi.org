import React from 'react';

import { cn } from '@/lib/utils';

type UGXIconProps = {
  className?: string;
};

const UGXIcon = ({ className }: UGXIconProps) => {
  return (
    <div
      className={cn(
        'flex aspect-square shrink-0 items-center justify-center rounded-full border border-muted-foreground p-1 text-[10px] text-muted-foreground',
        className,
      )}
    >
      Ush
    </div>
  );
};

export default UGXIcon;
