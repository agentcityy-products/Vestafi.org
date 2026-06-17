import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import { appConfig } from '@/config/app';

interface ReceiptDetails {
  investorName: string;
  investmentAmount: number;
  propertyTitle: string;
  propertyLocation: string;
  investmentDate: string;
  transactionId: string;
  status: 'pending' | 'successful';
}

const LEGAL_DISCLAIMER =
  'This receipt serves as confirmation of your contribution. This document does not constitute ownership or share certificate. Legal custody remains with Zenolius Holdings Ltd. Please retain for your records.';

export async function generateInvestmentReceiptPDF({
  investorName,
  investmentAmount,
  propertyTitle,
  propertyLocation,
  investmentDate,
  transactionId,
  status,
}: ReceiptDetails): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Add metadata
  pdfDoc.setTitle(`${appConfig.title} Contribution Receipt`);
  pdfDoc.setAuthor(appConfig.title);
  pdfDoc.setSubject(`Contribution Receipt for ${investorName}`);
  pdfDoc.setCreator(appConfig.title);
  pdfDoc.setProducer(appConfig.title);
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const primaryBlue = rgb(0.06, 0.12, 0.31); // Dark blue
  const accentBlue = rgb(0.14, 0.31, 0.63); // Medium blue
  const lightBlue = rgb(0.93, 0.95, 0.98); // Light blue for header
  const lightGray = rgb(0.95, 0.95, 0.95);
  const mediumGray = rgb(0.6, 0.6, 0.6);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const successGreen = rgb(0.13, 0.59, 0.13);
  const warningOrange = rgb(0.9, 0.45, 0.0);

  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: lightBlue,
  });

  // Header - Company branding with logo
  try {
    // Fetch logo from URL
    const logoUrl = `${appConfig.appUrl}${appConfig.logo}`;
    const logoResponse = await fetch(logoUrl);
    if (logoResponse.ok) {
      const logoBytes = await logoResponse.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBytes);

      // Calculate logo dimensions using same aspect ratio as logo.tsx
      const logoWidth = 140;
      const heightMultiplier = 32 / 77; // From logo.tsx
      const logoHeight = logoWidth * heightMultiplier;

      // Draw logo centered vertically in header
      page.drawImage(logoImage, {
        x: 50,
        y: height - 60 - logoHeight / 2,
        width: logoWidth,
        height: logoHeight,
      });
    } else {
      // Fallback to text-only if logo fails to load
      page.drawText(appConfig.title, {
        x: 50,
        y: height - 55,
        size: 36,
        font: fontBold,
        color: primaryBlue,
      });
    }
  } catch {
    // Fallback to text-only if logo fetch fails
    page.drawText(appConfig.title, {
      x: 50,
      y: height - 55,
      size: 36,
      font: fontBold,
      color: primaryBlue,
    });
  }

  page.drawText('Real Estate Contribution Platform', {
    x: 50,
    y: height - 105,
    size: 12,
    font,
    color: mediumGray, // Dark gray text on light background
  });

  // Receipt number (top right - dark text on light background)
  const receiptNo = transactionId.substring(0, 8).toUpperCase();
  page.drawText('RECEIPT', {
    x: width - 150,
    y: height - 45,
    size: 10,
    font: fontBold,
    color: mediumGray,
  });
  page.drawText(`#${receiptNo}`, {
    x: width - 150,
    y: height - 65,
    size: 14,
    font: fontBold,
    color: primaryBlue,
  });

  // Main content area background
  page.drawRectangle({
    x: 30,
    y: 150,
    width: width - 60,
    height: height - 300,
    color: rgb(1, 1, 1),
    borderColor: lightGray,
    borderWidth: 1,
  });

  // Status badge
  const statusText = status === 'successful' ? 'APPROVED' : 'PENDING REVIEW';
  const statusColor = status === 'successful' ? successGreen : warningOrange;
  const statusY = height - 160;

  // Status background
  page.drawRectangle({
    x: 50,
    y: statusY - 25,
    width: 120,
    height: 30,
    color: statusColor,
    borderColor: statusColor,
    borderWidth: 1,
  });

  page.drawText(statusText, {
    x: 60,
    y: statusY - 15,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Investment details section
  page.drawText('CONTRIBUTION DETAILS', {
    x: 50,
    y: height - 210,
    size: 16,
    font: fontBold,
    color: primaryBlue,
  });

  // Horizontal line under section title
  page.drawLine({
    start: { x: 50, y: height - 220 },
    end: { x: width - 50, y: height - 220 },
    thickness: 2,
    color: accentBlue,
  });

  // Investment amount highlight box
  page.drawRectangle({
    x: width - 200,
    y: height - 290,
    width: 150,
    height: 50,
    color: lightGray,
    borderColor: accentBlue,
    borderWidth: 2,
  });

  page.drawText('AMOUNT CONTRIBUTED', {
    x: width - 190,
    y: height - 260,
    size: 9,
    font: fontBold,
    color: mediumGray,
  });

  page.drawText(`UGX ${investmentAmount.toLocaleString()}`, {
    x: width - 190,
    y: height - 280,
    size: 14,
    font: fontBold,
    color: primaryBlue,
  });

  // Details with better formatting and grouping
  const details = [
    ['Contributor Name', investorName],
    ['Property', propertyTitle],
    ['Location', propertyLocation],
    ['Contribution Date', investmentDate],
    ['Transaction ID', transactionId],
  ];

  let y = height - 250;
  for (const [label, value] of details) {
    // Alternating background for better readability
    if (details.indexOf([label, value]) % 2 === 0) {
      page.drawRectangle({
        x: 45,
        y: y - 15,
        width: width - 250,
        height: 20,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    page.drawText(`${label}:`, {
      x: 55,
      y: y - 5,
      size: 10,
      font: fontBold,
      color: darkGray,
    });

    page.drawText(value, {
      x: 180,
      y: y - 5,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 25;
  }

  // Thank you section
  page.drawRectangle({
    x: 50,
    y: 200,
    width: width - 100,
    height: 60,
    color: rgb(0.96, 0.98, 1),
    borderColor: accentBlue,
    borderWidth: 1,
  });

  page.drawText(`Thank you for contributing to ${appConfig.title}`, {
    x: 70,
    y: 240,
    size: 14,
    font: fontBold,
    color: primaryBlue,
  });

  page.drawText(
    'Your contribution helps build the future of real estate in Uganda.',
    {
      x: 70,
      y: 220,
      size: 10,
      font,
      color: darkGray,
    },
  );

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Footer section
  const footerStartY = 140;

  // Footer background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerStartY,
    color: rgb(0.98, 0.98, 0.98),
  });

  // Contact information with better styling
  page.drawText('CONTACT INFORMATION', {
    x: 50,
    y: footerStartY - 20,
    size: 10,
    font: fontBold,
    color: primaryBlue,
  });

  page.drawText(`Email: ${appConfig.emails.support}`, {
    x: 50,
    y: footerStartY - 40,
    size: 9,
    font,
    color: darkGray,
  });

  page.drawText(`Website: ${appConfig.appUrl}`, {
    x: 50,
    y: footerStartY - 55,
    size: 9,
    font,
    color: darkGray,
  });

  // Legal disclaimer with proper text wrapping and background
  page.drawText('LEGAL DISCLAIMER', {
    x: 300,
    y: footerStartY - 20,
    size: 10,
    font: fontBold,
    color: primaryBlue,
  });

  const disclaimerLines = wrapText(LEGAL_DISCLAIMER, 250, 8);
  let disclaimerY = footerStartY - 40;

  disclaimerLines.forEach((line) => {
    page.drawText(line, {
      x: 300,
      y: disclaimerY,
      size: 8,
      font,
      color: mediumGray,
    });
    disclaimerY -= 10;
  });

  // Footer line
  page.drawLine({
    start: { x: 50, y: 25 },
    end: { x: width - 50, y: 25 },
    thickness: 1,
    color: mediumGray,
  });

  page.drawText(`Generated on ${new Date().toLocaleString()}`, {
    x: 50,
    y: 15,
    size: 8,
    font,
    color: mediumGray,
  });

  return await pdfDoc.save();
}

interface VaultDepositReceiptDetails {
  depositorName: string;
  depositAmount: number;
  transactionId: string;
  depositDate: string;
  approvedDate: string;
  currentVaultBalance: number;
}

const VAULT_DEPOSIT_DISCLAIMER =
  'This receipt serves as confirmation of your vault deposit. Funds in your vault can be deployed to properties at any time. Please retain this receipt for your records.';

export async function generateVaultDepositReceiptPDF({
  depositorName,
  depositAmount,
  transactionId,
  depositDate,
  approvedDate,
  currentVaultBalance,
}: VaultDepositReceiptDetails): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Add metadata
  pdfDoc.setTitle(`${appConfig.title} Vault Deposit Receipt`);
  pdfDoc.setAuthor(appConfig.title);
  pdfDoc.setSubject(`Vault Deposit Receipt for ${depositorName}`);
  pdfDoc.setCreator(appConfig.title);
  pdfDoc.setProducer(appConfig.title);
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const primaryBlue = rgb(0.06, 0.12, 0.31); // Dark blue
  const accentBlue = rgb(0.14, 0.31, 0.63); // Medium blue
  const lightBlue = rgb(0.93, 0.95, 0.98); // Light blue for header
  const lightGray = rgb(0.95, 0.95, 0.95);
  const mediumGray = rgb(0.6, 0.6, 0.6);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const successGreen = rgb(0.13, 0.59, 0.13);

  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: lightBlue,
  });

  // Header - Company branding with logo
  try {
    // Fetch logo from URL
    const logoUrl = `${appConfig.appUrl}${appConfig.logo}`;
    const logoResponse = await fetch(logoUrl);
    if (logoResponse.ok) {
      const logoBytes = await logoResponse.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBytes);

      // Calculate logo dimensions using same aspect ratio as logo.tsx
      const logoWidth = 140;
      const heightMultiplier = 32 / 77; // From logo.tsx
      const logoHeight = logoWidth * heightMultiplier;

      // Draw logo centered vertically in header
      page.drawImage(logoImage, {
        x: 50,
        y: height - 60 - logoHeight / 2,
        width: logoWidth,
        height: logoHeight,
      });
    } else {
      // Fallback to text-only if logo fails to load
      page.drawText(appConfig.title, {
        x: 50,
        y: height - 55,
        size: 36,
        font: fontBold,
        color: primaryBlue,
      });
    }
  } catch {
    // Fallback to text-only if logo fetch fails
    page.drawText(appConfig.title, {
      x: 50,
      y: height - 55,
      size: 36,
      font: fontBold,
      color: primaryBlue,
    });
  }

  page.drawText('Vault Deposit Platform', {
    x: 50,
    y: height - 105,
    size: 12,
    font,
    color: mediumGray,
  });

  // Receipt number (top right)
  const receiptNo = transactionId.substring(0, 8).toUpperCase();
  page.drawText('RECEIPT', {
    x: width - 150,
    y: height - 45,
    size: 10,
    font: fontBold,
    color: mediumGray,
  });
  page.drawText(`#${receiptNo}`, {
    x: width - 150,
    y: height - 65,
    size: 14,
    font: fontBold,
    color: primaryBlue,
  });

  // Main content area background
  page.drawRectangle({
    x: 30,
    y: 150,
    width: width - 60,
    height: height - 300,
    color: rgb(1, 1, 1),
    borderColor: lightGray,
    borderWidth: 1,
  });

  // Status badge
  const statusText = 'APPROVED';
  const statusColor = successGreen;
  const statusY = height - 160;

  // Status background
  page.drawRectangle({
    x: 50,
    y: statusY - 25,
    width: 120,
    height: 30,
    color: statusColor,
    borderColor: statusColor,
    borderWidth: 1,
  });

  page.drawText(statusText, {
    x: 60,
    y: statusY - 15,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Deposit details section
  page.drawText('DEPOSIT DETAILS', {
    x: 50,
    y: height - 210,
    size: 16,
    font: fontBold,
    color: primaryBlue,
  });

  // Horizontal line under section title
  page.drawLine({
    start: { x: 50, y: height - 220 },
    end: { x: width - 50, y: height - 220 },
    thickness: 2,
    color: accentBlue,
  });

  // Deposit amount highlight box
  page.drawRectangle({
    x: width - 200,
    y: height - 290,
    width: 150,
    height: 50,
    color: lightGray,
    borderColor: accentBlue,
    borderWidth: 2,
  });

  page.drawText('DEPOSIT AMOUNT', {
    x: width - 190,
    y: height - 260,
    size: 9,
    font: fontBold,
    color: mediumGray,
  });

  page.drawText(`UGX ${depositAmount.toLocaleString()}`, {
    x: width - 190,
    y: height - 280,
    size: 14,
    font: fontBold,
    color: primaryBlue,
  });

  // Details with better formatting and grouping
  const details = [
    ['Depositor Name', depositorName],
    ['Deposit Date', depositDate],
    ['Approved Date', approvedDate],
    ['Transaction ID', transactionId],
    ['Current Vault Balance', `UGX ${currentVaultBalance.toLocaleString()}`],
  ];

  let y = height - 250;
  for (const [label, value] of details) {
    // Alternating background for better readability
    if (details.indexOf([label, value]) % 2 === 0) {
      page.drawRectangle({
        x: 45,
        y: y - 15,
        width: width - 250,
        height: 20,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    page.drawText(`${label}:`, {
      x: 55,
      y: y - 5,
      size: 10,
      font: fontBold,
      color: darkGray,
    });

    page.drawText(value, {
      x: 180,
      y: y - 5,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 25;
  }

  // Thank you section
  page.drawRectangle({
    x: 50,
    y: 200,
    width: width - 100,
    height: 60,
    color: rgb(0.96, 0.98, 1),
    borderColor: accentBlue,
    borderWidth: 1,
  });

  page.drawText(`Thank you for your deposit to ${appConfig.title}`, {
    x: 70,
    y: 240,
    size: 14,
    font: fontBold,
    color: primaryBlue,
  });

  page.drawText(
    'Your funds are now available in your vault and can be deployed to properties at any time.',
    {
      x: 70,
      y: 220,
      size: 10,
      font,
      color: darkGray,
    },
  );

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Footer section
  const footerStartY = 140;

  // Footer background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerStartY,
    color: rgb(0.98, 0.98, 0.98),
  });

  // Contact information
  page.drawText('CONTACT INFORMATION', {
    x: 50,
    y: footerStartY - 20,
    size: 10,
    font: fontBold,
    color: primaryBlue,
  });

  page.drawText(`Email: ${appConfig.emails.support}`, {
    x: 50,
    y: footerStartY - 40,
    size: 9,
    font,
    color: darkGray,
  });

  page.drawText(`Website: ${appConfig.appUrl}`, {
    x: 50,
    y: footerStartY - 55,
    size: 9,
    font,
    color: darkGray,
  });

  // Legal disclaimer
  page.drawText('LEGAL DISCLAIMER', {
    x: 300,
    y: footerStartY - 20,
    size: 10,
    font: fontBold,
    color: primaryBlue,
  });

  const disclaimerLines = wrapText(VAULT_DEPOSIT_DISCLAIMER, 250, 8);
  let disclaimerY = footerStartY - 40;

  disclaimerLines.forEach((line) => {
    page.drawText(line, {
      x: 300,
      y: disclaimerY,
      size: 8,
      font,
      color: mediumGray,
    });
    disclaimerY -= 10;
  });

  // Footer line
  page.drawLine({
    start: { x: 50, y: 25 },
    end: { x: width - 50, y: 25 },
    thickness: 1,
    color: mediumGray,
  });

  page.drawText(`Generated on ${new Date().toLocaleString()}`, {
    x: 50,
    y: 15,
    size: 8,
    font,
    color: mediumGray,
  });

  return await pdfDoc.save();
}
