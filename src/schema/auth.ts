import * as z from 'zod';

export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export type EmailFormData = z.infer<typeof emailSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
