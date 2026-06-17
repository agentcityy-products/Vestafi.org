import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className='flex flex-col items-center justify-center px-4 py-16'>
      <Alert className='max-w-md'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle className='mb-2'>{title}</AlertTitle>
        <AlertDescription className='text-sm leading-relaxed'>
          {message}
        </AlertDescription>
      </Alert>

      {onRetry && (
        <Button onClick={onRetry} variant='outline' className='mt-6'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Try Again
        </Button>
      )}
    </div>
  );
};
