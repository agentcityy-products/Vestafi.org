'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  applicationFormSchema,
  type ApplicationFormValues,
} from '@/schema/applications';
import { submitApplication } from '@/actions/applications';

import { Form } from '@/components/ui/form';

import { onError } from '@/lib/show-error-toast';

import { BehaviorTrustStep } from './steps/behavior-trust-step';
import { FinancialIdentityStep } from './steps/financial-identity-step';
import { GoalsMindsetStep } from './steps/goals-mindset-step';
import { IntroStep } from './steps/intro-step';
import { PersonalInfoStep } from './steps/personal-info-step';
import { RejectionScreen } from './steps/rejection-screen';
import { SubmittedScreen } from './steps/submitted-screen';

type FormStep =
  | 'intro'
  | 'personal-info'
  | 'financial-identity'
  | 'goals-mindset'
  | 'behavior-trust'
  | 'rejected'
  | 'submitted';

interface ApplicationFormProps {
  initialReferralCode?: string | null;
}

export const ApplicationForm = ({
  initialReferralCode,
}: ApplicationFormProps) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('intro');
  const [submittedCategory, setSubmittedCategory] = useState<
    number | undefined
  >();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      phone_country_code: 'UG',
      country: 'Uganda',
      age_range: '',
      monthly_income: '',
      contribution_capacity: '',
      contribution_frequency: '',
      goals: [],
      preferred_ownership_path: '',
      investment_timeline: '',
      webinar_willing: undefined,
      joining_as: '',
      referral_source: '',
      referred_by: initialReferralCode || '',
    },
  });

  // Custom error handler for application submission
  const handleSubmissionError = (args: Parameters<typeof onError>[0]) => {
    const { error } = args;

    const errorMessage = error.serverError || '';

    // Check for already approved application
    const isAlreadyApproved =
      errorMessage.includes('APPLICATION_ALREADY_APPROVED') ||
      errorMessage.toLowerCase().includes('already been approved');

    if (isAlreadyApproved) {
      toast.error('Application Already Approved', {
        description:
          'This email address has already been approved. You cannot resubmit an application that has already been approved. If you need assistance, please contact support.',
        duration: 6000,
      });
      return;
    }

    // Check for duplicate email error
    const isDuplicateEmail =
      errorMessage.toLowerCase().includes('duplicate key') ||
      errorMessage.toLowerCase().includes('unique constraint') ||
      errorMessage.toLowerCase().includes('already exists') ||
      errorMessage.includes('23505') || // PostgreSQL unique violation error code
      (errorMessage.toLowerCase().includes('email') &&
        (errorMessage.toLowerCase().includes('unique') ||
          errorMessage.toLowerCase().includes('duplicate')));

    if (isDuplicateEmail) {
      toast.error('Email Already Used', {
        description:
          'This email address has already been used to submit an application. Please use a different email address or contact support if you believe this is an error.',
        duration: 6000,
      });
    } else {
      // Use default error handler for other errors
      onError(args);
    }
  };

  // Submit application action
  const { execute: submit, isExecuting: isSubmitting } = useAction(
    submitApplication,
    {
      onSuccess: ({ data }) => {
        console.log('Submission success data:', data); // Debug log
        const submission = data as
          | { rejected?: boolean; category?: string | number }
          | undefined;
        if (submission?.rejected) {
          setCurrentStep('rejected');
        } else {
          // Ensure category is a number
          const category = submission?.category
            ? typeof submission.category === 'string'
              ? parseInt(submission.category, 10)
              : submission.category
            : undefined;
          console.log('Setting category:', category); // Debug log
          setSubmittedCategory(category);
          setCurrentStep('submitted');
          toast.success('Application submitted successfully!', {
            description:
              "We'll review your application and get back to you within 24 hours.",
          });
        }
      },
      onError: handleSubmissionError,
    },
  );

  const handleSectionComplete = (
    nextStep: FormStep,
    _sectionData: Partial<ApplicationFormValues>,
  ) => {
    setCurrentStep(nextStep);
  };

  // Navigation handlers
  const handleNext = () => {
    const currentValues = form.getValues();

    // Validate current step before proceeding
    let isValid = true;
    let nextStep: FormStep = 'intro';

    switch (currentStep) {
      case 'intro':
        nextStep = 'personal-info';
        break;
      case 'personal-info':
        // Validate personal info fields
        isValid =
          !!currentValues.full_name &&
          !!currentValues.email &&
          !!currentValues.phone &&
          !!currentValues.country &&
          !!currentValues.age_range;
        if (isValid) {
          handleSectionComplete('financial-identity', {
            full_name: currentValues.full_name,
            phone: currentValues.phone,
            phone_country_code: currentValues.phone_country_code,
            country: currentValues.country,
            age_range: currentValues.age_range,
          });
          return;
        }
        break;
      case 'financial-identity':
        // Validate financial identity
        isValid =
          !!currentValues.monthly_income &&
          !!currentValues.contribution_capacity &&
          !!currentValues.contribution_frequency;
        if (isValid) {
          handleSectionComplete('goals-mindset', {
            monthly_income: currentValues.monthly_income,
            contribution_capacity: currentValues.contribution_capacity,
            contribution_frequency: currentValues.contribution_frequency,
          });
          return;
        }
        break;
      case 'goals-mindset':
        // Validate goals & mindset
        isValid =
          !!currentValues.goals?.length &&
          !!currentValues.preferred_ownership_path &&
          !!currentValues.investment_timeline;
        if (isValid) {
          handleSectionComplete('behavior-trust', {
            goals: currentValues.goals,
            preferred_ownership_path: currentValues.preferred_ownership_path,
            investment_timeline: currentValues.investment_timeline,
          });
          return;
        }
        break;
      case 'behavior-trust':
        // Validate behavior & trust
        isValid =
          currentValues.webinar_willing !== undefined &&
          !!currentValues.joining_as &&
          !!currentValues.referral_source;
        if (isValid) {
          // Submit the application
          form.handleSubmit((data) => {
            submit(data);
          })();
          return;
        }
        break;
    }

    if (isValid) {
      setCurrentStep(nextStep);
    } else {
      // Trigger validation
      form.trigger();
    }
  };

  const handleReject = () => {
    const formData = form.getValues();

    if (formData.email) {
      // Use the actual contribution_capacity from form (should be 'below-1m' for Category 1)
      const contributionCapacity = formData.contribution_capacity || 'below-1m';

      // Create a minimal submission that will trigger rejection
      // Use defaults for missing required fields to pass validation
      const minimalData: ApplicationFormValues = {
        email: formData.email,
        full_name: formData.full_name || 'N/A',
        phone: formData.phone || 'N/A',
        phone_country_code: formData.phone_country_code || 'UG',
        country: formData.country || 'Uganda',
        age_range: formData.age_range || '18-24',
        monthly_income: formData.monthly_income || 'below-1m',
        contribution_capacity: contributionCapacity,
        contribution_frequency:
          formData.contribution_frequency || 'monthly-consistency',
        goals: ['rental-income'], // Default value to pass validation
        preferred_ownership_path: 'fractional',
        investment_timeline: '6-months', // Default value
        webinar_willing: false, // Default value
        joining_as: 'individual', // Default value
        referral_source: 'other', // Default value
      };

      // Submit without triggering form validation - bypass react-hook-form validation
      submit(minimalData);
    } else {
      // If no email, just show rejection screen
      setCurrentStep('rejected');
    }
  };

  // Render based on current step
  if (currentStep === 'rejected') {
    return <RejectionScreen />;
  }

  if (currentStep === 'submitted') {
    return <SubmittedScreen category={submittedCategory} />;
  }

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => submit(data))}>
          {currentStep === 'intro' && <IntroStep onNext={handleNext} />}

          {currentStep === 'personal-info' && (
            <PersonalInfoStep onNext={handleNext} />
          )}

          {currentStep === 'financial-identity' && (
            <FinancialIdentityStep
              onNext={handleNext}
              onReject={handleReject}
            />
          )}

          {currentStep === 'goals-mindset' && (
            <GoalsMindsetStep onNext={handleNext} />
          )}

          {currentStep === 'behavior-trust' && (
            <BehaviorTrustStep
              onNext={handleNext}
              isSubmitting={isSubmitting}
            />
          )}
        </form>
      </Form>
    </div>
  );
};
