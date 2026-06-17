'use server';

import { z } from 'zod';

import { safeActionClient } from '@/lib/server/safe-action';

const getForexRateSchema = z.object({
  from: z.string().default('UGX'),
  to: z.string().default('USD'),
});

// Fallback rate: 1 USD = 3600 USH
const FALLBACK_RATE = 3600;

/**
 * Fetches the current exchange rate from UGX to USD using Frankfurter API
 * Returns the rate (1 USD = X UGX), so to convert UGX to USD: divide by rate
 */
export const getForexRate = safeActionClient
  .schema(getForexRateSchema)
  .action(async ({ parsedInput }) => {
    const { from, to } = parsedInput;

    try {
      // Frankfurter API endpoint for latest rates
      const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Forex API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Frankfurter returns: { amount: 1, base: "UGX", date: "2024-01-01", rates: { USD: 0.000277 } }
      // The rate is: 1 UGX = X USD, so to convert UGX to USD, multiply by rate
      // But we need: 1 USD = X UGX, so we take 1 / rate
      const rate = data.rates?.[to];
      if (!rate || typeof rate !== 'number') {
        throw new Error('Invalid rate in API response');
      }

      // Convert to: 1 USD = X UGX
      const usdToUgxRate = 1 / rate;

      return {
        success: true,
        rate: usdToUgxRate,
        date: data.date,
      };
    } catch (error) {
      // Return fallback rate on error
      return {
        success: false,
        rate: FALLBACK_RATE,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

