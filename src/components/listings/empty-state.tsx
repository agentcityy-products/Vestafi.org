import { Building2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'search' | 'building';
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'building',
}: EmptyStateProps) => {
  const Icon = icon === 'search' ? Search : Building2;

  return (
    <div className='flex flex-col items-center justify-center px-4 py-16'>
      <div className='mb-6 rounded-full bg-muted p-6'>
        <Icon className='h-12 w-12 text-muted-foreground' />
      </div>

      <h3 className='mb-2 text-center text-xl font-semibold'>{title}</h3>

      <p className='mb-6 max-w-md text-center text-muted-foreground'>
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant='outline'>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
