'use client';

import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Copy,
  CreditCard,
  ImageIcon,
  Info,
  Smartphone,
  Upload,
  User,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';

import { formatCurrency, formatNumber } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { bankData } from '@/constants/bank-data';
import { paths } from '@/constants/paths';

import { ListingsViewRow } from '@/types/dao';

type DialogStep = 'choice' | 'vault' | 'bank-instructions' | 'bank-proof';

interface PaymentInstructionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: ListingsViewRow;
  investmentAmount: number;
  expectedReturns: {
    min: number;
    max: number;
  };
  vaultBalance: number;
  isVaultBalanceLoading: boolean;
  onDeploy: () => void;
  isDeploying: boolean;
  onSubmit: (paymentProofs: File[]) => void;
}

export const PaymentInstructionsDialog = ({
  isOpen,
  onClose,
  property,
  investmentAmount,
  expectedReturns,
  vaultBalance,
  isVaultBalanceLoading,
  onDeploy,
  isDeploying,
  onSubmit,
}: PaymentInstructionsDialogProps) => {
  const [step, setStep] = useState<DialogStep>('choice');
  const [paymentProofs, setPaymentProofs] = useState<File[]>([]);

  const hasSufficientBalance = vaultBalance >= investmentAmount;
  const balanceShortfall = investmentAmount - vaultBalance;
  const canDeploy =
    !isVaultBalanceLoading && hasSufficientBalance && investmentAmount > 0;

  const propertyValue = property.price || 0;
  const futureOwnership =
    propertyValue > 0 && investmentAmount > 0
      ? (investmentAmount / propertyValue) * 100
      : 0;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
        toast.error(`${file.name} is not an image or PDF file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setPaymentProofs((prev) => {
      const newFiles = [...prev, ...validFiles];
      if (newFiles.length > 5) {
        toast.error('Maximum 5 images allowed');
        return newFiles.slice(0, 5);
      }
      return newFiles;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setPaymentProofs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (paymentProofs.length === 0) {
      toast.error('Please upload at least one payment proof image');
      return;
    }
    onSubmit(paymentProofs);
  };

  const handleClose = () => {
    setStep('choice');
    setPaymentProofs([]);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setStep('choice');
      setPaymentProofs([]);
    }
  }, [isOpen]);

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

  const getDialogTitle = () => {
    switch (step) {
      case 'choice':
        return 'Choose Payment Method';
      case 'vault':
        return 'Deploy from Vault';
      case 'bank-instructions':
        return 'Payment Instructions';
      case 'bank-proof':
        return 'Upload Payment Proof';
      default:
        return 'Investment';
    }
  };

  const getDialogDescription = () => {
    switch (step) {
      case 'choice':
        return 'Select how you want to complete your contribution';
      case 'vault':
        return 'Deploy funds from your vault to this property';
      case 'bank-instructions':
        return 'Follow the instructions below to complete your contribution';
      case 'bank-proof':
        return 'Upload your payment receipt to complete the process';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Property Info */}
          <div className='rounded-lg bg-muted/50 p-4'>
            <h4 className='mb-2 font-semibold'>{property.title}</h4>
            <p className='line-clamp-2 text-sm text-muted-foreground'>
              {property.city}, {property.state}, {property.country}
            </p>
          </div>

          {/* Choice Step */}
          {step === 'choice' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Contribution Amount
                </span>
                <span className='text-xl font-semibold'>
                  {formatCurrency(investmentAmount)}
                </span>
              </div>

              <Separator />

              <div className='grid gap-4 sm:grid-cols-2'>
                {/* Vault Option */}
                <Card
                  className={`cursor-pointer transition-all hover:border-primary ${
                    canDeploy ? '' : 'opacity-60'
                  }`}
                  onClick={() => canDeploy && setStep('vault')}
                >
                  <CardContent className='p-6'>
                    <div className='mb-3 flex items-center gap-3'>
                      <Wallet className='h-6 w-6 text-primary' />
                      <h4 className='font-semibold'>Deploy from Vault</h4>
                    </div>
                    <p className='mb-4 text-sm text-muted-foreground'>
                      Use your existing vault balance
                    </p>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Balance:</span>
                        <span className='font-medium'>
                          {isVaultBalanceLoading
                            ? 'Loading...'
                            : formatCurrency(vaultBalance)}
                        </span>
                      </div>
                      {!isVaultBalanceLoading && !hasSufficientBalance && (
                        <Alert variant='destructive' className='mt-2'>
                          <AlertCircle className='h-3 w-3' />
                          <AlertDescription className='text-xs'>
                            Need {formatCurrency(balanceShortfall)} more
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Transfer Option */}
                <Card
                  className='cursor-pointer transition-all hover:border-primary'
                  onClick={() => setStep('bank-instructions')}
                >
                  <CardContent className='p-6'>
                    <div className='mb-3 flex items-center gap-3'>
                      <CreditCard className='h-6 w-6 text-primary' />
                      <h4 className='font-semibold'>Pay via Bank Transfer</h4>
                    </div>
                    <p className='mb-4 text-sm text-muted-foreground'>
                      Transfer funds directly and upload proof
                    </p>
                    <div className='text-sm text-muted-foreground'>
                      Requires payment proof upload
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Vault Deployment Step */}
          {step === 'vault' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Deployment Amount
                </span>
                <span className='text-xl font-semibold'>
                  {formatCurrency(investmentAmount)}
                </span>
              </div>

              <Separator />

              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Vault Balance
                </span>
                <div className='flex items-center gap-2'>
                  <Wallet className='h-4 w-4 text-muted-foreground' />
                  <span className='text-lg font-semibold'>
                    {isVaultBalanceLoading
                      ? 'Loading...'
                      : formatCurrency(vaultBalance)}
                  </span>
                </div>
              </div>

              {!isVaultBalanceLoading && !hasSufficientBalance && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription className='space-y-2'>
                    <p>
                      Insufficient vault balance. You need{' '}
                      <strong>{formatCurrency(balanceShortfall)}</strong> more
                      to complete this deployment.
                    </p>
                    <Link href={paths.dashboard.vault}>
                      <Button variant='outline' size='sm' className='mt-2'>
                        <ArrowRight className='mr-2 h-4 w-4' />
                        Go to Vault to Deposit
                      </Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {!isVaultBalanceLoading && hasSufficientBalance && (
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Your vault balance is sufficient for this deployment.
                  </AlertDescription>
                </Alert>
              )}

              {/* {investmentAmount < businessConfig.minVaultDeployment && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Minimum deployment amount is{' '}
                    {formatCurrency(businessConfig.minVaultDeployment)}
                  </AlertDescription>
                </Alert>
              )} */}
            </div>
          )}

          {/* Bank Instructions Step */}
          {step === 'bank-instructions' && (
            <>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Contribution Amount
                  </span>
                  <span className='text-xl font-semibold'>
                    {formatCurrency(investmentAmount)}
                  </span>
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Your Ownership
                  </span>
                  <Badge variant='secondary'>
                    {formatNumber(futureOwnership, 2)}%
                  </Badge>
                </div>

                <div className='rounded-lg bg-green-50 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Info className='h-4 w-4 text-green-600' />
                    <span className='font-medium text-green-900'>
                      Expected Monthly Returns
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-green-700'>
                      Estimated Range
                    </span>
                    <span className='font-semibold text-green-800'>
                      {formatCurrency(expectedReturns.min)} -{' '}
                      {formatCurrency(expectedReturns.max)}
                    </span>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className='h-4 w-4' />
                <AlertDescription>
                  Please transfer{' '}
                  <strong>{formatCurrency(investmentAmount)}</strong> to the
                  following {appConfig.title} payment details, then upload your
                  payment receipt in the next step.
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
                        <p className='text-base font-semibold'>{item.value}</p>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => copyToClipboard(item.value, item.label)}
                        className='h-6 w-6'
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* Bank Proof Upload Step */}
          {step === 'bank-proof' && (
            <>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Payment Amount
                  </span>
                  <span className='text-lg font-semibold'>
                    {formatCurrency(investmentAmount)}
                  </span>
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Your Ownership
                  </span>
                  <Badge variant='secondary'>
                    {formatNumber(futureOwnership, 2)}%
                  </Badge>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Upload Payment Proof
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {paymentProofs.length}/5 images
                  </span>
                </div>

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
                    <ImageIcon className='mx-auto h-12 w-12 text-muted-foreground/50' />
                    <div className='mt-4'>
                      <p className='text-sm font-medium text-primary'>
                        {isDragActive
                          ? 'Drop the images here...'
                          : 'Click to upload or drag and drop'}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        PNG, JPG, GIF, PDF up to 10MB each (max 5 images)
                      </p>
                      {paymentProofs.length === 0 && (
                        <p className='mt-1 text-xs font-medium text-orange-600'>
                          At least 1 image required
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {paymentProofs.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>Uploaded Images:</p>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                      {paymentProofs.map((file, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 rounded-lg bg-green-50 p-3'
                        >
                          <Upload className='h-4 w-4 text-green-600' />
                          <span className='flex-1 truncate text-sm font-medium text-green-800'>
                            {file.name}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeFile(index)}
                            className='h-auto p-1 text-green-600 hover:text-red-600'
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                <h5 className='mb-2 font-medium text-blue-900'>Next Steps</h5>
                <ul className='space-y-1 text-sm text-blue-800'>
                  <li>• Your payment will be reviewed by our admin team</li>
                  <li>• You will receive confirmation within 24-48 hours</li>
                  <li>
                    • Returns will start once the apartment is funded 100%
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          {step !== 'choice' && (
            <Button
              variant='outline'
              onClick={
                step === 'vault' || step === 'bank-instructions'
                  ? () => setStep('choice')
                  : step === 'bank-proof'
                    ? () => setStep('bank-instructions')
                    : handleClose
              }
              className='w-full sm:w-auto'
              disabled={isDeploying}
            >
              Back
            </Button>
          )}
          {step === 'choice' && (
            <Button
              onClick={handleClose}
              className='w-full sm:w-auto'
              variant='outline'
            >
              Cancel
            </Button>
          )}
          {step === 'vault' && (
            <Button
              onClick={onDeploy}
              disabled={!canDeploy || isDeploying}
              isLoading={isDeploying}
              className='w-full sm:w-auto'
            >
              {isDeploying ? 'Deploying...' : 'Deploy Funds'}
            </Button>
          )}
          {step === 'bank-instructions' && (
            <Button
              onClick={() => setStep('bank-proof')}
              className='w-full sm:w-auto'
            >
              Continue to Upload Proof
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          )}
          {step === 'bank-proof' && (
            <Button
              onClick={handleSubmit}
              disabled={paymentProofs.length === 0}
              className='w-full sm:w-auto'
            >
              <Check className='mr-2 h-4 w-4' />
              Submit Payment ({paymentProofs.length} image
              {paymentProofs.length !== 1 ? 's' : ''})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
