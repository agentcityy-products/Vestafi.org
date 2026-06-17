'use client';

import { useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { CountryCode } from 'libphonenumber-js';
import { Info } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { locationOptions, savingsOptions } from '@/schema/applications';
import { inviteUser } from '@/actions/applications';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { onError } from '@/lib/show-error-toast';
import { formatDateTime } from '@/utils/date-functions';
import { formatPhoneNumber } from '@/utils/string-functions';

import { QueryKeys } from '@/constants/query-keys';

import type { ApplicationRow } from '@/types/dao';

export const useInviteUserColumns = (): ColumnDef<ApplicationRow>[] => {
  const queryClient = useQueryClient();
  const inviteUserAction = useAction(inviteUser, {
    onSuccess: () => {
      toast.success('User invited successfully');
      queryClient.invalidateQueries({ queryKey: [QueryKeys.APPLICATIONS] });
    },
    onError,
  });

  const columns: ColumnDef<ApplicationRow>[] = [
    {
      accessorKey: 'full_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => {
        const application = row.original as ApplicationRow;
        const locationLabel =
          locationOptions.find(
            (option) => option.value === application.location,
          )?.label || application.location;
        const savingsLabel =
          savingsOptions.find((option) => option.value === application.savings)
            ?.label || application.savings;

        return (
          <div className='space-y-1'>
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className='flex cursor-pointer items-center gap-2'>
                  <div className='font-medium'>{application.full_name}</div>
                  <Info className='h-3 w-3 text-muted-foreground' />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className='w-80'>
                <div className='space-y-3'>
                  <div>
                    <h4 className='text-sm font-semibold'>
                      {application.full_name}
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      {application.email}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Location:
                      </span>
                      <div className='mt-1'>
                        <Badge variant='secondary' className='text-xs'>
                          {locationLabel}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Savings Status:
                      </span>
                      <div className='mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          {savingsLabel}
                        </Badge>
                      </div>
                    </div>
                    {application.why_vestafi &&
                      application.why_vestafi.length > 0 && (
                        <div>
                          <span className='text-xs font-medium text-muted-foreground'>
                            Why VESTAFI:
                          </span>
                          <div className='mt-1 space-y-1'>
                            {application.why_vestafi.map((reason, index) => (
                              <Badge
                                key={index}
                                variant='outline'
                                className='mb-1 mr-1 text-xs'
                              >
                                {reason
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => {
        const email = row.getValue('email') as string;
        return <div className='text-sm text-muted-foreground'>{email}</div>;
      },
      size: 250,
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Phone' />
      ),
      cell: ({ row }) => {
        const application = row.original as ApplicationRow;
        return (
          <div className='whitespace-nowrap text-sm'>
            {formatPhoneNumber(
              application.phone,
              application.phone_country_code as CountryCode,
            )}
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Applied' />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('created_at') as string;
        return (
          <div className='text-sm text-muted-foreground'>
            {formatDateTime(createdAt)}
          </div>
        );
      },
      size: 130,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Action' />
      ),
      cell: ({ row }) => {
        const application = row.original as ApplicationRow;
        const isLoading =
          inviteUserAction.isExecuting &&
          inviteUserAction.input.applicationId === application.id;
        return (
          <div className='flex justify-end'>
            <Button
              size='sm'
              onClick={() =>
                inviteUserAction.execute({ applicationId: application.id })
              }
              isLoading={isLoading}
              className='h-8'
            >
              Invite
            </Button>
          </div>
        );
      },
      size: 100,
    },
  ];

  return columns;
};
