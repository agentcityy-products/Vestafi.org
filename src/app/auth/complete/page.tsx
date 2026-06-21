'use client';

import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Logo from '@/components/common/logo';

import { supabase } from '@/lib/supabase/client';

import { paths } from '@/constants/paths';

export default function CompleteAuthenticationPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing your secure sign-in…');

  useEffect(() => {
    async function complete() {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        setMessage('This sign-in link is incomplete or has expired.');
        window.setTimeout(
          () => router.replace(`${paths.auth.login}?error=missing_auth_token`),
          1500,
        );
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setMessage('This sign-in link could not be verified.');
        window.setTimeout(
          () => router.replace(`${paths.auth.login}?error=auth_callback_failed`),
          1500,
        );
        return;
      }

      window.history.replaceState(null, '', paths.auth.complete);
      router.replace(paths.dashboard.root);
      router.refresh();
    }

    void complete();
  }, [router]);

  return (
    <main className='flex min-h-screen items-center justify-center bg-emerald-50/40 p-6'>
      <div className='w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-xl'>
        <div className='flex justify-center'>
          <Logo />
        </div>
        <LoaderCircle className='mx-auto mt-8 h-8 w-8 animate-spin text-primary' />
        <h1 className='mt-5 text-2xl font-bold'>Welcome to Vestafi</h1>
        <p className='mt-2 text-sm text-muted-foreground'>{message}</p>
      </div>
    </main>
  );
}
