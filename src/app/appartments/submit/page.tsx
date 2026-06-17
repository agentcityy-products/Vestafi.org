'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLoggedInUser } from '@/hooks/queries/profile';

import { hasApprovedInvestment } from '@/actions/rental-properties';

import { RentalPropertyForm } from '@/components/rental-properties/form/rental-property-form';
import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

export default function SubmitRentalPropertyPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useLoggedInUser();
  const [hasInvestment, setHasInvestment] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push(paths.auth.login);
        return;
      }

      hasApprovedInvestment(user.id)
        .then((result) => {
          setHasInvestment(result);
          setIsChecking(false);
          if (!result) {
            // User doesn't have approved investment, redirect or show message
            router.push(paths.rentalProperties.list);
          }
        })
        .catch(() => {
          setIsChecking(false);
          router.push(paths.rentalProperties.list);
        });
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isChecking) {
    return (
      <div className='container mx-auto flex min-h-screen items-center justify-center px-4 py-8'>
        <div className='text-center'>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasInvestment) {
    return (
      <div className='container mx-auto flex min-h-screen items-center justify-center px-4 py-8'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold'>Investment Required</h1>
          <p className='mb-4 text-muted-foreground'>
            You must have at least one approved investment to submit a rental
            property.
          </p>
          <Button asChild>
            <a href={paths.rentalProperties.list}>Back to Apartments</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <RentalPropertyForm
        onSuccess={() => {
          router.push(paths.rentalProperties.list);
        }}
      />
    </div>
  );
}
