import { ReactNode } from 'react';

import Sidebar from '@/components/common/sidebar';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const userEmail = data.user?.email || '';
  const { data: userRole } = data.user
    ? await supabase
        .from('user_role')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
    : { data: null };
  const isAdmin = userRole?.role === 'admin';

  return (
    <div className='flex min-h-screen'>
      <Sidebar userEmail={userEmail} isAdmin={isAdmin} />

      <main className='min-w-0 flex-1 px-6 py-6 pt-20 lg:ml-64 lg:max-w-[calc(100vw-256px)] lg:pb-10 lg:pt-10'>
        {children}
      </main>
    </div>
  );
}
