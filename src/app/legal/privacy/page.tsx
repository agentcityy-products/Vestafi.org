import { format } from 'date-fns';
import {
  ArrowLeft,
  Database,
  Eye,
  Lock,
  Mail,
  Shield,
  Users,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { paths } from '@/constants/paths';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how VESTAFI protects and handles your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50'>
      <div className='container mx-auto max-w-4xl px-6 py-12'>
        {/* Header */}
        <div className='mb-8'>
          <Link href='/' className='mb-6 inline-block'>
            <Button variant='ghost' className='flex items-center gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Back to Home
            </Button>
          </Link>

          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100'>
              <Shield className='h-8 w-8 text-emerald-600' />
            </div>
            <h1 className='text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl'>
              Privacy Policy
            </h1>
            <p className='mt-4 text-lg text-slate-600'>
              Your privacy is fundamental to how we operate at VESTAFI
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              Last updated: {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>

        {/* Quick Overview */}
        <Card className='mb-8 border-emerald-200 bg-emerald-50/50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-emerald-800'>
              <Eye className='h-5 w-5' />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent className='text-emerald-700'>
            <p>
              VESTAFI is committed to protecting your privacy. We collect only
              the information necessary to provide our co-ownership platform
              services, never sell your data, and give you control over your
              information.
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className='space-y-8'>
          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Database className='h-5 w-5 text-blue-600' />
                Information We Collect
              </CardTitle>
              <CardDescription>
                We collect information to provide and improve our services
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='mb-2 font-semibold text-slate-900'>
                  Personal Information
                </h4>
                <ul className='ml-4 list-inside list-disc space-y-1 text-slate-600'>
                  <li>First name and last name</li>
                  <li>Phone number and country code</li>
                  <li>
                    Email address (for account creation and communication)
                  </li>
                </ul>
              </div>

              <div>
                <h4 className='mb-2 font-semibold text-slate-900'>
                  Banking Information
                </h4>
                <ul className='ml-4 list-inside list-disc space-y-1 text-slate-600'>
                  <li>Bank name</li>
                  <li>Account number</li>
                  <li>Account name</li>
                </ul>
              </div>

              <div>
                <h4 className='mb-2 font-semibold text-slate-900'>
                  Technical Information
                </h4>
                <ul className='ml-4 list-inside list-disc space-y-1 text-slate-600'>
                  <li>How you interact with our platform</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-purple-600' />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-3 text-slate-600'>
                <li className='flex items-start gap-3'>
                  <div className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500'></div>
                  <span>
                    Verify your identity and eligibility for our platform
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500'></div>
                  <span>
                    Process your investment applications and transactions
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500'></div>
                  <span>
                    Communicate important updates about your investments
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500'></div>
                  <span>Improve our platform and develop new features</span>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500'></div>
                  <span>Comply with legal and regulatory requirements</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Lock className='h-5 w-5 text-green-600' />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-slate-600'>
                We implement industry-standard security measures to protect your
                information:
              </p>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-lg border border-slate-200 p-4'>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Encryption
                  </h4>
                  <p className='text-sm text-slate-600'>
                    All data is encrypted in transit and at rest using AES-256
                    encryption
                  </p>
                </div>
                <div className='rounded-lg border border-slate-200 p-4'>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Access Controls
                  </h4>
                  <p className='text-sm text-slate-600'>
                    Strict access controls ensure only authorized personnel can
                    access your data
                  </p>
                </div>
                <div className='rounded-lg border border-slate-200 p-4'>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Regular Audits
                  </h4>
                  <p className='text-sm text-slate-600'>
                    We conduct regular security audits and penetration testing
                  </p>
                </div>
                <div className='rounded-lg border border-slate-200 p-4'>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Compliance
                  </h4>
                  <p className='text-sm text-slate-600'>
                    We comply with GDPR, CCPA, and other privacy regulations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
              <CardDescription>
                You have control over your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Access & Portability
                  </h4>
                  <p className='text-sm text-slate-600'>
                    Request a copy of your personal data in a portable format
                  </p>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Correction
                  </h4>
                  <p className='text-sm text-slate-600'>
                    Update or correct any inaccurate personal information
                  </p>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Deletion
                  </h4>
                  <p className='text-sm text-slate-600'>
                    Request deletion of your personal data (subject to legal
                    requirements)
                  </p>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>Opt-out</h4>
                  <p className='text-sm text-slate-600'>
                    Unsubscribe from marketing communications at any time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className='border-emerald-200 bg-emerald-50/50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-emerald-800'>
                <Mail className='h-5 w-5' />
                Questions About Privacy?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='mb-4 text-emerald-700'>
                If you have any questions about this Privacy Policy or how we
                handle your data, please don't hesitate to contact us.
              </p>
              <Link href={paths.support}>
                <Button className='bg-emerald-600 hover:bg-emerald-700'>
                  Contact Privacy Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-8' />

        {/* Footer */}
        <div className='text-center text-sm text-slate-500'>
          <p>
            This Privacy Policy is part of our{' '}
            <Link
              href='/legal/terms'
              className='text-emerald-600 underline hover:text-emerald-700'
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
