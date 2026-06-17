import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PropertyCardSkeleton = () => {
  return (
    <Card className='overflow-hidden rounded-2xl border shadow-sm'>
      <div className='relative aspect-[4/3] overflow-hidden'>
        <Skeleton className='h-full w-full' />
        <div className='absolute left-4 top-4'>
          <Skeleton className='h-6 w-24 rounded-full' />
        </div>
        <div className='absolute right-4 top-4'>
          <Skeleton className='h-6 w-20 rounded-full' />
        </div>
      </div>

      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div>
            <Skeleton className='h-6 w-3/4' />
            <div className='mt-2 flex items-center'>
              <Skeleton className='mr-1 h-4 w-4' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-4/5' />
            <Skeleton className='h-4 w-3/5' />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-6 w-24' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-6 w-24' />
            </div>
          </div>

          <div className='rounded-lg bg-muted/50 p-3'>
            <Skeleton className='mb-2 h-4 w-32' />
            <Skeleton className='h-5 w-28' />
          </div>
        </div>
      </CardContent>

      <CardFooter className='p-6 pt-0'>
        <Skeleton className='h-10 w-full rounded-md' />
      </CardFooter>
    </Card>
  );
};
