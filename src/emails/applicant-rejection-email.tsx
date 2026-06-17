/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { appConfig } from '@/config/app';

interface ApplicantRejectionEmailProps {
  logoUrl?: string;
  supportEmail?: string;
  companyName?: string;
  recipientName?: string;
}

export const ApplicantRejectionEmail = ({
  logoUrl = `${appConfig.appUrl}${appConfig.logo}`,
  supportEmail = appConfig.emails.support,
  companyName = appConfig.title,
  recipientName,
}: ApplicantRejectionEmailProps) => {
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
                      color: '#1f2937',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Thank You for Your Interest
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#6b7280',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    {recipientName
                      ? `Dear ${recipientName},`
                      : 'Dear Applicant,'}
                  </p>

                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '12px',
                      padding: '25px',
                      margin: '20px 0',
                      borderLeft: '4px solid #f59e0b',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#92400e',
                        margin: '0 0 15px 0',
                        fontWeight: '600',
                      }}
                    >
                      We appreciate you taking the time to apply to{' '}
                      {companyName}.
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#78350f',
                        margin: '0',
                      }}
                    >
                      After careful review, we are unable to proceed with your
                      application at this time. Our membership requirements are
                      designed to ensure the best experience for all members of
                      our community.
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
                      We encourage you to reach out again in the future as your
                      circumstances change. We're always looking for passionate
                      individuals who align with our mission.
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
                    If you have any questions about this decision or would like
                    to learn more about {companyName}, please don't hesitate to
                    contact us at{' '}
                    <a
                      href={`mailto:${supportEmail}`}
                      style={{ color: '#10b981', textDecoration: 'none' }}
                    >
                      {supportEmail}
                    </a>
                    .
                  </p>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginTop: '20px',
                      lineHeight: '1.5',
                    }}
                  >
                    Thank you again for your interest in {companyName}.
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

export default ApplicantRejectionEmail;
