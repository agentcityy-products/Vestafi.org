'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Play, Settings, Square } from 'lucide-react';
import Link from 'next/link';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { listExitWindows, updateExitWindow } from '@/actions/admin-exit-window';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

type ExitWindowRow = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  created_at: string;
};

async function fetchWindows() {
  const result = await listExitWindows();
  if (result?.serverError) throw new Error(result.serverError);
  return (result?.data?.windows ?? []) as ExitWindowRow[];
}

export function ExitWindowsTable() {
  const queryClient = useQueryClient();
  const { data: windows, isFetching, error } = useQuery({
    queryKey: [QueryKeys.EXIT_WINDOWS],
    queryFn: fetchWindows,
  });
  const { execute: updateStatus, isExecuting } = useAction(updateExitWindow, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXIT_WINDOWS] });
      toast.success('Window updated');
    },
    onError: (e) =>
      toast.error(
        (e?.error?.serverError ?? e?.error?.validationErrors?.formErrors?.[0]) ??
          'Update failed',
      ),
  });

  const columns: ColumnDef<ExitWindowRow>[] = [
    {
      accessorKey: 'start_at',
      header: 'Start',
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm'>
          {format(new Date(row.original.start_at), 'PPp')}
        </span>
      ),
    },
    {
      accessorKey: 'end_at',
      header: 'End',
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm'>
          {format(new Date(row.original.end_at), 'PPp')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'active'
                ? 'default'
                : status === 'ended'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const w = row.original;
        return (
          <div className='flex items-center gap-2'>
            <Link href={paths.admin.exitWindowForm(w.id)}>
              <Button variant='ghost' size='sm'>
                <Edit className='h-4 w-4' />
              </Button>
            </Link>
            {w.status === 'draft' && (
              <Link href={paths.admin.exitWindowForm(w.id) + '&prices=1'}>
                <Button variant='ghost' size='sm'>
                  <Settings className='h-4 w-4' />
                </Button>
              </Link>
            )}
            {w.status === 'draft' && (
              <Button
                variant='ghost'
                size='sm'
                disabled={isExecuting}
                onClick={() =>
                  updateStatus({ id: w.id, status: 'active' })
                }
              >
                <Play className='h-4 w-4' />
                Activate
              </Button>
            )}
            {w.status === 'active' && (
              <Button
                variant='ghost'
                size='sm'
                disabled={isExecuting}
                onClick={() =>
                  updateStatus({ id: w.id, status: 'ended' })
                }
              >
                <Square className='h-4 w-4' />
                End
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: windows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <p className='text-destructive'>
        Failed to load exit windows: {(error as Error).message}
      </p>
    );
  }
  if (isFetching && !windows?.length) {
    return <TableSkeleton columns={4} />;
  }
  if (!windows?.length) {
    return (
      <p className='text-muted-foreground'>
        No exit windows yet. Create one to allow members to sell or buy stakes.
      </p>
    );
  }

  return (
    <div className='rounded-md border'>
      <DataTable table={table} />
    </div>
  );
}
