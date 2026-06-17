import { CountryCode, formatNumber } from 'libphonenumber-js';

import { appConfig } from '@/config/app';

export const getFullName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

export const getInitials = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) => {
  return `${firstName?.[0]}${lastName?.[0]}`.trim();
};

export const enumToLabel = (str?: string | null) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const formatPhoneNumber = (
  phoneNumber?: string | null,
  code: CountryCode = appConfig.defaultCountryCode,
) => {
  if (!phoneNumber) return '';
  return formatNumber(phoneNumber, code, 'INTERNATIONAL');
};

/**
 * Masks a bank account number showing only first 2 and last 3 digits
 * Example: 123456789 -> 12****789
 */
export const maskAccountNumber = (accountNumber?: string | null): string => {
  if (!accountNumber) return '';
  
  const trimmed = accountNumber.trim();
  const length = trimmed.length;
  
  // If account number is too short, return as is or partially masked
  if (length <= 5) {
    // For very short numbers, show first char and mask the rest
    if (length <= 2) return trimmed;
    return `${trimmed.slice(0, 1)}${'*'.repeat(length - 1)}`;
  }
  
  // Show first 2 digits, mask middle, show last 3 digits
  const firstTwo = trimmed.slice(0, 2);
  const lastThree = trimmed.slice(-3);
  const middleLength = length - 5;
  const masked = '*'.repeat(middleLength);
  
  return `${firstTwo}${masked}${lastThree}`;
};