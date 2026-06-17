/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

interface InvestmentRejectedEmailProps {
  recipientName: string;
  investmentAmount: number;
  propertyTitle: string;
  propertyLocation: string;
  submissionDate: string;
  rejectionReason?: string;
  transactionId: string;
}

export const InvestmentRejectedEmail = ({
  recipientName,
  investmentAmount,
  propertyTitle,
  propertyLocation,
  submissionDate,
  rejectionReason,
  transactionId,
}: InvestmentRejectedEmailProps) => {
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
                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      borderRadius: '50px',
                      display: 'inline-block',
                      padding: '8px 16px',
                      marginBottom: '20px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '20px',
                        margin: '0 8px',
                      }}
                    >
                      ⚠️
                    </span>
                    <span
                      style={{
                        color: '#dc2626',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      CONTRIBUTION NOT APPROVED
                    </span>
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#991b1b',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Contribution Update
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#7f1d1d',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Hi {recipientName}, we regret to inform you that your
                    contribution submission could not be approved at this time.
                  </p>

                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      borderRadius: '12px',
                      padding: '25px',
                      margin: '20px 0',
                      borderLeft: '4px solid #ef4444',
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
                            fontSize: '18px',
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
                          Date Contributed:
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
                          {submissionDate}
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
                          Transaction ID:
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
                    </table>
                  </div>

                  {rejectionReason && (
                    <div
                      style={{
                        backgroundColor: '#fef2f2',
                        borderRadius: '12px',
                        padding: '20px',
                        margin: '20px 0',
                        border: '1px solid #fecaca',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '16px',
                          color: '#991b1b',
                          margin: '0 0 10px 0',
                          fontWeight: '600',
                        }}
                      >
                        Reason for rejection:
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#7f1d1d',
                          margin: '0',
                          textAlign: 'left',
                        }}
                      >
                        {rejectionReason}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      borderRadius: '12px',
                      padding: '20px',
                      margin: '20px 0',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '16px',
                        color: '#92400e',
                        margin: '0 0 15px 0',
                        fontWeight: '600',
                      }}
                    >
                      What can you do next?
                    </h3>
                    <ul
                      style={{
                        textAlign: 'left',
                        margin: '0',
                        paddingLeft: '20px',
                        color: '#92400e',
                      }}
                    >
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Review our contribution guidelines and requirements
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Contact our support team if you need clarification
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Submit a new contribution application with corrected
                        information
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Explore other available contribution opportunities
                      </li>
                    </ul>
                  </div>

                  <div style={{ margin: '30px 0' }}>
                    <a
                      href={`${appConfig.appUrl}${paths.listings.list}`}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '16px',
                        marginRight: '10px',
                      }}
                    >
                      Browse Properties
                    </a>
                    <a
                      href={paths.support}
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '16px',
                        border: '2px solid #dc2626',
                      }}
                    >
                      Contact Support
                    </a>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '30px 0 20px 0',
                    }}
                  >
                    We appreciate your interest in {appConfig.title} and
                    encourage you to explore other contribution opportunities.
                    <br />
                    Our team is here to help you succeed in your contribution
                    journey.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '20px 40px',
                    backgroundColor: '#f9f9f9',
                    textAlign: 'center',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: '0 0 10px 0',
                    }}
                  >
                    {appConfig.title} - Making Real Estate Contribution
                    Accessible
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: '0',
                    }}
                  >
                    If you have any questions, contact us at{' '}
                    <a
                      href={paths.support}
                      style={{ color: '#dc2626', textDecoration: 'none' }}
                    >
                      {appConfig.emails.support}
                    </a>
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
