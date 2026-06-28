import { Metadata } from 'next';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/utils/date-functions';

export const metadata: Metadata = {
  title: 'Ownership Requests',
  description: 'Prime ownership reservation and handoff requests.',
};

export default async function AdminOwnershipRequestsPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('ownership_contact_requests')
    .select(
      '*, property:property_id(title, images, city, country), user:user_id(first_name, last_name, email, phone)',
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Ownership Requests
        </h1>
        <p className='text-muted-foreground'>
          Prime reservation and human handoff requests from members.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prime Handoffs</CardTitle>
          <CardDescription>
            Each reservation is held for one week unless completed, cancelled,
            or expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apartment</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data || []).map((request) => {
                const property = Array.isArray(request.property)
                  ? request.property[0]
                  : request.property;
                const user = Array.isArray(request.user)
                  ? request.user[0]
                  : request.user;
                const image = property?.images?.[0];

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        {image && (
                          <div className='relative h-12 w-14 overflow-hidden rounded-lg border'>
                            <Image
                              src={image}
                              alt={property?.title || 'Apartment'}
                              fill
                              className='object-cover'
                              sizes='56px'
                            />
                          </div>
                        )}
                        <div>
                          <p className='font-medium'>{property?.title}</p>
                          <p className='text-xs text-muted-foreground'>
                            {[property?.city, property?.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className='font-medium'>
                        {[user?.first_name, user?.last_name]
                          .filter(Boolean)
                          .join(' ') || 'Member'}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {user?.email}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {user?.phone}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(new Date(request.created_at))}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(new Date(request.expires_at))}
                    </TableCell>
                    <TableCell className='max-w-xs text-sm text-muted-foreground'>
                      {request.note}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!data?.length && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='py-10 text-center text-muted-foreground'
                  >
                    No Prime handoff requests yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
