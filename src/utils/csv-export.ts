import { enumToLabel } from './string-functions';

export interface ExportOptions {
  filename: string;
  customHeaders?: Record<string, string>;
  excludeFields?: string[];
}

/**
 * Flattens a nested object into a single-level object with dot notation keys
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const flattened: Record<string, string> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = '';
    } else if (Array.isArray(value)) {
      // Handle arrays by joining them with semicolons
      flattened[newKey] = value.join('; ');
    } else if (typeof value === 'object' && value !== null) {
      // Recursively flatten nested objects
      Object.assign(
        flattened,
        flattenObject(value as Record<string, unknown>, newKey),
      );
    } else {
      flattened[newKey] = String(value);
    }
  });

  return flattened;
}

/**
 * Converts data to CSV format and triggers download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions,
) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Flatten all objects
  const flattenedData = data.map((item) => flattenObject(item));

  // Get all unique keys from all objects
  const allKeys = Array.from(
    new Set(flattenedData.flatMap((item) => Object.keys(item))),
  );

  // Filter out excluded fields
  const filteredKeys = allKeys.filter(
    (key) =>
      !options.excludeFields?.some((excluded) => key.startsWith(excluded)),
  );

  // Generate headers using enumToLabel or custom headers
  const headers = filteredKeys.map((key) => {
    if (options.customHeaders?.[key]) {
      return options.customHeaders[key];
    }
    // Use the last part of the key for nested properties (e.g., 'user.first_name' -> 'first_name')
    const displayKey = key.includes('.') ? key.split('.').pop() || key : key;
    return enumToLabel(displayKey);
  });

  // Create CSV content
  const csvContent = [
    // Headers row
    headers.map((header) => `"${header}"`).join(','),
    // Data rows
    ...flattenedData.map((item) =>
      filteredKeys
        .map((key) => {
          const value = item[key] || '';
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(','),
    ),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', options.filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
