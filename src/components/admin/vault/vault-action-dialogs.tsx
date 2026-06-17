'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Copy, CreditCard, Eye, Info, User } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateVaultTransactionStatus } from '@/actions/vault';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import { formatCurrency } from '@/utils/number-functions';
import { getFullName, maskAccountNumber } from '@/utils/string-functions';

import { QueryKeys } from '@/constants/query-keys';

const rejectVaultDepositSchema = z.object({
  rejection_reason: z.string().optional(),
});

type RejectFormData = z.infer<typeof rejectVaultDepositSchema>;

type VaultTransactionWithRelations = {
  id: string;
  amount: number;
  type: string | null;
  status: string | null;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    bank_info?: {
      bank_name: string;
      account_number: string;
      account_name: string;
    } | null;
  } | null;
};

interface VaultActionDialogsProps {
  transaction: VaultTransactionWithRelations | null;
  action: 'approve' | 'reject' | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function VaultActionDialogs({
  transaction,
  action,
  onClose,
  onSuccess,
}: VaultActionDialogsProps) {
  const queryClient = useQueryClient();
  const [showFullBankDetails, setShowFullBankDetails] = useState(false);

  // Derive isOpen from props - dialog is open when both transaction and action are set
  const isOpen = !!transaction && !!action;

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectVaultDepositSchema),
    defaultValues: {
      rejection_reason: '',
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      rejectForm.reset();
    }
  }, [isOpen, rejectForm]);

  const { execute: updateStatus, isExecuting } = useAction(
    updateVaultTransactionStatus,
    {
      onSuccess: () => {
        const transactionType =
          transaction?.type === 'withdrawal' ? 'withdrawal' : 'deposit';
        toast.success(`Vault action completed successfully`);
        handleClose();
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.VAULT],
        });
        onSuccess();
      },
      onError: (error) => {
        toast.error(
          error.error.serverError || 'Failed to update vault transaction',
        );
      },
    },
  );

  const handleClose = () => {
    rejectForm.reset();
    setShowFullBankDetails(false);
    onClose();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleApprove = () => {
    if (!transaction) return;
    updateStatus({
      id: transaction.id,
      status: 'approved',
    });
  };

  const handleReject = (data: RejectFormData) => {
    if (!transaction) return;
    updateStatus({
      id: transaction.id,
      status: 'rejected',
      rejection_reason: data.rejection_reason || undefined,
    });
  };

  // Don't render anything if no transaction or action
  if (!transaction || !action) return null;

  const userName = transaction.user
    ? getFullName(transaction.user.first_name, transaction.user.last_name)
    : 'Unknown User';

  return (
    <>
      {/* Approve Dialog */}
      <Dialog open={isOpen && action === 'approve'} onOpenChange={handleClose}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              Approve Vault{' '}
              {transaction.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}
            </DialogTitle>
            <DialogDescription>
              {transaction.type === 'withdrawal' ? (
                <>
                  Are you sure you want to approve this vault withdrawal? The
                  funds will be deducted from the user's vault balance. Please
                  ensure you have deposited the amount to the user's bank
                  account before approving.
                </>
              ) : (
                <>
                  Are you sure you want to approve this vault deposit? The funds
                  will be added to the user's vault balance.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>User:</span>
                <span className='text-sm font-medium'>{userName}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Amount:</span>
                <span className='text-sm font-medium'>
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Transaction ID:
                </span>
                <span className='font-mono text-sm text-muted-foreground'>
                  {transaction.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            {/* Bank Details for Withdrawals */}
            {transaction.type === 'withdrawal' && (
              <div className='space-y-4'>
                <Alert>
                  <Info className='h-4 w-4' />
                  <AlertDescription>
                    <strong>Important:</strong> Only approve this withdrawal
                    request after you have successfully deposited{' '}
                    <strong>{formatCurrency(transaction.amount)}</strong> into
                    the user's bank account shown below.
                  </AlertDescription>
                </Alert>

                {transaction.user?.bank_info ? (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Building2 className='h-4 w-4' />
                        User Bank Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Building2 className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            Bank Name:
                          </span>
                        </div>
                        <span className='text-sm font-medium'>
                          {transaction.user.bank_info.bank_name}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            Account Name:
                          </span>
                        </div>
                        <span className='text-sm font-medium'>
                          {transaction.user.bank_info.account_name}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <CreditCard className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            Account Number:
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono text-sm font-medium'>
                            {showFullBankDetails
                              ? transaction.user.bank_info.account_number
                              : maskAccountNumber(
                                  transaction.user.bank_info.account_number,
                                )}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() => {
                              setShowFullBankDetails(!showFullBankDetails);
                              if (
                                !showFullBankDetails &&
                                transaction.user?.bank_info
                              ) {
                                copyToClipboard(
                                  transaction.user.bank_info.account_number,
                                  'Account number',
                                );
                              }
                            }}
                            title={
                              showFullBankDetails
                                ? 'Hide full account number'
                                : 'Show full account number'
                            }
                          >
                            <Eye className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() => {
                              if (transaction.user?.bank_info) {
                                copyToClipboard(
                                  transaction.user.bank_info.account_number,
                                  'Account number',
                                );
                              }
                            }}
                            title='Copy account number'
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='mt-2 flex items-center justify-end'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            if (transaction.user?.bank_info) {
                              const bankInfo = transaction.user.bank_info;
                              const fullDetails = `Bank Name: ${bankInfo.bank_name}\nAccount Name: ${bankInfo.account_name}\nAccount Number: ${bankInfo.account_number}`;
                              copyToClipboard(fullDetails, 'Bank details');
                            }
                          }}
                          className='text-xs'
                        >
                          <Copy className='mr-1 h-3 w-3' />
                          Copy All Bank Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert variant='destructive'>
                    <AlertDescription>
                      User has not provided bank details. Please contact the
                      user to update their bank information before approving
                      this withdrawal.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={
                isExecuting ||
                (transaction.type === 'withdrawal' &&
                  !transaction.user?.bank_info)
              }
              isLoading={isExecuting}
            >
              Approve{' '}
              {transaction.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isOpen && action === 'reject'} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject Vault{' '}
              {transaction.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this{' '}
              {transaction.type === 'withdrawal' ? 'withdrawal' : 'deposit'}{' '}
              (optional). The user will be notified of the rejection.
            </DialogDescription>
          </DialogHeader>
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleReject)}>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>User:</span>
                    <span className='text-sm font-medium'>{userName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Amount:
                    </span>
                    <span className='text-sm font-medium'>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
                <FormField
                  control={rejectForm.control}
                  name='rejection_reason'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='Enter reason for rejection...'
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type='button' variant='outline' onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={isExecuting}
                  isLoading={isExecuting}
                >
                  Reject{' '}
                  {transaction.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
