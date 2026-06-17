'use client';

import { ContributionsTable } from '@/components/dashboard/contributions-table';
import { MonthlyReturnsTable } from '@/components/monthly-returns/monthly-returns-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyContributionsPage() {
  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>My Contributions</h1>
        <p className='text-muted-foreground'>
          View your property contributions and track monthly rentals from your
          investments
        </p>
      </div>

      <Tabs defaultValue='contributions' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='contributions'>My Contributions</TabsTrigger>
          <TabsTrigger value='monthly-rentals'>Monthly Rentals</TabsTrigger>
        </TabsList>

        <TabsContent value='contributions' className='space-y-4'>
          <ContributionsTable />
        </TabsContent>

        <TabsContent value='monthly-rentals' className='space-y-4'>
          <MonthlyReturnsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
