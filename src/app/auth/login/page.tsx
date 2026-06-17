import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';
import Logo from '@/components/common/logo';

import { paths } from '@/constants/paths';

export default function LoginPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-white to-emerald-50 p-6'>
      <div className='w-full max-w-md'>
        {/* Login Form Card */}
        <div className='rounded-2xl border bg-card/80 p-8 shadow-lg backdrop-blur-sm'>
          {/* Logo and Header */}
          <div className='mb-8 flex justify-center'>
            <Logo unlinked width={120} />
          </div>

          <LoginForm />
        </div>

        {/* Footer */}
        <div className='mt-6 text-center text-sm text-muted-foreground'>
          <p>
            Need help?{' '}
            <Link
              href={paths.support}
              className='font-medium text-primary hover:underline'
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
