/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

interface InvestmentApprovedEmailProps {
  recipientName: string;
  investmentAmount: number;
  propertyTitle: string;
  propertyLocation: string;
  investmentDate: string;
  transactionId: string;
}

export const InvestmentApprovedEmail = ({
  recipientName,
  investmentAmount,
  propertyTitle,
  propertyLocation,
  investmentDate,
  transactionId,
}: InvestmentApprovedEmailProps) => {
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
                      backgroundColor: '#dcfce7',
                      borderRadius: '50px',
                      display: 'inline-block',
                      padding: '8px 16px',
                      marginBottom: '20px',
                    }}
                  >
                    <span
                      style={{
                        color: '#16a34a',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      CONTRIBUTION APPROVED
                    </span>
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#15803d',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Congratulations!
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#047857',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Dear {recipientName},
                    <br />
                    Your contribution has been reviewed and approved. You are
                    now part of the circle building real estate income — one
                    apartment at a time.
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
                        color: '#15803d',
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
                          Unit:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#15803d',
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
                            color: '#15803d',
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
                            color: '#15803d',
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
                          Date Approved:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#15803d',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {investmentDate}
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
                            color: '#15803d',
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

                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '12px',
                      padding: '20px',
                      margin: '20px 0',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '16px',
                        color: '#15803d',
                        margin: '0 0 15px 0',
                        fontWeight: '600',
                      }}
                    >
                      What Happens Next?
                    </h3>
                    <ul
                      style={{
                        textAlign: 'left',
                        margin: '0',
                        paddingLeft: '20px',
                        color: '#166534',
                      }}
                    >
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Your contribution is now securely logged in our system
                        under this specific apartment unit.
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        You will begin receiving monthly updates on property
                        performance and the rental market.
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Returns start once this unit is fully funded and rental
                        income begins flowing in.
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        You can track your contribution and earnings via your
                        VESTAFI private dashboard.
                      </li>
                    </ul>
                  </div>

                  <div style={{ margin: '30px 0' }}>
                    <a
                      href={`${appConfig.appUrl}${paths.dashboard.root}`}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      View Dashboard
                    </a>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      padding: '16px',
                      margin: '25px 0',
                      border: '1px solid #fbbf24',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '16px',
                        color: '#92400e',
                        margin: '0 0 10px 0',
                        fontWeight: '600',
                        textAlign: 'left',
                      }}
                    >
                      Action Required:
                    </h4>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#92400e',
                        margin: '0',
                        fontWeight: '500',
                        textAlign: 'left',
                      }}
                    >
                      Please reply to this email confirming receipt. Your reply
                      will serve as your digital signature and acknowledgment of
                      this contribution receipt.
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      margin: '25px 0',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '16px',
                        color: '#475569',
                        margin: '0 0 10px 0',
                        fontWeight: '600',
                        textAlign: 'left',
                      }}
                    >
                      Legal & Custody Note:
                    </h4>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#475569',
                        margin: '0',
                        fontWeight: '400',
                        textAlign: 'left',
                        lineHeight: '1.5',
                      }}
                    >
                      The apartment unit you contributed toward is legally held
                      under Zenolius Holdings Ltd, our licensed asset management
                      partner. While you do not receive direct ownership, your
                      contribution entitles you to a monthly share of the income
                      generated from this unit — managed, maintained, and rented
                      under the VESTAFI structure.
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '30px 0 20px 0',
                    }}
                  >
                    Thank you for being part of a new class of real estate
                    wealth builders.
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
                    If you have any questions, reach us directly at
                    hq@vestafi.co.
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: '0',
                    }}
                  >
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
