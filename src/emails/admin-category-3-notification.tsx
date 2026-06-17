/* eslint-disable @next/next/no-img-element */
import React from 'react';

import type { ApplicationFormValues } from '@/schema/applications';
import {
  ageRangeOptions,
  contributionCapacityOptions,
  contributionFrequencyOptions,
  goalsOptions,
  investmentTimelineOptions,
  joiningAsOptions,
  monthlyIncomeOptions,
  referralSourceOptions,
} from '@/schema/applications';

import { appConfig } from '@/config/app';
import { getDialCodeFromCountryCode } from '@/constants/countries';

interface AdminCategory3NotificationProps {
  logoUrl?: string;
  companyName?: string;
  applicationData: ApplicationFormValues;
  category: number;
  submittedAt?: string;
}

export const AdminCategory3Notification = ({
  logoUrl = `${appConfig.appUrl}${appConfig.logo}`,
  companyName = appConfig.title,
  applicationData,
  category,
  submittedAt = new Date().toLocaleString(),
}: AdminCategory3NotificationProps) => {
  // Helper functions to get readable labels
  const getAgeRangeLabel = (value: string) => {
    return (
      ageRangeOptions.find((option) => option.value === value)?.label || value
    );
  };

  const getMonthlyIncomeLabel = (value: string) => {
    return (
      monthlyIncomeOptions.find((option) => option.value === value)?.label ||
      value
    );
  };

  const getContributionCapacityLabel = (value: string) => {
    return (
      contributionCapacityOptions.find((option) => option.value === value)
        ?.label || value
    );
  };

  const getContributionFrequencyLabel = (value: string) => {
    return (
      contributionFrequencyOptions.find((option) => option.value === value)
        ?.label || value
    );
  };

  const getGoalsLabels = (values: string[]) => {
    return values.map(
      (value) =>
        goalsOptions.find((option) => option.value === value)?.label || value,
    );
  };

  const getInvestmentTimelineLabel = (value: string) => {
    return (
      investmentTimelineOptions.find((option) => option.value === value)
        ?.label || value
    );
  };

  const getJoiningAsLabel = (value: string) => {
    return (
      joiningAsOptions.find((option) => option.value === value)?.label || value
    );
  };

  const getReferralSourceLabel = (value: string) => {
    return (
      referralSourceOptions.find((option) => option.value === value)?.label ||
      value
    );
  };

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        color: '#333',
      }}
    >
      <table
        width='100%'
        cellPadding='0'
        cellSpacing='0'
        style={{ backgroundColor: '#f9f9f9', padding: '20px' }}
      >
        <tr>
          <td align='center'>
            <table
              width='600'
              cellPadding='0'
              cellSpacing='0'
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <tr>
                <td
                  style={{ padding: '20px 40px 0px 40px', textAlign: 'center' }}
                >
                  <img
                    src={logoUrl}
                    alt={`${companyName} Logo`}
                    style={{
                      width: '100px',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '20px 40px', textAlign: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      padding: '15px',
                      margin: '0 0 20px 0',
                      borderLeft: '4px solid #f59e0b',
                    }}
                  >
                    <h1
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#92400e',
                        margin: '0',
                      }}
                    >
                      🚨 Elite Circle Application - Category {category}
                    </h1>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 30px 0',
                    }}
                  >
                    Submitted on {submittedAt}
                  </p>

                  {/* Contact Information */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '20px',
                      margin: '20px 0',
                      borderLeft: '4px solid #3b82f6',
                      textAlign: 'left',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: '0 0 15px 0',
                      }}
                    >
                      Contact Information
                    </h2>
                    <table width='100%' cellPadding='5' cellSpacing='0'>
                      <tr>
                        <td
                          style={{
                            fontWeight: 'bold',
                            color: '#374151',
                            width: '30%',
                          }}
                        >
                          Name:
                        </td>
                        <td style={{ color: '#1f2937' }}>
                          {applicationData.full_name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: '#374151' }}>
                          Email:
                        </td>
                        <td style={{ color: '#1f2937' }}>
                          <a
                            href={`mailto:${applicationData.email}`}
                            style={{ color: '#3b82f6', textDecoration: 'none' }}
                          >
                            {applicationData.email}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: '#374151' }}>
                          Phone:
                        </td>
                        <td style={{ color: '#1f2937' }}>
                          {getDialCodeFromCountryCode(
                            applicationData.phone_country_code,
                          )}{' '}
                          {applicationData.phone}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: '#374151' }}>
                          Country:
                        </td>
                        <td style={{ color: '#1f2937' }}>
                          {applicationData.country}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: '#374151' }}>
                          Age Range:
                        </td>
                        <td style={{ color: '#1f2937' }}>
                          {getAgeRangeLabel(applicationData.age_range)}
                        </td>
                      </tr>
                    </table>
                  </div>

                  {/* Financial Information */}
                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      padding: '20px',
                      margin: '20px 0',
                      borderLeft: '4px solid #f59e0b',
                      textAlign: 'left',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: '0 0 15px 0',
                      }}
                    >
                      Financial Profile
                    </h2>
                    <div style={{ marginBottom: '15px' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Monthly Income:
                      </p>
                      <p style={{ color: '#1f2937', margin: '0' }}>
                        {getMonthlyIncomeLabel(applicationData.monthly_income)}
                      </p>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Contribution Capacity:
                      </p>
                      <p
                        style={{
                          color: '#1f2937',
                          margin: '0',
                          fontSize: '18px',
                          fontWeight: '600',
                        }}
                      >
                        {getContributionCapacityLabel(
                          applicationData.contribution_capacity,
                        )}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Contribution Frequency:
                      </p>
                      <p style={{ color: '#1f2937', margin: '0' }}>
                        {getContributionFrequencyLabel(
                          applicationData.contribution_frequency,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Goals & Mindset */}
                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      padding: '20px',
                      margin: '20px 0',
                      borderLeft: '4px solid #10b981',
                      textAlign: 'left',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: '0 0 15px 0',
                      }}
                    >
                      Goals & Investment Timeline
                    </h2>
                    <div style={{ marginBottom: '15px' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Goals:
                      </p>
                      <ul
                        style={{
                          color: '#1f2937',
                          margin: '0',
                          paddingLeft: '20px',
                        }}
                      >
                        {getGoalsLabels(applicationData.goals).map(
                          (goal, index) => (
                            <li key={index} style={{ marginBottom: '5px' }}>
                              {goal}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Investment Timeline:
                      </p>
                      <p style={{ color: '#1f2937', margin: '0' }}>
                        {getInvestmentTimelineLabel(
                          applicationData.investment_timeline,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Behavior & Trust */}
                  <div
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      padding: '20px',
                      margin: '20px 0',
                      textAlign: 'left',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: '0 0 15px 0',
                      }}
                    >
                      Additional Information
                    </h2>
                    <div style={{ marginBottom: '15px' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Webinar Willing:
                      </p>
                      <p style={{ color: '#1f2937', margin: '0' }}>
                        {applicationData.webinar_willing ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Joining As:
                      </p>
                      <p style={{ color: '#1f2937', margin: '0' }}>
                        {getJoiningAsLabel(applicationData.joining_as)}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 'bold',
                          color: '#374151',
                          margin: '0 0 5px 0',
                        }}
                      >
                        Referral Source:
                      </p>
                      <p style={{ color: '#1f2937', margin: '0' }}>
                        {getReferralSourceLabel(
                          applicationData.referral_source,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Action Required */}
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      borderRadius: '8px',
                      padding: '15px',
                      margin: '20px 0',
                      borderLeft: '4px solid #ef4444',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#991b1b',
                        margin: '0',
                        fontWeight: '600',
                      }}
                    >
                      ⚠️ <strong>Action Required:</strong> This is a Category{' '}
                      {category} (Elite Circle) candidate. Please follow up to
                      schedule an onboarding call within 24 hours.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '20px 40px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#9ca3af',
                    borderTop: '1px solid #f3f4f6',
                  }}
                >
                  <p style={{ margin: '0' }}>
                    © 2025 {companyName} | Admin Notification
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  );
};

export default AdminCategory3Notification;
