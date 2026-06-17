/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { appConfig } from '@/config/app';

interface ApplicantEliteCircleCallEmailProps {
  logoUrl?: string;
  supportEmail?: string;
  companyName?: string;
  recipientName?: string;
}

export const ApplicantEliteCircleCallEmail = ({
  logoUrl = `${appConfig.appUrl}${appConfig.logo}`,
  supportEmail = appConfig.emails.support,
  companyName = appConfig.title,
  recipientName,
}: ApplicantEliteCircleCallEmailProps) => {
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
                    Welcome to the Elite Circle
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#047857',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    {recipientName
                      ? `Dear ${recipientName},`
                      : 'Dear Elite Circle Candidate,'}
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
                      🎉 Congratulations! Your application has been accepted
                      into the {companyName} Elite Circle.
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#047857',
                        margin: '0',
                      }}
                    >
                      A member of our team will contact you shortly to schedule
                      a personalized onboarding call. This call will help us
                      understand your investment goals and ensure you get the
                      most out of your Elite Circle membership.
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      padding: '20px',
                      margin: '20px 0',
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
                      What to Expect:
                    </p>
                    <ul
                      style={{
                        fontSize: '14px',
                        color: '#047857',
                        margin: '0',
                        paddingLeft: '20px',
                        textAlign: 'left',
                      }}
                    >
                      <li style={{ marginBottom: '8px' }}>
                        A personalized 30-45 minute onboarding call
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        Direct access to our premium investment opportunities
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        Entry into the House of Gold with Custodian rank
                      </li>
                      <li>Welcome privileges and exclusive benefits</li>
                    </ul>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      borderRadius: '8px',
                      padding: '15px',
                      margin: '20px 0',
                      borderLeft: '4px solid #f59e0b',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#92400e',
                        margin: '0',
                        fontWeight: '500',
                      }}
                    >
                      💡 <strong>Important:</strong> Your dashboard access will
                      be activated after the onboarding call is completed. We
                      look forward to speaking with you soon!
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
                    If you have any questions before the call, please don't
                    hesitate to contact us at{' '}
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

export default ApplicantEliteCircleCallEmail;
