/**
 * Generates a referral code from an email address.
 * Format: email prefix (before @) with special characters removed/replaced.
 * Example: john.doe@email.com -> john.doe
 */
export function generateReferralCodeFromEmail(email: string): string {
  // Extract email prefix (part before @)
  const prefix = email.split('@')[0]?.toLowerCase() || 'user';

  // Replace special characters with dots or hyphens, keep alphanumeric
  let code = prefix
    .replace(/[^a-z0-9._-]/g, '') // Remove invalid characters
    .replace(/[._-]+/g, '.') // Replace multiple dots/hyphens with single dot
    .replace(/^\.+|\.+$/g, ''); // Remove leading/trailing dots

  // Ensure code is not empty
  if (!code || code.length === 0) {
    code = 'user';
  }

  return code;
}

/**
 * Generates a unique referral code by appending random numbers if needed.
 * This should be called with a function that checks for uniqueness.
 */
export function generateUniqueReferralCode(
  baseCode: string,
  existingCodes: Set<string>,
  maxAttempts = 100,
): string {
  let code = baseCode.toLowerCase();
  let attempts = 0;

  // If code already exists, append random number
  while (existingCodes.has(code) && attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 10000);
    code = `${baseCode}${randomNum}`;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // Fallback: use timestamp
    code = `${baseCode}${Date.now().toString().slice(-6)}`;
  }

  return code;
}
