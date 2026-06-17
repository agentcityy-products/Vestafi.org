import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';

import { appConfig } from '@/config/app';

/** URL of the static contribution agreement template (Supabase storage). */
const CONTRIBUTION_AGREEMENT_TEMPLATE_URL =
  'https://fysilyamoemzirhafvrl.supabase.co/storage/v1/object/public/docs/contribution-agreement.pdf';

export interface ContributionAgreementParams {
  /** Investor full name */
  fullName: string;
  /** Investor email */
  email: string;
  /** Investor phone (use empty string or "N/A" if missing) */
  phone: string;
  /** Contribution amount in currency units */
  contributionAmount: number;
  /** Property title */
  propertyTitle: string;
  /** Property details (e.g. address / location string) */
  propertyDetails: string;
  /** Property ID (UUID or display id) */
  propertyId: string;
  /** Date of contribution (formatted string) */
  contributionDate: string;
}

/**
 * Possible form field names in the template PDF (try in order).
 * If the template has AcroForm fields, we fill these when names match.
 */
const FORM_FIELD_MAPPINGS: Array<{ key: keyof ContributionAgreementParams; names: string[] }> = [
  { key: 'fullName', names: ['Investor Name', 'Name', 'Full Name', 'InvestorName', 'name'] },
  { key: 'email', names: ['Email', 'email', 'Investor Email'] },
  { key: 'phone', names: ['Phone', 'phone', 'Phone Number', 'Telephone'] },
  { key: 'contributionAmount', names: ['Amount', 'Contribution Amount', 'amount'] },
  { key: 'propertyTitle', names: ['Property Title', 'Property', 'property'] },
  { key: 'propertyDetails', names: ['Property Details', 'Property Location', 'Location', 'Address'] },
  { key: 'propertyId', names: ['Property ID', 'Property Id', 'property_id', 'PropertyID'] },
  { key: 'contributionDate', names: ['Date', 'Contribution Date', 'date'] },
];

function getDisplayValue(
  key: keyof ContributionAgreementParams,
  params: ContributionAgreementParams,
): string {
  switch (key) {
    case 'contributionAmount':
      return formatCurrency(params.contributionAmount);
    default:
      return String(params[key] ?? '');
  }
}

/**
 * Generates a contribution agreement PDF customized with the investor's details.
 * Loads the template PDF, attempts to fill form fields (if any), and appends
 * a "Particulars of Investor" page so the document is always personalized.
 *
 * @returns Buffer of the PDF, or null if generation fails (caller should log and send email without attachment).
 */
export async function generateContributionAgreementPDF(
  params: ContributionAgreementParams,
): Promise<Buffer | null> {
  try {
    const response = await fetch(CONTRIBUTION_AGREEMENT_TEMPLATE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    const templateBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });

    // Try to fill form fields if the template has any (use exact field name from PDF)
    try {
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      const fieldNames = fields.map((f) => f.getName());
      for (const { key, names } of FORM_FIELD_MAPPINGS) {
        const value = getDisplayValue(key, params);
        if (!value) continue;
        const matchedName = fieldNames.find((n) =>
          names.some((ourName) => n.toLowerCase() === ourName.toLowerCase()),
        );
        if (!matchedName) continue;
        try {
          const field = form.getTextField(matchedName);
          field.setText(value);
        } catch {
          // Not a text field or not fillable; skip
        }
      }
    } catch {
      // No form or form not fillable; we'll rely on the appended particulars page
    }

    // Append a "Particulars of Investor" page so the document is always customized
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const mediumGray = rgb(0.5, 0.5, 0.5);

    const lineHeight = 20;
    let y = height - 80;

    page.drawText('Particulars of Investor', {
      x: 50,
      y,
      size: 16,
      font: fontBold,
      color: darkGray,
    });
    y -= lineHeight + 10;

    const lines: Array<[string, string]> = [
      ['Full Name', params.fullName || '—'],
      ['Email', params.email || '—'],
      ['Phone', params.phone || 'N/A'],
      ['Contribution Amount', formatCurrency(params.contributionAmount)],
      ['Property', params.propertyTitle || '—'],
      ['Property Details', params.propertyDetails || '—'],
      ['Property ID', params.propertyId || '—'],
      ['Date of Contribution', params.contributionDate || '—'],
    ];

    for (const [label, value] of lines) {
      page.drawText(`${label}:`, {
        x: 50,
        y,
        size: 10,
        font: fontBold,
        color: darkGray,
      });
      page.drawText(value, {
        x: 180,
        y,
        size: 10,
        font,
        color: mediumGray,
      });
      y -= lineHeight;
    }

    page.drawText(`${appConfig.title} — Contribution Agreement (Personalized)`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: mediumGray,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    Logger.error('Failed to generate contribution agreement PDF', {
      error: error instanceof Error ? error.message : String(error),
      fullName: params.fullName,
      propertyId: params.propertyId,
    });
    return null;
  }
}
