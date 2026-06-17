import { Metadata } from 'next';

import ExportMonthlyReturns from '@/components/admin/export-monthly-returns';

export const metadata: Metadata = {
  title: 'Reports & Exports',
  description: 'Export and generate reports for administrative purposes',
};

export default function AdminReportsPage() {
  return (
    <div className='container mx-auto space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Reports & Exports</h1>
        <p className='text-muted-foreground'>
          Generate and export data reports for administrative purposes
        </p>
      </div>

      {/* Export Components Grid */}
      <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
        <ExportMonthlyReturns />

        {/* Future export components can be added here */}
        {/* <ExportInvestments /> */}
        {/* <ExportUsers /> */}
        {/* <ExportProperties /> */}
      </div>
    </div>
  );
}
