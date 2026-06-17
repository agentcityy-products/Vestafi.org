'use client';

import { Building2, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react';

import { MembershipActivationDialog } from '@/components/dashboard/membership/membership-activation-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { paths } from '@/constants/paths';

interface InnerAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InnerAccessModal({
  open,
  onOpenChange,
}: InnerAccessModalProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  const handlePayMembership = () => {
    onOpenChange(false);
    // Small delay to ensure the inner access modal closes first
    setTimeout(() => {
      // Find and click the hidden trigger button inside MembershipActivationDialog
      const trigger = triggerRef.current?.querySelector('button');
      if (trigger) {
        trigger.click();
      }
    }, 100);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-2'>
              <div className='rounded-lg bg-primary/10 p-2'>
                <Lock className='h-5 w-5 text-primary' />
              </div>
              <DialogTitle>Inner Access Feature</DialogTitle>
            </div>
            <DialogDescription className='pt-2'>
              This is an Inner Access feature. Unlock by contributing to one
              apartment or paying membership.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='flex flex-col gap-3'>
              <Button
                onClick={handlePayMembership}
                className='w-full'
                size='lg'
              >
                <Sparkles className='mr-2 h-4 w-4' />
                Pay Membership
              </Button>

              <Button
                asChild
                variant='outline'
                className='w-full'
                size='lg'
                onClick={() => onOpenChange(false)}
              >
                <Link href={paths.listings.list}>
                  <Building2 className='mr-2 h-4 w-4' />
                  Explore Apartments to Contribute
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Membership Activation Dialog with trigger */}
      <div ref={triggerRef} className='hidden'>
        <MembershipActivationDialog />
      </div>
    </>
  );
}
