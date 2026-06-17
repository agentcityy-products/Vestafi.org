'use client';

import { CountryCode } from 'libphonenumber-js';
import { Building2, Copy, CreditCard, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';

import { formatPhoneNumber } from '@/utils/string-functions';

import { BankInfoRow, ProfileRow } from '@/types/dao';

interface BankDetailsViewerProps {
  user: ProfileRow;
  bank: BankInfoRow | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Copy to clipboard utility
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

export function BankDetailsViewer({
  user,
  bank,
  trigger,
  open,
  onOpenChange,
}: BankDetailsViewerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const handlePasswordSubmit = () => {
    if (password === 'assertive123-') {
      setShowBankDetails(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const defaultTrigger = (
    <Button variant='outline' size='sm'>
      <CreditCard className='mr-2 h-4 w-4' />
      View Bank Details
    </Button>
  );

  const dialogContent = (
    <DialogContent className='sm:max-w-md'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <Building2 className='h-5 w-5' />
          Bank Details
        </DialogTitle>
        <DialogDescription>
          Bank information for {user.first_name} {user.last_name}
        </DialogDescription>
      </DialogHeader>

      <div className='space-y-4'>
        {/* User Information */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <User className='h-4 w-4' />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <span className='whitespace-nowrap text-sm text-muted-foreground'>
                User ID:
              </span>
              <div className='flex items-center gap-2'>
                <span className='line-clamp-1 font-medium'>{user.id}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0'
                  onClick={() => copyToClipboard(user.id, 'User ID')}
                >
                  <Copy className='h-3 w-3' />
                </Button>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Name:</span>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>
                  {user.first_name} {user.last_name}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0'
                  onClick={() =>
                    copyToClipboard(
                      `${user.first_name} ${user.last_name}`,
                      'Name',
                    )
                  }
                >
                  <Copy className='h-3 w-3' />
                </Button>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Email:</span>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{user.email}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0'
                  onClick={() => copyToClipboard(user.email, 'Email')}
                >
                  <Copy className='h-3 w-3' />
                </Button>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Phone:</span>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>
                  {formatPhoneNumber(
                    user.phone,
                    user.country_code as CountryCode,
                  )}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0'
                  onClick={() =>
                    copyToClipboard(
                      formatPhoneNumber(
                        user.phone,
                        user.country_code as CountryCode,
                      ),
                      'Phone',
                    )
                  }
                >
                  <Copy className='h-3 w-3' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <CreditCard className='h-4 w-4' />
              Bank Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {!showBankDetails ? (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Input
                    type='password'
                    placeholder='Enter password to view bank details'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordError && (
                    <Alert variant='destructive'>
                      <AlertDescription>
                        Incorrect password. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button onClick={handlePasswordSubmit} className='w-full'>
                  View Bank Details
                </Button>
              </div>
            ) : bank ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Bank Name:
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{bank.bank_name}</span>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0'
                      onClick={() =>
                        copyToClipboard(bank.bank_name, 'Bank Name')
                      }
                    >
                      <Copy className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Account Name:
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{bank.account_name}</span>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0'
                      onClick={() =>
                        copyToClipboard(bank.account_name, 'Account Name')
                      }
                    >
                      <Copy className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Account Number:
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='font-mono font-medium'>
                      {bank.account_number}
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0'
                      onClick={() =>
                        copyToClipboard(bank.account_number, 'Account Number')
                      }
                    >
                      <Copy className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className='py-4 text-center'>
                <Badge variant='secondary'>No bank details available</Badge>
                <p className='mt-2 text-sm text-muted-foreground'>
                  User has not provided bank information
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );

  if (isControlled) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
