'use client';

import React from 'react';

import { Button } from '@/components/ui/button';

import { formatTimestamp } from '@/utils/date-functions';

const Page = () => {
  const handleGeneratePDF = async () => {
    try {
      // Dynamic import to avoid server-side issues
      const { generateInvestmentReceiptPDF } = await import(
        '@/utils/pdf-receipt'
      );

      // Generate PDF with test data
      const pdfBytes = await generateInvestmentReceiptPDF({
        investorName: 'Ali Abbas',
        investmentAmount: 1000000,
        propertyTitle: 'New property',
        propertyLocation: 'some very long location',
        investmentDate: formatTimestamp(Date.now()),
        transactionId: crypto.randomUUID(),
        status: 'successful',
      });

      // Create blob and open in new tab
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up the URL object after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='mb-4 text-2xl font-bold'>PDF Test Page</h1>
      <Button onClick={handleGeneratePDF}>Generate & Open PDF</Button>
    </div>
  );
};

export default Page;
