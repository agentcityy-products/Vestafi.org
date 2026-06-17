import { redirect } from 'next/navigation';

import { OnboardingForm } from '@/components/auth/onboarding-form';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(paths.auth.login);

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <OnboardingForm email={user.email!} />
    </div>
  );
}
