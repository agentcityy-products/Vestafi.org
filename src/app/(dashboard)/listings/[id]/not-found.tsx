import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { paths } from '@/constants/paths';

export default function PropertyNotFound() {
  return (
    <div className='flex min-h-[50vh] items-center justify-center'>
      <Card className='mx-4 w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 w-fit rounded-full bg-muted p-3'>
            <Building2 className='h-8 w-8 text-muted-foreground' />
          </div>
          <CardTitle className='text-xl'>Property Not Found</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-muted-foreground'>
            Sorry, we couldn't find the property you're looking for. It may have
            been removed or the link might be incorrect.
          </p>

          <div className='flex flex-col justify-center gap-2 sm:flex-row'>
            <Link href={paths.listings.list}>
              <Button className='flex items-center gap-2' variant='outline'>
                <ArrowLeft className='h-4 w-4' />
                Back to Properties
              </Button>
            </Link>

            <Link href={paths.dashboard.savingsOverview}>
              <Button>Go to Savings Overview</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
