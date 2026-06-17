/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

interface WithdrawalRejectedNotificationProps {
  recipientName: string;
  withdrawalAmount: number;
  requestId: string;
  rejectedDate: string;
  reason?: string;
  bankAccount?: string;
}

export const WithdrawalRejectedNotification = ({
  recipientName,
  withdrawalAmount,
  requestId,
  rejectedDate,
  reason,
  bankAccount,
}: WithdrawalRejectedNotificationProps) => {
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
                      backgroundColor: '#fee2e2',
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
                      ❌
                    </span>
                    <span
                      style={{
                        color: '#dc2626',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      WITHDRAWAL REJECTED
                    </span>
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#dc2626',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Request Declined
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#dc2626',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Hi {recipientName}, unfortunately your withdrawal request
                    has been declined.
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
                        color: '#dc2626',
                        margin: '0 0 20px 0',
                        fontWeight: '600',
                      }}
                    >
                      Request Details
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
                          Withdrawal Amount:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '18px',
                            color: '#dc2626',
                            fontWeight: 'bold',
                            textAlign: 'right',
                          }}
                        >
                          {formatCurrency(withdrawalAmount)}
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
                          Request ID:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#dc2626',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {requestId}
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
                          Rejection Date:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#dc2626',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {new Date(rejectedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                      {bankAccount && (
                        <tr>
                          <td
                            style={{
                              padding: '8px 0',
                              fontSize: '14px',
                              color: '#6b7280',
                              fontWeight: '500',
                            }}
                          >
                            Bank Account:
                          </td>
                          <td
                            style={{
                              padding: '8px 0',
                              fontSize: '14px',
                              color: '#dc2626',
                              fontWeight: '600',
                              textAlign: 'right',
                            }}
                          >
                            {bankAccount}
                          </td>
                        </tr>
                      )}
                    </table>
                  </div>

                  {reason && (
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
                        Reason for Rejection
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#92400e',
                          margin: '0',
                          lineHeight: '1.5',
                        }}
                      >
                        {reason}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      backgroundColor: '#dbeafe',
                      borderRadius: '12px',
                      padding: '20px',
                      margin: '20px 0',
                      borderLeft: '4px solid #3b82f6',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '16px',
                        color: '#1e40af',
                        margin: '0 0 10px 0',
                        fontWeight: '600',
                      }}
                    >
                      What's Next?
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#1e40af',
                        margin: '0',
                        lineHeight: '1.5',
                      }}
                    >
                      Your withdrawal amount has been returned to your account
                      balance. You can review the reason for rejection above and
                      make any necessary changes before submitting a new
                      withdrawal request. If you need assistance or have
                      questions, please contact our support team.
                    </p>
                  </div>

                  <div style={{ marginTop: '30px' }}>
                    <a
                      href={`${appConfig.appUrl}${paths.dashboard.root}`}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        padding: '12px 30px',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px',
                        marginRight: '10px',
                      }}
                    >
                      View Dashboard
                    </a>
                    <a
                      href={paths.support}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#6b7280',
                        color: '#ffffff',
                        padding: '12px 30px',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      Contact Support
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
                    We apologize for any inconvenience. Our team is here to help
                    resolve any issues and assist with your future withdrawal
                    requests.
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
