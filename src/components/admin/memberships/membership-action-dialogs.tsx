'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { MembershipActivationWithUser } from '@/hooks/queries/admin-memberships';

import { updateMembershipActivationStatus } from '@/actions/membership';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { getFullName } from '@/utils/string-functions';

import { QueryKeys } from '@/constants/query-keys';

const rejectMembershipActivationSchema = z.object({
  rejection_reason: z
    .string()
    .min(1, 'Rejection reason is required')
    .min(10, 'Rejection reason must be at least 10 characters'),
});

type RejectFormData = z.infer<typeof rejectMembershipActivationSchema>;

interface MembershipActionDialogsProps {
  activation: MembershipActivationWithUser | null;
  action: 'approve' | 'reject' | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MembershipActionDialogs({
  activation,
  action,
  onClose,
  onSuccess,
}: MembershipActionDialogsProps) {
  const queryClient = useQueryClient();

  // Derive isOpen from props - dialog is open when both activation and action are set
  const isOpen = !!activation && !!action;

  const rejectForm = useForm<RejectFormData>({
    resolver: zodResolver(rejectMembershipActivationSchema),
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
    updateMembershipActivationStatus,
    {
      onSuccess: () => {
        toast.success(
          `Membership activation ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        );
        handleClose();
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.ADMIN_MEMBERSHIP_ACTIVATIONS],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.USER_MEMBERSHIP_STATUS],
        });
        onSuccess();
      },
      onError: (error) => {
        toast.error(
          error.error.serverError ||
            'Failed to update membership activation status',
        );
      },
    },
  );

  const handleClose = () => {
    rejectForm.reset();
    onClose();
  };

  const handleApprove = () => {
    if (!activation) return;
    updateStatus({
      id: activation.id,
      status: 'approved',
    });
  };

  const handleReject = (data: RejectFormData) => {
    if (!activation) return;
    updateStatus({
      id: activation.id,
      status: 'rejected',
      rejection_reason: data.rejection_reason,
    });
  };

  // Don't render anything if no activation or action
  if (!activation || !action) return null;

  const userName = activation.user
    ? getFullName(activation.user.first_name, activation.user.last_name)
    : 'Unknown User';

  return (
    <>
      {/* Approve Dialog */}
      <Dialog open={isOpen && action === 'approve'} onOpenChange={handleClose}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Approve Membership Activation</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this membership activation
              request? The user's membership will be activated and they will
              gain full access to all platform features.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>User:</span>
                <span className='text-sm font-medium'>{userName}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Email:</span>
                <span className='text-sm font-medium'>
                  {activation.user?.email || 'N/A'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Amount:</span>
                <span className='text-sm font-medium'>
                  {formatCurrency(activation.amount)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Activation ID:
                </span>
                <span className='font-mono text-sm text-muted-foreground'>
                  {activation.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription>
                <strong>Important:</strong> Only approve this activation request
                after you have verified the payment proof. Once approved, the
                user's membership will be activated immediately.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isExecuting}
              isLoading={isExecuting}
            >
              Approve Activation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isOpen && action === 'reject'} onOpenChange={handleClose}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Reject Membership Activation</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this membership activation
              request. The user will receive an email with this rejection
              reason.
            </DialogDescription>
          </DialogHeader>
          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit(handleReject)}
              className='space-y-4'
            >
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>User:</span>
                    <span className='text-sm font-medium'>{userName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Email:</span>
                    <span className='text-sm font-medium'>
                      {activation.user?.email || 'N/A'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Amount:
                    </span>
                    <span className='text-sm font-medium'>
                      {formatCurrency(activation.amount)}
                    </span>
                  </div>
                </div>

                <FormField
                  control={rejectForm.control}
                  name='rejection_reason'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='Enter the reason for rejection (minimum 10 characters)'
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={isExecuting}
                  isLoading={isExecuting}
                >
                  Reject Activation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

