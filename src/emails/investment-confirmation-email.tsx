/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';

interface InvestmentConfirmationEmailProps {
  recipientName: string;
  investmentAmount: number;
  propertyTitle: string;
  propertyLocation: string;
  investmentDate: string;
  transactionId?: string;
}

export const InvestmentConfirmationEmail = ({
  recipientName,
  investmentAmount,
  propertyTitle,
  propertyLocation,
  investmentDate,
  transactionId,
}: InvestmentConfirmationEmailProps) => {
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
                  <p
                    style={{
                      fontSize: '16px',
                      color: '#047857',
                      margin: '0 0 20px 0',
                      fontWeight: '500',
                    }}
                  >
                    Thank you. Your stake in {propertyTitle} has been
                    registered.
                  </p>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#065f46',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Contribution Submitted
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#047857',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Hi {recipientName}, thank you for your contribution!
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
                    <h2
                      style={{
                        fontSize: '20px',
                        color: '#065f46',
                        margin: '0 0 20px 0',
                        fontWeight: '600',
                      }}
                    >
                      Contribution Receipt
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
                            color: '#065f46',
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
                            color: '#065f46',
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
                            color: '#065f46',
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
                            color: '#065f46',
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
                              color: '#065f46',
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
                      What happens next?
                    </h3>
                    <ul
                      style={{
                        fontSize: '14px',
                        color: '#92400e',
                        margin: '0',
                        paddingLeft: '20px',
                      }}
                    >
                      <li style={{ marginBottom: '5px' }}>
                        Our admin team will review your payment proof within
                        24-48 hours
                      </li>
                      <li style={{ marginBottom: '5px' }}>
                        Once approved, your contribution will be confirmed and
                        allocated to this apartment.
                      </li>
                      <li style={{ marginBottom: '5px' }}>
                        Returns start as soon as this apartment reaches full
                        funding and is activated.
                      </li>
                      <li>
                        You can view your stake and monthly income on your
                        VESTAFI dashboard.
                      </li>
                    </ul>
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
                      💡 <strong>Pro tip:</strong> Log in to your VESTAFI
                      dashboard to view your contribution portfolio and track
                      monthly rent returns.
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
                    If you have any questions, please contact us at{' '}
                    <a
                      href={`mailto:${appConfig.emails.support}`}
                      style={{ color: '#10b981', textDecoration: 'none' }}
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
                    © 2025 VESTAFI – Building the future of property income in
                    Uganda.
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

export default InvestmentConfirmationEmail;
