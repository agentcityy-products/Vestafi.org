/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

interface AdminInvestmentNotificationProps {
  investorName: string;
  investorEmail: string;
  investmentAmount: number;
  propertyTitle: string;
  propertyLocation: string;
  investmentDate: string;
  transactionId?: string;
}

export const AdminInvestmentNotification = ({
  investorName,
  investorEmail,
  investmentAmount,
  propertyTitle,
  propertyLocation,
  investmentDate,
  transactionId,
}: AdminInvestmentNotificationProps) => {
  const dashboardUrl = `${appConfig.appUrl}${paths.admin.pendingInvestments}`;

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
                    src={`${appConfig.appUrl}${appConfig.logo}`}
                    alt={`${appConfig.title} Logo`}
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
                      color: '#dc2626',
                      margin: '0 0 10px 0',
                    }}
                  >
                    🚨 New Contribution Alert
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#dc2626',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    A new property contribution requires your review
                  </p>

                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      borderRadius: '12px',
                      padding: '25px',
                      margin: '20px 0',
                      borderLeft: '4px solid #dc2626',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '20px',
                        color: '#991b1b',
                        margin: '0 0 20px 0',
                        fontWeight: '600',
                      }}
                    >
                      Contribution Details
                    </h2>

                    <table width='100%' style={{ borderCollapse: 'collapse' }}>
                      <tr>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Contributor:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#991b1b',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {investorName}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Email:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#991b1b',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          <a
                            href={`mailto:${investorEmail}`}
                            style={{ color: '#991b1b', textDecoration: 'none' }}
                          >
                            {investorEmail}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Property:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#991b1b',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {propertyTitle}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Location:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#991b1b',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {propertyLocation}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Contribution Amount:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '20px',
                            color: '#991b1b',
                            fontWeight: 'bold',
                            textAlign: 'right',
                          }}
                        >
                          {formatCurrency(investmentAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Date Submitted:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#991b1b',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {investmentDate}
                        </td>
                      </tr>
                      {transactionId && (
                        <tr>
                          <td
                            style={{
                              padding: '8px 0',
                              fontSize: '14px',
                              color: '#6b7280',
                              fontWeight: '500',
                            }}
                          >
                            Reference ID:
                          </td>
                          <td
                            style={{
                              padding: '8px 0',
                              fontSize: '12px',
                              color: '#991b1b',
                              fontWeight: '600',
                              textAlign: 'right',
                              fontFamily: 'monospace',
                            }}
                          >
                            {transactionId}
                          </td>
                        </tr>
                      )}
                    </table>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      padding: '20px',
                      margin: '20px 0',
                      borderLeft: '4px solid #f59e0b',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '16px',
                        color: '#92400e',
                        margin: '0 0 10px 0',
                        fontWeight: '600',
                      }}
                    >
                      Action Required
                    </h3>
                    <ul
                      style={{
                        fontSize: '14px',
                        color: '#92400e',
                        margin: '0 0 15px 0',
                        paddingLeft: '20px',
                      }}
                    >
                      <li style={{ marginBottom: '5px' }}>
                        Review the payment proof images uploaded by the
                        contributor
                      </li>
                      <li style={{ marginBottom: '5px' }}>
                        Verify the payment amount matches the contribution
                      </li>
                      <li style={{ marginBottom: '5px' }}>
                        Approve or reject the contribution within 24-48 hours
                      </li>
                      <li>
                        Send confirmation email to the contributor once
                        processed
                      </li>
                    </ul>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <a
                        href={dashboardUrl}
                        style={{
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          padding: '12px 24px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'inline-block',
                        }}
                      >
                        Review Contribution →
                      </a>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      padding: '15px',
                      margin: '20px 0',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#374151',
                        margin: '0',
                        fontWeight: '500',
                      }}
                    >
                      ⏰ <strong>Reminder:</strong> Contributors expect feedback
                      within 24-48 hours. Quick responses improve customer
                      satisfaction and trust.
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
                    This is an automated notification from {appConfig.title}.
                    For technical support, contact{' '}
                    <a
                      href={`mailto:${appConfig.emails.support}`}
                      style={{ color: '#dc2626', textDecoration: 'none' }}
                    >
                      {appConfig.emails.support}
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
                    © 2025 {appConfig.title} | Admin Dashboard
                  </p>
                  <p style={{ margin: '5px 0 0 0' }}>
                    Contribution Management System
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

export default AdminInvestmentNotification;
