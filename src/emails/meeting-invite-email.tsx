/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { appConfig } from '@/config/app';

interface MeetingInviteEmailProps {
  logoUrl?: string;
  supportEmail?: string;
  companyName?: string;
  recipientName?: string;
  calendlyUrl?: string;
  phoneNumber?: string;
}

export const MeetingInviteEmail = ({
  logoUrl = `${appConfig.appUrl}${appConfig.logo}`,
  supportEmail = appConfig.emails.support,
  companyName = appConfig.title,
  recipientName = '',
  calendlyUrl = 'https://calendly.com/vestafi/30min',
  phoneNumber = '+256784741443',
}: MeetingInviteEmailProps) => {
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
                <td style={{ padding: '20px 40px', textAlign: 'left' }}>
                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#065f46',
                      margin: '0 0 20px 0',
                      textAlign: 'center',
                    }}
                  >
                    Your {companyName} Application - Next Steps
                  </h1>

                  <p
                    style={{
                      fontSize: '16px',
                      color: '#374151',
                      margin: '0 0 20px 0',
                      lineHeight: '1.6',
                    }}
                  >
                    Hello{recipientName ? ` ${recipientName}` : ''},
                  </p>

                  <p
                    style={{
                      fontSize: '16px',
                      color: '#374151',
                      margin: '0 0 20px 0',
                      lineHeight: '1.6',
                    }}
                  >
                    Thank you for your application to {companyName}. We've
                    received your information and are ready to proceed with the
                    next step in our process.
                  </p>

                  <div
                    style={{
                      backgroundColor: '#ecfdf5',
                      borderRadius: '12px',
                      padding: '25px',
                      margin: '25px 0',
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
                      To complete your application, we need to schedule a brief
                      consultation call.
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#047857',
                        margin: '0',
                      }}
                    >
                      This allows us to review your application details and
                      answer any questions you may have about our platform.
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: '16px',
                      color: '#374151',
                      margin: '0 0 20px 0',
                      lineHeight: '1.6',
                    }}
                  >
                    Please use the link below to schedule a 15-minute call at
                    your convenience. The system will send you a calendar
                    reminder once booked.
                  </p>

                  <div style={{ margin: '30px 0', textAlign: 'center' }}>
                    <a
                      href={calendlyUrl}
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
                      Schedule Your Call
                    </a>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      padding: '20px',
                      margin: '25px 0',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#065f46',
                        margin: '0 0 10px 0',
                        fontWeight: '600',
                      }}
                    >
                      📞 This is a brief 15-minute application review call.
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#047857',
                        margin: '0',
                      }}
                    >
                      Please schedule within the next 7 days to keep your
                      application active.
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: '16px',
                      color: '#374151',
                      margin: '30px 0 10px 0',
                      lineHeight: '1.6',
                    }}
                  >
                    Thank you for your interest in {companyName}.
                  </p>

                  <div
                    style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#065f46',
                        margin: '0 0 5px 0',
                        fontWeight: '600',
                      }}
                    >
                      Hakiza
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#047857',
                        margin: '0 0 5px 0',
                        fontWeight: '500',
                      }}
                    >
                      {companyName}
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0',
                      }}
                    >
                      <a
                        href={`tel:${phoneNumber}`}
                        style={{ color: '#10b981', textDecoration: 'none' }}
                      >
                        {phoneNumber}
                      </a>
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginTop: '30px',
                      lineHeight: '1.5',
                      textAlign: 'center',
                    }}
                  >
                    If you have any questions, please contact us at{' '}
                    <a
                      href={`mailto:${supportEmail}`}
                      style={{ color: '#10b981', textDecoration: 'none' }}
                    >
                      {supportEmail}
                    </a>
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

export default MeetingInviteEmail;
