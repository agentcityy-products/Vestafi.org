/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { appConfig } from '@/config/app';

interface ApplicantInviteEmailProps {
  logoUrl?: string;
  supportEmail?: string;
  companyName?: string;
  recipientName: string;
  loginUrl?: string;
}

export const ApplicantInviteEmail = ({
  logoUrl = `${appConfig.appUrl}${appConfig.logo}`,
  supportEmail = appConfig.emails.support,
  companyName = appConfig.title,
  recipientName,
  loginUrl = appConfig.appUrl,
}: ApplicantInviteEmailProps) => {
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
                    Welcome to {companyName}!
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#047857',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Congratulations {recipientName}, your application has been
                    approved!
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
                      🎉 Your application impressed our team and we're excited
                      to have you join our exclusive community of real estate
                      co-owners.
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#047857',
                        margin: '0',
                      }}
                    >
                      <strong>
                        You can now access the platform and start exploring
                        saving opportunities.
                      </strong>{' '}
                      Browse available properties, connect with other members,
                      and begin your journey in real estate co-ownership.
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
                      What's next?
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
                        Access your dashboard and complete your profile
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        Explore current apartment property opportunities
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        Connect with our community of co-owners
                      </li>
                      <li>
                        Start your first apartmentco-ownership experience.
                      </li>
                    </ul>
                  </div>

                  <div style={{ margin: '30px 0' }}>
                    <a
                      href={loginUrl}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'inline-block',
                      }}
                    >
                      Access Your Account
                    </a>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginTop: '30px',
                      lineHeight: '1.5',
                    }}
                  >
                    Welcome to the future of apartment co-ownership in Uganda.
                    If you have any questions or need assistance getting
                    started, please don't hesitate to contact us at{' '}
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

export default ApplicantInviteEmail;
