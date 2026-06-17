'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Copy,
  CreditCard,
  Info,
  Plus,
  Smartphone,
  Upload,
  User,
} from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useLoggedInUser } from '@/hooks/queries/profile';

import { createVaultDepositSchema } from '@/schema/vault';
import { createVaultDeposit } from '@/actions/vault';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { uploadToSupabase } from '@/utils/supabase-bucket';

import { appConfig } from '@/config/app';
import { businessConfig } from '@/config/app';
import { bankData } from '@/constants/bank-data';
import { QueryKeys } from '@/constants/query-keys';

type FormData = z.infer<typeof createVaultDepositSchema>;

export function CreateDepositDialog() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { data: loggedInUser } = useLoggedInUser();

  const form = useForm<FormData>({
    resolver: zodResolver(createVaultDepositSchema),
    defaultValues: {
      amount: 0,
      proof_images: [],
    },
  });

  const { execute, isExecuting } = useAction(createVaultDeposit, {
    onSuccess: () => {
      toast.success('Deposit request created successfully');
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.VAULT],
      });
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error.error.serverError || 'Failed to create deposit request',
      );
    },
  });

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const bankDetailsItems = [
    {
      label: 'Bank Name',
      value: bankData.bankName,
      icon: <Building2 className='h-4 w-4' />,
    },
    {
      label: 'Account Name',
      value: bankData.accountName,
      icon: <CreditCard className='h-4 w-4' />,
    },
    {
      label: 'Account Number',
      value: bankData.accountNumber,
      icon: <CreditCard className='h-4 w-4' />,
    },
    {
      label: 'MTN Mobile Money',
      value: bankData.mtnMobileMoneyCode,
      icon: <Smartphone className='h-4 w-4' />,
    },
    {
      label: 'MTN Mobile Money Name',
      value: bankData.mtnMobileMoneyName,
      icon: <User className='h-4 w-4' />,
    },
    {
      label: 'Airtel Money',
      value: bankData.airtelMoneyCode,
      icon: <Smartphone className='h-4 w-4' />,
    },
    {
      label: 'Airtel Money Name',
      value: bankData.airtelMoneyName,
      icon: <User className='h-4 w-4' />,
    },
  ];

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    if (!loggedInUser) {
      toast.error('Please login to upload files');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // RLS policy requires user ID as first folder in path
        const fileName = `${loggedInUser.id}/vault-deposits/${Date.now()}_${file.name}`;
        const { url, error } = await uploadToSupabase(
          file,
          fileName,
          'payment-proofs',
          file.type,
        );
        if (error) throw new Error(error.message);
        return url;
      });

      const urls = await Promise.all(uploadPromises);
      form.setValue('proof_images', urls);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    if (data.proof_images.length === 0) {
      toast.error('Please upload at least one payment proof');
      return;
    }

    if (data.amount < businessConfig.minVaultDeposit) {
      form.setError('amount', {
        message: `Minimum deposit amount is ${formatCurrency(businessConfig.minVaultDeposit)}`,
      });
      return;
    }

    execute(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4' />
          Deposit Funds
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Deposit to Vault</DialogTitle>
          <DialogDescription className='space-y-2'>
            <p>Upload payment proof and deposit funds to your vault.</p>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <span className='text-muted-foreground'>Minimum deposit:</span>
              <span className='text-primary'>
                {formatCurrency(businessConfig.minVaultDeposit)}
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
                  <FormControl>
                    <Input
                      type='text'
                      value={field.value === 0 ? '' : formatNumber(field.value)}
                      onChange={(e) => {
                        // Remove all non-digit characters
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        // Convert to number (empty string becomes 0)
                        const numericValue = rawValue
                          ? parseInt(rawValue, 10)
                          : 0;
                        field.onChange(numericValue);
                      }}
                      onBlur={field.onBlur}
                      placeholder='Enter amount'
                    />
                  </FormControl>
                  <FormDescription>
                    Entered amount: {formatCurrency(field.value)}
                    {field.value > 0 &&
                      field.value < businessConfig.minVaultDeposit && (
                        <span className='mt-1 block text-destructive'>
                          Minimum deposit is{' '}
                          {formatCurrency(businessConfig.minVaultDeposit)}
                        </span>
                      )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Details Section */}
            {form.watch('amount') > 0 && (
              <div className='space-y-4'>
                <Alert>
                  <Info className='h-4 w-4' />
                  <AlertDescription>
                    Please transfer{' '}
                    <strong>{formatCurrency(form.watch('amount'))}</strong> to
                    the following {appConfig.title} payment details, then upload
                    your payment receipt below.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>
                      {appConfig.title} Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    {bankDetailsItems.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center gap-2'>
                          {item.icon}
                          <p className='text-sm font-medium text-muted-foreground'>
                            {item.label}:
                          </p>
                          <p className='text-base font-semibold'>
                            {item.value}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() =>
                            copyToClipboard(item.value, item.label)
                          }
                          className='h-6 w-6'
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            <FormField
              control={form.control}
              name='proof_images'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Proof</FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      <Input
                        type='file'
                        multiple
                        accept='image/*,application/pdf'
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            handleFileUpload(files);
                          }
                        }}
                        disabled={uploading}
                      />
                      {field.value.length > 0 && (
                        <div className='text-sm text-muted-foreground'>
                          {field.value.length} file(s) uploaded
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload screenshot of your payment transaction
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
                disabled={uploading || isExecuting}
                isLoading={uploading || isExecuting}
              >
                {uploading ? (
                  <>
                    <Upload className='mr-2 h-4 w-4 animate-spin' />
                    Uploading...
                  </>
                ) : isExecuting ? (
                  'Creating...'
                ) : (
                  'Create Deposit Request'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
