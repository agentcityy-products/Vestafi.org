'use server';

import { z } from 'zod';

import { updateRentalPropertySchema } from '@/schema/rental-property';

import { resend } from '@/lib/resend';
import { adminActionClient } from '@/lib/server/safe-action';
import { formatTimestamp } from '@/utils/date-functions';
import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';

import { appConfig } from '@/config/app';

const getRentalPropertiesSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

const updateRentalPropertyStatusSchema = z.object({
  propertyId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
});

const rejectRentalPropertySchema = z.object({
  propertyId: z.string().uuid(),
  rejection_reason: z.string().min(1, {
    message: 'Rejection reason is required.',
  }),
});

// Admin action to get all rental properties with filters
export const getAllRentalProperties = adminActionClient
  .schema(getRentalPropertiesSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;

    let query = supabase
      .from('property')
      .select('*, profile:submitted_by(id, first_name, last_name, email)', {
        count: 'exact',
      })
      .eq('property_type', 'rental');

    // Apply status filter
    if (parsedInput.status) {
      query = query.eq('status', parsedInput.status);
    }

    // Apply search filter
    if (parsedInput.search?.trim()) {
      query = query.or(
        `title.ilike.%${parsedInput.search}%,description.ilike.%${parsedInput.search}%,city.ilike.%${parsedInput.search}%,country.ilike.%${parsedInput.search}%`,
      );
    }

    // Apply pagination
    const from = (parsedInput.page - 1) * parsedInput.pageSize;
    const to = from + parsedInput.pageSize - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return {
      data: data || [],
      totalCount: count || 0,
    };
  });

// Admin action to approve a rental property
export const approveRentalProperty = adminActionClient
  .schema(updateRentalPropertyStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;

    // Update status to approved and set listing_date if not already set
    const { data, error } = await supabase
      .from('property')
      .update({
        status: 'approved',
        listing_date: new Date().toISOString(), // Set listing date on approval
      })
      .eq('id', parsedInput.propertyId)
      .eq('property_type', 'rental')
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Property not found');

    return data;
  });

// Admin action to reject a rental property
export const rejectRentalProperty = adminActionClient
  .schema(rejectRentalPropertySchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;

    // Get property with user info
    const { data: property, error: propertyError } = await supabase
      .from('property')
      .select('*, profile:submitted_by(id, first_name, last_name, email)')
      .eq('id', parsedInput.propertyId)
      .eq('property_type', 'rental')
      .single();

    if (propertyError) throw new Error(propertyError.message);
    if (!property) throw new Error('Property not found');

    // Update status to rejected
    const { data, error } = await supabase
      .from('property')
      .update({
        status: 'rejected',
        rejection_reason: parsedInput.rejection_reason,
      })
      .eq('id', parsedInput.propertyId)
      .eq('property_type', 'rental')
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Property not found');

    // Send rejection email to user
    if (property.profile && property.profile.email) {
      const userName = getFullName(
        property.profile.first_name,
        property.profile.last_name,
      );

      const { error: emailError } = await resend.emails.send({
        from: `VESTAFI HQ <${appConfig.emails.sender}>`,
        to: property.profile.email,
        subject: 'Rental Property Submission Rejected',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Rental Property Submission Rejected</h2>
            <p>Dear ${userName},</p>
            <p>We regret to inform you that your rental property submission has been rejected.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Property Details:</h3>
              <p><strong>Title:</strong> ${property.title}</p>
              <p><strong>Location:</strong> ${[property.city, property.country].filter(Boolean).join(', ')}</p>
              <p><strong>Price Per Night:</strong> ${formatCurrency(property.price)}</p>
              <p><strong>Submission Date:</strong> ${formatTimestamp(property.created_at || new Date())}</p>
            </div>
            <div style="background-color: #fee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f00;">
              <h3>Rejection Reason:</h3>
              <p>${parsedInput.rejection_reason}</p>
            </div>
            <p>If you have any questions about this decision, please contact our support team at ${appConfig.emails.support}.</p>
            <p>Best regards,<br>The ${appConfig.title} Team</p>
          </div>
        `,
        text: `Rental Property Submission Rejected

Dear ${userName},

We regret to inform you that your rental property submission has been rejected.

Property Details:
- Title: ${property.title}
- Location: ${[property.city, property.country].filter(Boolean).join(', ')}
- Price Per Night: ${formatCurrency(property.price)}
- Submission Date: ${formatTimestamp(property.created_at || new Date())}

Rejection Reason:
${parsedInput.rejection_reason}

If you have any questions about this decision, please contact our support team at ${appConfig.emails.support}.

Best regards,
The ${appConfig.title} Team`,
      });

      if (emailError) {
        Logger.error('Failed to send rejection email', { error: emailError });
        // Don't throw, rejection is successful even if email fails
      }
    }

    return data;
  });

// Admin action to update a rental property (edit)
export const updateRentalProperty = adminActionClient
  .schema(updateRentalPropertySchema)
  .action(async ({ ctx, parsedInput }) => {
    const { supabase } = ctx;
    const { propertyId, ...updateData } = parsedInput;

    // Update property (status remains unchanged - stays as pending)
    const { data, error } = await supabase
      .from('property')
      .update({
        ...updateData,
      })
      .eq('id', propertyId)
      .eq('property_type', 'rental')
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Property not found');

    Logger.info('Rental property updated by admin', {
      propertyId,
      updatedFields: Object.keys(updateData),
    });

    return data;
  });
