'use client';

import { CountryCode } from 'libphonenumber-js';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useExportAllMonthlyReturns } from '@/hooks/queries/monthly-returns';

import { Button } from '@/components/ui/button';

import { exportToCSV } from '@/utils/csv-export';
import { formatDate, formatTimestamp } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';
import { formatPhoneNumber, getFullName } from '@/utils/string-functions';

const ExportMonthlyReturns = () => {
  const { data, isLoading, refetch } = useExportAllMonthlyReturns();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // First fetch the data if not already available
      const result = await refetch();
      const exportData = result.data;

      if (!exportData || exportData.length === 0) {
        toast.error('No monthly rentals data available to export');
        return;
      }

      // Format the data properly before export
      const formattedData = exportData.map((item) => ({
        // Monthly Return Details
        return_id: item.id,
        return_amount: formatCurrency(item.amount),
        return_month: formatDate(item.month),
        date_received: formatTimestamp(item.created_at),

        // Investor Details
        investor_id: item.user?.id,
        investor_name: getFullName(item.user?.first_name, item.user?.last_name),
        investor_email: item.user?.email || '',
        investor_phone: formatPhoneNumber(
          item.user?.phone,
          item.user?.country_code as CountryCode | undefined,
        ),

        // Property Information
        property_id: item.property?.id,
        property_title: item.property?.title || '',
        property_address: [
          item.property?.address_line_1,
          item.property?.address_line_2,
          item.property?.city,
          item.property?.state,
          item.property?.zip_code,
          item.property?.country,
        ]
          .filter(Boolean)
          .join(', '),
        property_price: formatCurrency(item.property?.price),
        min_monthly_rent: formatCurrency(item.property?.minimum_monthly_rent),
        max_monthly_rent: formatCurrency(item.property?.maximum_monthly_rent),
      }));

      // Generate filename with current timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, '');
      const filename = `monthly-returns-export-${timestamp}.csv`;

      // Define clear, readable headers
      const customHeaders = {
        return_id: 'Return ID',
        return_amount: 'Return Amount',
        return_month: 'Return Month',
        date_received: 'Date Received',
        property_title: 'Property Title',
        property_address: 'Property Address',
        property_price: 'Property Price',
        ownership_percentage: 'Ownership %',
        investment_amount: 'Contribution Amount',
        pending_investment: 'Pending Contribution',
        investment_status: 'Contribution Status',
        investment_date: 'Contribution Date',
        min_monthly_return: 'Min Monthly Return',
        max_monthly_return: 'Max Monthly Return',
        min_monthly_rent: 'Min Monthly Rent',
        max_monthly_rent: 'Max Monthly Rent',
        investor_name: 'Investor Name',
        investor_email: 'Investor Email',
        investor_phone: 'Investor Phone',
        investor_registration_date: 'Registration Date',
      };

      await exportToCSV(formattedData, {
        filename,
        customHeaders,
        excludeFields: [], // No need to exclude since we're only including what we want
      });

      toast.success(
        `Successfully exported ${exportData.length} monthly rentals to ${filename}`,
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export monthly rentals. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Monthly rentals data refreshed');
    } catch {
      toast.error('Failed to refresh data');
    }
  };

  return (
    <div className='flex flex-col gap-4 rounded-lg border p-6'>
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-green-100 p-2'>
          <FileText className='h-6 w-6 text-green-600' />
        </div>
        <div>
          <h3 className='text-lg font-semibold'>Export Monthly Rentals</h3>
          <p className='text-sm text-muted-foreground'>
            Export all monthly rentals data to CSV format
          </p>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {isLoading
            ? 'Loading data...'
            : data
              ? `${data.length} records available for export`
              : 'Click refresh to load data'}
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='mr-2 h-4 w-4' />
            )}
            Refresh
          </Button>

          <Button onClick={handleExport} disabled={isExporting} size='sm'>
            {isExporting ? (
              <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Download className='mr-2 h-4 w-4' />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      {data && data.length > 0 && (
        <div className='rounded-lg bg-muted/50 p-4'>
          <div className='text-xs text-muted-foreground'>
            <strong>Export includes:</strong> Rental details, property
            information, investor details, ownership percentages, contribution
            amounts, and dates.
            <br />
            <strong>Generated:</strong> {formatTimestamp(new Date())}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMonthlyReturns;
