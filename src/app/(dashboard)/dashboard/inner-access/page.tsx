'use client';
import { Home, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLoggedInUser } from '@/hooks/queries/profile';

import { hasApprovedInvestment } from '@/actions/rental-properties';

import { FeatureLock } from '@/components/common/feature-lock';
import { ReferralsContent } from '@/components/dashboard/referrals/referrals-content';
import { WithdrawalsContent } from '@/components/dashboard/withdrawals/withdrawals-content';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { paths } from '@/constants/paths';

export default function ReferralsPage() {
  const { data: user } = useLoggedInUser();
  const [showAddButton, setShowAddButton] = useState(false);

  useEffect(() => {
    if (user?.id) {
      hasApprovedInvestment(user.id)
        .then((hasInvestment) => {
          setShowAddButton(hasInvestment);
        })
        .catch(() => {
          setShowAddButton(false);
        });
    } else {
      setShowAddButton(false);
    }
  }, [user?.id]);

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Inner Access</h1>
        <p className='text-muted-foreground'>
          Manage your referrals, withdrawals, and rental property submissions.
        </p>
      </div>

      <Tabs defaultValue='referrals' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='referrals'>Referrals</TabsTrigger>
          <TabsTrigger value='withdrawals'>Withdrawals</TabsTrigger>
          <TabsTrigger value='submit-property'>
            Submit Rental Property
          </TabsTrigger>
        </TabsList>

        <TabsContent value='referrals' className='space-y-4'>
          <ReferralsContent />
        </TabsContent>

        <TabsContent value='withdrawals' className='space-y-4'>
          <WithdrawalsContent />
        </TabsContent>

        <TabsContent value='submit-property' className='space-y-4'>
          {showAddButton ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Home className='h-5 w-5' />
                  Submit Rental Property
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  As an approved investor, you can submit rental properties to
                  our platform. Once approved, your properties will be listed
                  and available for rent and can be booked via Whatsapp.
                </p>
                <FeatureLock featureName='rental property submissions'>
                  <Button asChild>
                    <a href={paths.rentalProperties.submit}>
                      Add Rental Apartment
                    </a>
                  </Button>
                </FeatureLock>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription>
                You need to invest in a property first to submit rental
                properties.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
