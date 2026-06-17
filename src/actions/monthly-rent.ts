'use server';

import { createMonthlyRentSchema } from '@/schema/monthly-rent';

import { resend } from '@/lib/resend';
import { adminActionClient } from '@/lib/server/safe-action';
import { formatCurrency } from '@/utils/number-functions';
import { getFullName } from '@/utils/string-functions';

import { appConfig } from '@/config/app';
import { paths } from '@/constants/paths';
import { RentDistributionEmail } from '@/emails/rent-distribution-email';

import { MonthlyReturnInsert } from '@/types/dao';

export const addMonthlyRentAndDistributeReturns = adminActionClient
  .schema(createMonthlyRentSchema)
  .action(
    async ({ ctx, parsedInput: { propertyId, month, totalRentCollected } }) => {
      const { supabase } = ctx;
      month += '-01';

      const { data: property, error: propertyError } = await supabase
        .from('property')
        .select('*')
        .eq('id', propertyId)
        .single();
      if (propertyError) throw new Error(propertyError.message);

      const { data: investors, error: investorsError } = await supabase
        .from('owned_properties_view')
        .select('*')
        .eq('id', propertyId)
        .eq('status', 'successful');
      if (investorsError) throw new Error(investorsError.message);

      const returns: MonthlyReturnInsert[] = investors.map((investor) => {
        return {
          property_id: propertyId,
          user_id: investor.user_id,
          amount: Math.round(
            totalRentCollected * (investor.ownership_percentage! / 100),
          ),
          month,
        };
      });
      const { error: rentError } = await supabase.from('monthly_rent').insert({
        property_id: propertyId,
        month,
        total_rent_collected: totalRentCollected,
      });
      if (rentError) throw new Error(rentError.message);

      if (returns.length > 0) {
        const { data: returnsData, error: returnsError } = await supabase
          .from('monthly_return')
          .insert(returns)
          .select('*, user:user_id(*)');
        if (returnsError) throw new Error(returnsError.message);

        const propertyLocation = [
          property.address_line_1,
          property.address_line_2,
          property.city,
          property.state,
          property.country,
        ]
          .filter(Boolean)
          .join(', ');

        // Use batch API to send all emails in a single request (avoids 2/sec rate limit)
        const emails = returnsData.map((monthlyReturn) => ({
          from: `VESTAFI HQ <${appConfig.emails.sender}>`,
          to: monthlyReturn.user!.email,
          subject: 'Monthly Rent Distribution',
          react: RentDistributionEmail({
            recipientName: getFullName(
              monthlyReturn.user?.first_name,
              monthlyReturn.user?.last_name,
            ),
            propertyTitle: property.title!,
            propertyLocation,
            rentMonth: monthlyReturn.month,
            distributionAmount: monthlyReturn.amount,
            dateAdded: new Date().toISOString(),
            propertyId: propertyId,
            transactionId: monthlyReturn.id,
          }),
          text: `Monthly Rent Distribution

Dear ${getFullName(
              monthlyReturn.user?.first_name,
              monthlyReturn.user?.last_name,
            )},

You have received a monthly rent distribution of ${formatCurrency(
              monthlyReturn.amount,
            )} for the month of ${monthlyReturn.month}.

Please login to your account to view your rent distribution.

Login URL: ${appConfig.appUrl}${paths.auth.login}

Best regards,
The ${appConfig.title} Team
          `,
        }));

        const { error: emailError } = await resend.batch.send(emails);
        if (emailError) {
          throw new Error('Failed to send rent distribution emails');
        }
      }

      const totalReturnsAmount = returns.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      );

      return {
        totalReturnsAmount,
        totalReturns: returns.length,
      };
    },
  );
