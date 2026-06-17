import { format } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  FileText,
  Scale,
  Shield,
  UserCheck,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
  title: 'Terms of Service',
  description:
    'Terms and conditions for using the VESTAFI co-ownership platform.',
};

export default function TermsOfServicePage() {
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
              <FileText className='h-8 w-8 text-emerald-600' />
            </div>
            <h1 className='text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl'>
              Terms of Service
            </h1>
            <p className='mt-4 text-lg text-slate-600'>
              The legal agreement between you and VESTAFI
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              Last updated: {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <Alert className='mb-8 border-amber-200 bg-amber-50'>
          <AlertTriangle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800'>
            <strong>Important:</strong> These terms contain important
            information about your rights and obligations. Please read them
            carefully before using our platform.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className='space-y-8'>
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserCheck className='h-5 w-5 text-emerald-600' />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-slate-600'>
                By accessing or using VESTAFI's platform, you agree to be bound
                by these Terms of Service and all applicable laws and
                regulations. If you do not agree with any of these terms, you
                are prohibited from using our services.
              </p>
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
                <h4 className='mb-2 font-semibold text-emerald-800'>
                  Key Points:
                </h4>
                <ul className='list-inside list-disc space-y-1 text-sm text-emerald-700'>
                  <li>You must be at least 18 years old to use our platform</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Platform Description */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Scale className='h-5 w-5 text-blue-600' />
                Platform Description
              </CardTitle>
              <CardDescription>
                Understanding what VESTAFI offers
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-slate-600'>
                VESTAFI is an invite-only platform that facilitates co-ownership
                of real estate properties. We connect qualified investors to
                participate in fractional ownership opportunities.
              </p>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-lg border border-slate-200 p-4'>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    What We Provide
                  </h4>
                  <ul className='space-y-1 text-sm text-slate-600'>
                    <li>• Property sourcing and due diligence</li>
                    <li>• Investment opportunity matching</li>
                    <li>• Property management coordination</li>
                    <li>• Rental income distribution</li>
                  </ul>
                </div>
                <div className='rounded-lg border border-slate-200 p-4'>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    What We Don't Provide
                  </h4>
                  <ul className='space-y-1 text-sm text-slate-600'>
                    <li>• Investment advice or recommendations</li>
                    <li>• Guaranteed returns or profits</li>
                    <li>• Insurance against losses</li>
                    <li>• Legal or tax advice</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5 text-purple-600' />
                Investment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='mb-2 font-semibold text-slate-900'>
                  Eligibility Requirements
                </h4>
                <ul className='ml-4 list-inside list-disc space-y-1 text-slate-600'>
                  <li>
                    Must be an accredited investor or meet platform-specific
                    criteria
                  </li>
                  <li>
                    Complete identity verification and financial assessment
                  </li>
                  <li>Receive and accept an invitation to join the platform</li>
                  <li>
                    Agree to minimum investment amounts and holding periods
                  </li>
                </ul>
              </div>

              <div>
                <h4 className='mb-2 font-semibold text-slate-900'>
                  Investment Process
                </h4>
                <div className='grid gap-3 sm:grid-cols-3'>
                  <div className='rounded-lg bg-slate-50 p-3 text-center'>
                    <div className='mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100'>
                      <span className='text-sm font-semibold text-emerald-600'>
                        1
                      </span>
                    </div>
                    <p className='text-sm font-medium'>Application Review</p>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 text-center'>
                    <div className='mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100'>
                      <span className='text-sm font-semibold text-emerald-600'>
                        2
                      </span>
                    </div>
                    <p className='text-sm font-medium'>Property Selection</p>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 text-center'>
                    <div className='mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100'>
                      <span className='text-sm font-semibold text-emerald-600'>
                        3
                      </span>
                    </div>
                    <p className='text-sm font-medium'>Investment Execution</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risks and Disclaimers */}
          <Card className='border-red-200 bg-red-50/50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-red-800'>
                <AlertTriangle className='h-5 w-5' />
                Risks and Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-red-700'>
                Real estate investments carry inherent risks. You should
                carefully consider these risks before making any investment
                decisions.
              </p>

              <div className='space-y-3'>
                <div>
                  <h4 className='mb-1 font-semibold text-red-800'>
                    Market Risks
                  </h4>
                  <p className='text-sm text-red-700'>
                    Property values may decrease, rental income may fluctuate,
                    and market conditions may change.
                  </p>
                </div>
                <div>
                  <h4 className='mb-1 font-semibold text-red-800'>
                    Liquidity Risks
                  </h4>
                  <p className='text-sm text-red-700'>
                    Real estate investments are typically illiquid and may be
                    difficult to sell quickly.
                  </p>
                </div>
                <div>
                  <h4 className='mb-1 font-semibold text-red-800'>
                    Platform Risks
                  </h4>
                  <p className='text-sm text-red-700'>
                    Technology failures, regulatory changes, or business
                    disruptions may affect your investments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
              <CardDescription>
                Your obligations when using our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Account Management
                  </h4>
                  <ul className='space-y-1 text-sm text-slate-600'>
                    <li>• Keep login credentials secure</li>
                    <li>• Update personal information promptly</li>
                    <li>• Report suspicious activity immediately</li>
                    <li>• Use platform only for intended purposes</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    Compliance
                  </h4>
                  <ul className='space-y-1 text-sm text-slate-600'>
                    <li>• Follow all applicable laws and regulations</li>
                    <li>• Provide accurate financial information</li>
                    <li>• Respect intellectual property rights</li>
                    <li>• Maintain confidentiality of platform information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-slate-600' />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-slate-600'>
                VESTAFI's liability is limited to the maximum extent permitted
                by law. We are not liable for:
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1 text-slate-600'>
                <li>Investment losses or poor performance of properties</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Actions of third-party service providers</li>
                <li>Technical issues or platform downtime</li>
                <li>Changes in laws or regulations affecting investments</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-slate-600'>
                Either party may terminate this agreement under certain
                circumstances:
              </p>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    You May Terminate
                  </h4>
                  <ul className='space-y-1 text-sm text-slate-600'>
                    <li>• At any time with proper notice</li>
                    <li>• Subject to existing investment obligations</li>
                    <li>• Following platform procedures</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-slate-900'>
                    We May Terminate
                  </h4>
                  <ul className='space-y-1 text-sm text-slate-600'>
                    <li>• For violation of these terms</li>
                    <li>• For fraudulent or illegal activity</li>
                    <li>• For business or regulatory reasons</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className='border-emerald-200 bg-emerald-50/50'>
            <CardHeader>
              <CardTitle className='text-emerald-800'>
                Questions About These Terms?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='mb-4 text-emerald-700'>
                If you have any questions about these Terms of Service, please
                contact our legal team.
              </p>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <Link href={paths.support}>
                  <Button className='bg-emerald-600 hover:bg-emerald-700'>
                    Contact Legal Team
                  </Button>
                </Link>
                <Link href='/legal/privacy'>
                  <Button
                    variant='outline'
                    className='border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  >
                    View Privacy Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-8' />

        {/* Footer */}
        <div className='text-center text-sm text-slate-500'>
          <p>
            By using VESTAFI, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
