/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

interface WithdrawalPaidNotificationProps {
  recipientName: string;
  withdrawalAmount: number;
  requestId: string;
  paidDate: string;
  bankAccount?: string;
  transactionReference?: string;
}

export const WithdrawalPaidNotification = ({
  recipientName,
  withdrawalAmount,
  requestId,
  paidDate,
  bankAccount,
  transactionReference,
}: WithdrawalPaidNotificationProps) => {
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
                        fontSize: '24px',
                        margin: '0 8px',
                      }}
                    >
                      ✅
                    </span>
                    <span
                      style={{
                        color: '#16a34a',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      WITHDRAWAL COMPLETED
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
                    Payment Sent!
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#047857',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Hi {recipientName}, your withdrawal has been successfully
                    processed and the funds have been transferred to your
                    account.
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
                      Payment Details
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
                            color: '#15803d',
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
                            color: '#15803d',
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
                          Payment Date:
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
                          {new Date(paidDate).toLocaleDateString('en-US', {
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
                              color: '#15803d',
                              fontWeight: '600',
                              textAlign: 'right',
                            }}
                          >
                            {bankAccount}
                          </td>
                        </tr>
                      )}
                      {transactionReference && (
                        <tr>
                          <td
                            style={{
                              padding: '8px 0',
                              fontSize: '14px',
                              color: '#6b7280',
                              fontWeight: '500',
                            }}
                          >
                            Transaction Reference:
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
                            {transactionReference}
                          </td>
                        </tr>
                      )}
                    </table>
                  </div>

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
                      The funds should appear in your bank account within 1-3
                      business days depending on your bank's processing time.
                      Please check your account statement for the transaction.
                      If you don't see the funds after 3 business days, please
                      contact our support team.
                    </p>
                  </div>

                  <div style={{ marginTop: '30px' }}>
                    <a
                      href={`${appConfig.appUrl}${paths.dashboard.root}`}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#15803d',
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
                    Thank you for using our platform. If you have any questions
                    or need assistance, please don't hesitate to contact our
                    support team.
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
