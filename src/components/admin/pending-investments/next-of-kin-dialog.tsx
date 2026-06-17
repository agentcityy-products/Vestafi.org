'use client';

import { CountryCode } from 'libphonenumber-js';
import { Heart, Mail, MapPin, Phone, User, Users } from 'lucide-react';

import { useNextOfKin } from '@/hooks/queries/next_of_kin';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { formatPhoneNumber } from '@/utils/string-functions';

interface NextOfKinDialogProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NextOfKinDialog({
  userId,
  userName,
  isOpen,
  onClose,
}: NextOfKinDialogProps) {
  const { data: nextOfKin, isLoading, error } = useNextOfKin({ userId });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-primary' />
            Next of Kin Information
          </DialogTitle>
          <DialogDescription>
            Emergency contact details for {userName}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {isLoading && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-6 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-6 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-6 w-full' />
              </div>
            </div>
          )}

          {error && (
            <Alert>
              <AlertDescription>
                Failed to load next of kin information. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && !nextOfKin && (
            <Alert>
              <AlertDescription>
                No next of kin information has been provided by this user.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && nextOfKin && (
            <div className='space-y-4'>
              {/* Personal Information */}
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>Full Name</span>
                </div>
                <p className='ml-6 font-semibold'>
                  {nextOfKin.first_name} {nextOfKin.last_name}
                </p>
              </div>

              {/* Relationship */}
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Heart className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>Relationship</span>
                </div>
                <Badge variant='secondary' className='ml-6'>
                  {nextOfKin.relationship}
                </Badge>
              </div>

              {/* Email */}
              {nextOfKin.email && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Email</span>
                  </div>
                  <p className='ml-6 font-mono text-sm'>{nextOfKin.email}</p>
                </div>
              )}

              {/* Phone */}
              {nextOfKin.phone && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Phone</span>
                  </div>
                  <p className='ml-6 font-mono text-sm'>
                    {formatPhoneNumber(
                      nextOfKin.phone,
                      nextOfKin.country_code as CountryCode,
                    )}
                  </p>
                </div>
              )}

              {/* Address */}
              {nextOfKin.address && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Address</span>
                  </div>
                  <p className='ml-6 text-sm text-muted-foreground'>
                    {nextOfKin.address}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
