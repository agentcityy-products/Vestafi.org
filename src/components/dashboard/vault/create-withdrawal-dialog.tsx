'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDownCircle, Info } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useVaultBalance } from '@/hooks/queries/vault';

import { createVaultWithdrawalSchema } from '@/schema/vault';
import { createVaultWithdrawal } from '@/actions/vault';

import { Alert, AlertDescription } from '@/components/ui/alert';
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

import { formatCurrency } from '@/utils/number-functions';

import { QueryKeys } from '@/constants/query-keys';

type FormData = z.infer<typeof createVaultWithdrawalSchema>;

export function CreateWithdrawalDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: vaultBalance } = useVaultBalance();

  const form = useForm<FormData>({
    resolver: zodResolver(createVaultWithdrawalSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const { execute, isExecuting } = useAction(createVaultWithdrawal, {
    onSuccess: () => {
      toast.success('Withdrawal request created successfully');
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.VAULT],
      });
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error.error.serverError || 'Failed to create withdrawal request',
      );
    },
  });

  const onSubmit = (data: FormData) => {
    const balance = vaultBalance?.balance ?? 0;

    if (data.amount > balance) {
      form.setError('amount', {
        type: 'manual',
        message: 'Amount cannot exceed your vault balance',
      });
      return;
    }

    if (data.amount <= 0) {
      form.setError('amount', {
        type: 'manual',
        message: 'Amount must be greater than 0',
      });
      return;
    }

    execute(data);
  };

  const balance = vaultBalance?.balance ?? 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <ArrowDownCircle className='mr-2 h-4 w-4' />
          Request Withdrawal
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Request a withdrawal from your vault balance. Your request will be
            reviewed and processed by our team.
          </DialogDescription>
        </DialogHeader>

        {balance === 0 && (
          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription>
              You don't have any funds in your vault to withdraw.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <div className='rounded-lg border bg-muted/50 p-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      Available Balance:
                    </span>
                    <span className='font-semibold'>
                      {formatCurrency(balance)}
                    </span>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter withdrawal amount'
                        step='0.01'
                        min='0'
                        max={balance}
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the amount you wish to withdraw from your vault.
                      Maximum: {formatCurrency(balance)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={balance === 0} isLoading={isExecuting}>
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

