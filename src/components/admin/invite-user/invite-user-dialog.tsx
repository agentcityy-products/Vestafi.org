'use client';

import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { useDebounceValue } from 'usehooks-ts';

import { useApplications } from '@/hooks/queries/applications';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useInviteUserColumns } from './invite-user-columns';

export const InviteUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, error, refetch } = useApplications({
    status: 'pending',
    page,
    pageSize,
    search: debouncedSearch,
  });

  const applications = data?.data || [];
  const totalCount = data?.count || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  };

  const columns = useInviteUserColumns();

  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  const ErrorState = () => (
    <Alert variant='destructive'>
      <AlertTriangle className='h-4 w-4' />
      <AlertDescription className='flex items-center justify-between'>
        <span>Failed to load applications: {error?.message}</span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          className='ml-2 h-8'
        >
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );

  const EmptyState = () => (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <FaUserPlus className='mb-4 h-12 w-12 text-muted-foreground/50' />
      <h3 className='mb-2 text-lg font-medium text-muted-foreground'>
        {debouncedSearch
          ? 'No matching applications'
          : 'No pending applications'}
      </h3>
      <p className='max-w-sm text-sm text-muted-foreground'>
        {debouncedSearch
          ? `No pending applications found for "${debouncedSearch}"`
          : 'There are currently no pending applications to review and invite.'}
      </p>
      {debouncedSearch && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setSearch('')}
          className='mt-2'
        >
          Clear search
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button icon={FaUserPlus} variant='outline'>
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className='flex max-h-[85vh] max-w-6xl flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FaUserPlus className='h-5 w-5' />
            Invite Users from Pending Applications
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-auto'>
          {/* Search Bar */}
          <div className='relative max-w-sm'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search by name, email, or phone...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>

          {/* Content */}
          {error ? (
            <ErrorState />
          ) : isLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : applications.length === 0 ? (
            <EmptyState />
          ) : (
            <Card>
              <CardContent className='p-0'>
                <DataTable table={table} />
              </CardContent>
            </Card>
          )}
        </div>

        {totalCount > 0 && (
          <div className='border-t pt-4'>
            <DataTablePagination
              pageIndex={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onSizeChange={handlePageSizeChange}
              showSelected={false}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
