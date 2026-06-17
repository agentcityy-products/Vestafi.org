/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';

interface AdminVaultDepositNotificationProps {
  userName: string;
  userEmail: string;
  depositAmount: number;
  transactionId: string;
  requestDate: string;
}

export const AdminVaultDepositNotification = ({
  userName,
  userEmail,
  depositAmount,
  transactionId,
  requestDate,
}: AdminVaultDepositNotificationProps) => {
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
                      backgroundColor: '#fef3c7',
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
                      🚨
                    </span>
                    <span
                      style={{
                        color: '#92400e',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      NEW VAULT DEPOSIT REQUEST
                    </span>
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#92400e',
                      margin: '0 0 10px 0',
                    }}
                  >
                    Action Required
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#92400e',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    A new vault deposit request has been submitted and requires
                    your review.
                  </p>

                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      borderRadius: '12px',
                      padding: '25px',
                      margin: '20px 0',
                      borderLeft: '4px solid #f59e0b',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '20px',
                        color: '#92400e',
                        margin: '0 0 20px 0',
                        fontWeight: '600',
                      }}
                    >
                      User Information
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
                          User Name:
                        </td>
                        <td
                          style={{
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#92400e',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {userName}
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
                            color: '#92400e',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                        >
                          {userEmail}
                        </td>
                      </tr>
                    </table>
                  </div>

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
                          Transaction ID:
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
                          Deposit Amount:
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
                          Date Requested:
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
                          {new Date(requestDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
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
                      Next Steps
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#1e40af',
                        margin: '0',
                        lineHeight: '1.5',
                      }}
                    >
                      Please review this deposit request and verify the payment
                      proof. You can approve or reject the request from the
                      admin dashboard. The user will be notified once you take
                      action.
                    </p>
                  </div>

                  <div style={{ marginTop: '30px' }}>
                    <a
                      href={`${appConfig.appUrl}/admin/vault`}
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
                      Review Request
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
                    This is an automated notification. Please review the deposit
                    request promptly.
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
