/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';

interface RentDistributionEmailProps {
  recipientName: string;
  propertyTitle: string;
  propertyLocation: string;
  rentMonth: string; // YYYY-MM format
  distributionAmount: number;
  dateAdded: string;
  propertyId: string;
  transactionId: string;
}

export const RentDistributionEmail = ({
  recipientName,
  propertyTitle,
  propertyLocation,
  rentMonth,
  distributionAmount,
  dateAdded,
  propertyId,
  transactionId,
}: RentDistributionEmailProps) => {
  const formatRentMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

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
                        fontSize: '20px',
                        margin: '0 8px',
                      }}
                    >
                      💰
                    </span>
                    <span
                      style={{
                        color: '#16a34a',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      RENT DISTRIBUTION
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
                    Rent Added to Your Vault
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#047857',
                      margin: '0 0 30px 0',
                      fontWeight: '500',
                    }}
                  >
                    Hi {recipientName}, you've received rent distribution from
                    your property contribution!
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
                      Distribution Details
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
                          Rent Period:
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
                          {formatRentMonth(rentMonth)}
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
                          Your Share:
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
                          {formatCurrency(distributionAmount)}
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
                          Date Added:
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
                          {formatTimestamp(dateAdded)}
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
                          Property ID:
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
                          {propertyId}
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
                      About Your Distribution
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
                        This amount has been automatically added to your vault
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Your share is calculated based on your contribution
                        percentage
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        You can view your complete earnings history on your
                        dashboard
                      </li>
                      <li style={{ marginBottom: '8px', fontSize: '14px' }}>
                        Rent distributions are processed monthly as they become
                        available
                      </li>
                    </ul>
                  </div>

                  <div style={{ margin: '30px 0' }}>
                    <a
                      href={`${appConfig.appUrl}${paths.dashboard}`}
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
                      View Your Vault
                    </a>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '30px 0 20px 0',
                    }}
                  >
                    Thank you for contributing to {appConfig.title}. We're
                    committed to delivering consistent returns on your property
                    contributions.
                    <br />
                    Keep building wealth through real estate!
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
                      style={{ color: '#16a34a', textDecoration: 'none' }}
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
