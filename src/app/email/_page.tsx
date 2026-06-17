import React from 'react';

import { AdminApplicationNotification } from '@/emails/admin-application-notification';
import { AdminInvestmentNotification } from '@/emails/admin-investment-notification';
import { AdminWithdrawalNotification } from '@/emails/admin-withdrawal-notification';
import { ApplicantInviteEmail } from '@/emails/applicant-invite-email';
import { ApplicantSubmitEmail } from '@/emails/applicant-submit-email';
import { InvestmentApprovedEmail } from '@/emails/investment-approved-email';
import { InvestmentConfirmationEmail } from '@/emails/investment-confirmation-email';
import { InvestmentRejectedEmail } from '@/emails/investment-rejected-email';
import { WithdrawalPaidNotification } from '@/emails/withdrawal-paid-notification';
import { WithdrawalRejectedNotification } from '@/emails/withdrawal-rejected-notification';
import { WithdrawalRequestConfirmation } from '@/emails/withdrawal-request-confirmation';

const EmailsPreviewPage = () => {
  return (
    <div className='container mx-auto flex w-full flex-col gap-8 bg-primary/5 p-6'>
      <h1 className='mb-8 text-center text-3xl font-bold'>
        Email Templates Preview
      </h1>

      <div className='space-y-8'>
        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Applicant Submission Confirmation
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to applicants immediately after they submit their application
          </p>
          <ApplicantSubmitEmail />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Admin Application Notification
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to administrators when a new application is submitted
          </p>
          <AdminApplicationNotification
            applicationData={{
              email: 'test@test.com',
              full_name: 'Test User',
              phone: '+256782123456',
              phone_country_code: 'UG',
              country: 'Uganda',
              savings: 'yes_save_more',
              why_vestafi: ['feels_different', 'silent_wealth'],
              age_range: '18-24',
              monthly_income: '1000000',
              contribution_capacity: '1000000',
              contribution_frequency: 'monthly',
              goals: ['investment', 'passive_income'],
              investment_timeline: '10 years',
              joining_as: 'individual',
              referral_source: 'friend',
              referred_by: 'test@test.com',
              webinar_willing: true,
            }}
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Applicant Invitation
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to invite new users to join the platform
          </p>
          <ApplicantInviteEmail recipientName='Test User' />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Contribution Confirmation
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to contributors immediately after they make a contribution
          </p>
          <InvestmentConfirmationEmail
            recipientName='Test User'
            investmentAmount={1000000}
            propertyTitle='Test Property'
            propertyLocation='Kampala'
            investmentDate={new Date().toISOString()}
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Admin Contribution Notification
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to administrators when a new contribution is made
          </p>
          <AdminInvestmentNotification
            investmentDate={new Date().toISOString()}
            investorName='Test User'
            investorEmail='test@test.com'
            investmentAmount={1000000}
            propertyTitle='Test Property'
            propertyLocation='Kampala'
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Contribution Approved
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to investors when their contribution is approved by
            administrators
          </p>
          <InvestmentApprovedEmail
            recipientName='Test User'
            investmentAmount={1000000}
            propertyTitle='Test Property'
            propertyLocation='Kampala'
            transactionId='1234567890'
            investmentDate={new Date().toISOString()}
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Contribution Rejected
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to investors when their contribution is rejected by
            administrators
          </p>
          <InvestmentRejectedEmail
            recipientName='Test User'
            investmentAmount={1000000}
            propertyTitle='Test Property'
            propertyLocation='Kampala'
            transactionId='1234567890'
            submissionDate={new Date().toISOString()}
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Withdrawal Request Confirmation
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to users immediately after they submit a withdrawal request
          </p>
          <WithdrawalRequestConfirmation
            recipientName='Test User'
            withdrawalAmount={500000}
            requestDate={new Date().toISOString()}
            requestId='WD-1234567890'
            bankAccount='**** **** **** 1234'
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Admin Withdrawal Notification
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to administrators when a new withdrawal request is created
          </p>
          <AdminWithdrawalNotification
            requestDate={new Date().toISOString()}
            userEmail='test@test.com'
            userName='Test User'
            withdrawalAmount={500000}
            requestId='WD-1234567890'
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Withdrawal Paid Notification
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to users when their withdrawal request is marked as paid
          </p>
          <WithdrawalPaidNotification
            recipientName='Test User'
            withdrawalAmount={500000}
            requestId='WD-1234567890'
            paidDate={new Date().toISOString()}
            bankAccount='**** **** **** 1234'
            transactionReference='TXN-9876543210'
          />
        </div>

        <div className='text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            Withdrawal Rejected Notification
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            Sent to users when their withdrawal request is rejected
          </p>
          <WithdrawalRejectedNotification
            recipientName='Test User'
            withdrawalAmount={500000}
            requestId='WD-1234567890'
            rejectedDate={new Date().toISOString()}
            reason='Insufficient account balance or invalid bank account details provided.'
            bankAccount='**** **** **** 1234'
          />
        </div>
      </div>
    </div>
  );
};

export default EmailsPreviewPage;
