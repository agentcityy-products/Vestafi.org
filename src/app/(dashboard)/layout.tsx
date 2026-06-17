import { ReactNode } from 'react';

import Sidebar from '@/components/common/sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const userEmail = data.user?.email || '';
  const isAdmin = data.user?.user_metadata.role === 'admin';

  return (
    <div className='flex min-h-screen'>
      <Sidebar userEmail={userEmail} isAdmin={isAdmin} />
      <DashboardHeader userEmail={userEmail} />

      <main className='min-w-0 flex-1 px-6 py-6 pt-20 lg:ml-64 lg:max-w-[calc(100vw-256px)] lg:pb-10 lg:pt-16'>
        {/* <MembershipActivationBanner /> */}
        {children}
      </main>
    </div>
  );
}
