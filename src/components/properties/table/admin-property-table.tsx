'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceValue } from 'usehooks-ts';

import { useProperties } from '@/hooks/queries/properties';

import { addMonthlyRentAndDistributeReturns } from '@/actions/monthly-rent';

import { MonthlyRentDialog } from '@/components/properties/monthly-rent/monthly-rent-dialog';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { DataTableViewOptions } from '@/components/ui/data-table/view-options';
import { Input } from '@/components/ui/input';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

import { createAdminPropertyColumns } from './admin-property-columns';

import { ListingWithRent } from '@/types/dao';

interface PropertyTableProps {
  properties: ListingWithRent[];
}

export function PropertyTable({ properties }: PropertyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 300);
  const queryClient = useQueryClient();
  // Monthly rent dialog state
  const [selectedProperty, setSelectedProperty] =
    useState<ListingWithRent | null>(null);
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);

  const { data, isLoading } = useProperties({
    page,
    pageSize,
    search: debouncedSearch,
    initialProperties: properties,
  });

  const handleAddMonthlyRent = (property: ListingWithRent) => {
    setSelectedProperty(property);
    setIsRentDialogOpen(true);
  };

  const submitRentAction = useAction(addMonthlyRentAndDistributeReturns, {
    onSuccess: () => {
      toast.success('Monthly rent added successfully');
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROPERTIES] });
      handleCloseRentDialog();
    },
    onError,
  });

  const handleCloseRentDialog = () => {
    setIsRentDialogOpen(false);
    setSelectedProperty(null);
  };

  const columns = createAdminPropertyColumns({
    onAddMonthlyRent: handleAddMonthlyRent,
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    pageCount: data ? Math.ceil(data.count / pageSize) : 0,
  });

  return (
    <>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-1 items-center space-x-2'>
            <div className='relative w-full max-w-sm lg:max-w-lg'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by title, description, or address...'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className='pl-8'
              />
            </div>
          </div>
          <DataTableViewOptions table={table} />
        </div>
        <div className='rounded-md border'>
          <div className='relative w-full overflow-auto'>
            <table className='w-full caption-bottom text-sm'>
              <thead className='[&_tr]:border-b'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className='[&_tr:last-child]:border-0'>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className='h-24 text-center text-muted-foreground'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className='p-4 align-middle [&:has([role=checkbox])]:pr-0'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className='h-24 text-center text-muted-foreground'
                    >
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DataTablePagination
          onPageChange={setPage}
          onSizeChange={setPageSize}
          pageIndex={page}
          pageSize={pageSize}
          totalCount={data?.count ?? 0}
        />
      </div>

      {/* Monthly Rent Dialog */}
      {selectedProperty && (
        <MonthlyRentDialog
          isOpen={isRentDialogOpen}
          onClose={handleCloseRentDialog}
          property={selectedProperty}
          onSubmit={(data) => {
            const promise = submitRentAction.executeAsync(data);
            toast.promise(promise, {
              loading: 'Adding monthly rent...',
            });
          }}
        />
      )}
    </>
  );
}
