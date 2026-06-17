'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createWithdrawalRequestSchema } from '@/schema/withdrawal-request';
import { createWithdrawalRequest } from '@/actions/withdrawal-request';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { QueryKeys } from '@/constants/query-keys';

type FormData = z.infer<typeof createWithdrawalRequestSchema>;

interface CreateWithdrawalDialogProps {
  vaultBalance: number;
}

export function CreateWithdrawalDialog({
  vaultBalance,
}: CreateWithdrawalDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(createWithdrawalRequestSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const { execute, isExecuting } = useAction(createWithdrawalRequest, {
    onSuccess: () => {
      toast.success('Withdrawal request created successfully');
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.USER_WITHDRAWAL_REQUESTS],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VAULT] });
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error.error.serverError || 'Failed to create withdrawal request',
      );
    },
  });

  const onSubmit = (data: FormData) => {
    if (data.amount > vaultBalance) {
      form.setError('amount', {
        message: 'Amount cannot exceed your vault balance',
      });
      return;
    }
    execute(data);
  };

  const handleMaxClick = () => {
    form.setValue('amount', vaultBalance);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4' />
          Request Withdrawal
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription className='space-y-2'>
            <p>Request to withdraw funds from your vault.</p>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <span className='text-muted-foreground'>Available balance:</span>
              <span className='text-primary'>
                {formatCurrency(vaultBalance)}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className='flex gap-2'>
                    <FormControl>
                      <Input
                        {...field}
                        min='1'
                        max={vaultBalance}
                        value={formatNumber(field.value)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d]/g, '');
                          const numericValue = rawValue
                            ? parseInt(rawValue)
                            : 0;
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleMaxClick}
                      disabled={vaultBalance <= 0}
                    >
                      Max
                    </Button>
                  </div>
                  <FormDescription>
                    Entered amount: {formatCurrency(field.value)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={vaultBalance <= 0}
                isLoading={isExecuting}
              >
                {isExecuting ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
