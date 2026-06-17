import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { ExitWindowsTable } from '@/components/admin/exit-windows/exit-windows-table';
import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

export const metadata: Metadata = {
  title: 'Exit Windows',
  description: 'Create and manage exit windows; set property prices for each window',
};

export default function AdminExitWindowsPage() {
  return (
    <div className='container mx-auto'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Exit Windows</h1>
          <p className='text-muted-foreground'>
            Create windows when members can sell or buy stakes. Set per-property
            exit prices before activating.
          </p>
        </div>
        <Link href={paths.admin.exitWindowForm()}>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create window
          </Button>
        </Link>
      </div>

      <ExitWindowsTable />
    </div>
  );
}
