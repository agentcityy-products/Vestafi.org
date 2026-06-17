/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

interface VaultDepositRequestConfirmationProps {
  recipientName: string;
  depositAmount: number;
  transactionId: string;
  requestDate: string;
}

export const VaultDepositRequestConfirmation = ({
  recipientName,
  depositAmount,
  transactionId,
  requestDate,
}: VaultDepositRequestConfirmationProps) => {
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
                      backgroundColor: '#dbeafe',
                      borderRadius: '50px',
                      display: 'inline-block',
                      padding: '8px 16px',
                      marginBottom: '20px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '24px',
                        margin: '0 8px',
                      }}
                    >
                      💰
                    </span>
                    <span
                      style={{
                        color: '#1d4ed8',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      VAULT DEPOSIT REQUEST SUBMITTED
                    </span>
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#1e40af',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Deposit Request Received
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#1e40af',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Hi {recipientName}, we have received your vault deposit
                    request!
                  </p>

                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      borderRadius: '12px',
                      padding: '25px',
                      margin: '20px 0',
                      borderLeft: '4px solid #3b82f6',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '20px',
                        color: '#1e40af',
                        margin: '0 0 20px 0',
                        fontWeight: '600',
                      }}
                    >
                      Deposit Details
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
                          Deposit Amount:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '18px',
                            color: '#1e40af',
                            fontWeight: 'bold',
                            textAlign: 'right',
                          }}
                        >
                          {formatCurrency(depositAmount)}
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
                            fontSize: '14px',
                            color: '#1e40af',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {transactionId}
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
                          Date Requested:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#1e40af',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {new Date(requestDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '12px',
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
                      What's Next?
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#92400e',
                        margin: '0',
                        lineHeight: '1.5',
                      }}
                    >
                      Your deposit request is now under review. Our team will
                      verify your payment proof and process it within 24-48
                      hours. You'll receive an email notification once your
                      deposit has been approved and the funds have been added to
                      your vault balance.
                    </p>
                  </div>

                  <div style={{ marginTop: '30px' }}>
                    <a
                      href={`${appConfig.appUrl}${paths.dashboard.root}`}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        padding: '12px 30px',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      View Dashboard
                    </a>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '30px 0 0 0',
                      lineHeight: '1.5',
                    }}
                  >
                    If you have any questions about your deposit request, please
                    contact our support team.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '20px 40px',
                    borderTop: '1px solid #e5e7eb',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0',
                    }}
                  >
                    © {new Date().getFullYear()} {appConfig.title}. All rights
                    reserved.
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
