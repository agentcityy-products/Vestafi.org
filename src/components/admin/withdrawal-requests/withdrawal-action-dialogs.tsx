'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, FileImage, Upload, X } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateWithdrawalRequest } from '@/actions/withdrawal-request';

import { Button } from '@/components/ui/button';
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
import { uploadToSupabase } from '@/utils/supabase-bucket';

import { WithdrawalRequestWithUserDetails } from '@/types/dao';

// Schemas for form validation
const markAsPaidSchema = z.object({
  paymentProof: z.instanceof(File, { message: 'Payment proof is required' }),
});

const rejectWithdrawalSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

type MarkAsPaidFormData = z.infer<typeof markAsPaidSchema>;
type RejectFormData = z.infer<typeof rejectWithdrawalSchema>;

interface WithdrawalActionDialogsProps {
  withdrawalRequest: WithdrawalRequestWithUserDetails | null;
  action: 'mark_paid' | 'reject' | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Copy to clipboard utility
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

export function WithdrawalActionDialogs({
  withdrawalRequest,
  action,
  onClose,
  onSuccess,
}: WithdrawalActionDialogsProps) {
  const [isUploading, setIsUploading] = useState(false);

  const markAsPaidForm = useForm<MarkAsPaidFormData>({
    resolver: zodResolver(markAsPaidSchema),
  });

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectWithdrawalSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  const { execute: updateStatus, isExecuting } = useAction(
    updateWithdrawalRequest,
    {
      onSuccess: () => {
        toast.success(
          `Withdrawal request ${action === 'mark_paid' ? 'marked as paid' : 'rejected'} successfully`,
        );
        handleClose();
        onSuccess();
      },
      onError: (error) => {
        toast.error(
          error.error.serverError || 'Failed to update withdrawal request',
        );
      },
    },
  );

  const handleClose = () => {
    markAsPaidForm.reset();
    rejectForm.reset();
    onClose();
  };

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        markAsPaidForm.setValue('paymentProof', acceptedFiles[0]);
        markAsPaidForm.clearErrors('paymentProof');
      }
    },
    [markAsPaidForm],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleMarkAsPaid = async (data: MarkAsPaidFormData) => {
    if (!withdrawalRequest) return;

    try {
      setIsUploading(true);

      // Upload payment proof
      const filePath = `withdrawal-${withdrawalRequest.id}/${Date.now()}-${data.paymentProof.name}`;
      const { url: paymentProofUrl, error: uploadError } =
        await uploadToSupabase(data.paymentProof, filePath, 'payment-proofs');

      if (uploadError || !paymentProofUrl) {
        toast.error('Failed to upload payment proof');
        return;
      }

      // Update withdrawal request status
      updateStatus({
        id: withdrawalRequest.id,
        status: 'paid',
        payment_proof_url: paymentProofUrl,
      });
    } catch {
      toast.error('Failed to process payment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = (data: RejectFormData) => {
    if (!withdrawalRequest) return;

    updateStatus({
      id: withdrawalRequest.id,
      status: 'rejected',
      rejection_reason: data.rejectionReason,
    });
  };

  const selectedFile = markAsPaidForm.watch('paymentProof');

  return (
    <>
      {/* Mark as Paid Dialog */}
      <Dialog open={action === 'mark_paid'} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Check className='h-5 w-5 text-green-600' />
              Mark Withdrawal as Paid
            </DialogTitle>
            <DialogDescription>
              Upload payment proof after manually transferring{' '}
              <span className='font-medium text-primary'>
                {withdrawalRequest && formatCurrency(withdrawalRequest.amount)}
              </span>{' '}
              to the user's bank account
            </DialogDescription>
          </DialogHeader>

          <Form {...markAsPaidForm}>
            <form
              onSubmit={markAsPaidForm.handleSubmit(handleMarkAsPaid)}
              className='space-y-4'
            >
              {/* Bank Details Section */}
              {withdrawalRequest?.user && (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-medium'>Payment Details</h4>
                  </div>
                  <div className='rounded-lg border bg-muted/20 p-3'>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground'>Name:</span>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>
                            {withdrawalRequest.user.first_name}{' '}
                            {withdrawalRequest.user.last_name}
                          </span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() =>
                              copyToClipboard(
                                `${withdrawalRequest.user.first_name} ${withdrawalRequest.user.last_name}`,
                                'Name',
                              )
                            }
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground'>Email:</span>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>
                            {withdrawalRequest.user.email}
                          </span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() =>
                              copyToClipboard(
                                withdrawalRequest.user.email,
                                'Email',
                              )
                            }
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      {withdrawalRequest.user.bank && (
                        <>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>
                              Bank Name:
                            </span>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                {withdrawalRequest.user.bank.bank_name}
                              </span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0'
                                onClick={() =>
                                  copyToClipboard(
                                    withdrawalRequest.user.bank!.bank_name,
                                    'Bank Name',
                                  )
                                }
                              >
                                <Copy className='h-3 w-3' />
                              </Button>
                            </div>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>
                              Account Number:
                            </span>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono font-medium'>
                                {withdrawalRequest.user.bank.account_number}
                              </span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0'
                                onClick={() =>
                                  copyToClipboard(
                                    withdrawalRequest.user.bank!.account_number,
                                    'Account Number',
                                  )
                                }
                              >
                                <Copy className='h-3 w-3' />
                              </Button>
                            </div>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>
                              Account Name:
                            </span>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                {withdrawalRequest.user.bank.account_name}
                              </span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0'
                                onClick={() =>
                                  copyToClipboard(
                                    withdrawalRequest.user.bank!.account_name,
                                    'Account Name',
                                  )
                                }
                              >
                                <Copy className='h-3 w-3' />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {!withdrawalRequest.user.bank && (
                      <div className='py-2 text-center'>
                        <span className='text-sm text-red-600'>
                          ⚠️ No bank details available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <FormField
                control={markAsPaidForm.control}
                name='paymentProof'
                render={() => (
                  <FormItem>
                    <FormLabel>Payment Proof</FormLabel>
                    <FormControl>
                      <div className='space-y-3'>
                        <div
                          {...getRootProps()}
                          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${
                            isDragActive
                              ? 'border-primary bg-primary/5'
                              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                          }`}
                        >
                          <input {...getInputProps()} />
                          <div className='text-center'>
                            <Upload className='mx-auto h-8 w-8 text-muted-foreground/50' />
                            <div className='mt-2'>
                              <p className='text-sm font-medium text-primary'>
                                {isDragActive
                                  ? 'Drop the payment proof here...'
                                  : 'Click to upload or drag and drop'}
                              </p>
                              <p className='mt-1 text-xs text-muted-foreground'>
                                Upload screenshot/receipt of bank transfer
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedFile && (
                          <div className='flex items-center gap-2 rounded-lg bg-green-50 p-3'>
                            <FileImage className='h-4 w-4 text-green-600' />
                            <span className='flex-1 truncate text-sm font-medium text-green-800'>
                              {selectedFile.name}
                            </span>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                markAsPaidForm.setValue(
                                  'paymentProof',
                                  undefined as unknown as File,
                                );
                              }}
                              className='h-auto p-1 text-green-600 hover:text-red-600'
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='button' variant='outline' onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={!selectedFile}
                  isLoading={isUploading || isExecuting}
                >
                  Mark as Paid
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={action === 'reject'} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <X className='h-5 w-5 text-red-600' />
              Reject Withdrawal Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request of{' '}
              <span className='font-medium text-destructive'>
                {withdrawalRequest && formatCurrency(withdrawalRequest.amount)}
              </span>
            </DialogDescription>
          </DialogHeader>

          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit(handleReject)}
              className='space-y-4'
            >
              <FormField
                control={rejectForm.control}
                name='rejectionReason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter the reason for rejecting this withdrawal request...'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='button' variant='outline' onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  isLoading={isExecuting}
                  variant='destructive'
                >
                  Reject Request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
