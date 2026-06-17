/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { appConfig } from '@/config/app';

interface ApplicantSubmitEmailProps {
  logoUrl?: string;
  supportEmail?: string;
  companyName?: string;
  responseTimeframe?: string;
  recipientName?: string;
}

export const ApplicantSubmitEmail = ({
  logoUrl = `${appConfig.appUrl}${appConfig.logo}`,
  supportEmail = appConfig.emails.support,
  companyName = appConfig.title,
  responseTimeframe = '24 hours',
}: ApplicantSubmitEmailProps) => {
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
                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#065f46',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Application Submitted
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#047857',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Thank you for your interest in {companyName}
                  </p>

                  <div
                    style={{
                      backgroundColor: '#ecfdf5',
                      borderRadius: '12px',
                      padding: '25px',
                      margin: '20px 0',
                      borderLeft: '4px solid #10b981',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#065f46',
                        margin: '0 0 15px 0',
                        fontWeight: '600',
                      }}
                    >
                      Your application has been received and a member of our
                      team will review your responses carefully.
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#047857',
                        margin: '0',
                      }}
                    >
                      <strong>
                        We'll get back to you within {responseTimeframe}.
                      </strong>{' '}
                      If your application aligns with what we're building, we'll
                      reach out to discuss next steps.
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      padding: '15px',
                      margin: '20px 0',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#065f46',
                        margin: '0',
                        fontWeight: '500',
                      }}
                    >
                      We're selective about who joins our community. If
                      selected, you'll know why.
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginTop: '30px',
                      lineHeight: '1.5',
                    }}
                  >
                    We don't spam, sell, or share your information. This is
                    exclusively for {companyName} circle communications. If you
                    have any questions, please contact us at{' '}
                    <a
                      href={`mailto:${supportEmail}`}
                      style={{ color: '#10b981', textDecoration: 'none' }}
                    >
                      {supportEmail}
                    </a>
                    .
                  </p>
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
                    © 2025 {companyName} | All Rights Reserved.
                  </p>
                  <p style={{ margin: '5px 0 0 0' }}>
                    Building the future of real estate co-ownership in Uganda
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

export default ApplicantSubmitEmail;
