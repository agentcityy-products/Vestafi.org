import { appConfig } from '@/config/app';

export const formatCurrency = (amount?: number | string | null) => {
  if (typeof amount !== 'number' && typeof amount !== 'string') return '';
  if (typeof amount === 'string') amount = parseFloat(amount);

  return new Intl.NumberFormat(appConfig.defaultLocale, {
    style: 'currency',
    currency: appConfig.defaultCurrency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(amount);
};

export const formatNumber = (
  num?: number | string | null,
  decimalPlaces?: number,
): string => {
  if (typeof num !== 'number' && typeof num !== 'string') return '';
  if (typeof num === 'string') num = parseFloat(num);
  return num.toLocaleString(appConfig.defaultLocale, {
    minimumFractionDigits: decimalPlaces ?? 0,
    maximumFractionDigits: decimalPlaces ?? 0,
  });
};
