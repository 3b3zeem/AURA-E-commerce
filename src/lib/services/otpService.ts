// Server-side Email & Identity OTP Service
interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP storage map keyed by clean email address
const globalOtpStore = new Map<string, OtpEntry>();

export function generateAndStoreOtp(email: string): { code: string; expiresAt: number } {
  const cleanEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // Expiration: 5 minutes

  globalOtpStore.set(cleanEmail, {
    code,
    expiresAt,
    attempts: 0,
  });

  return { code, expiresAt };
}

export function verifyOtpCode(email: string, inputCode: string): { valid: boolean; message?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const entry = globalOtpStore.get(cleanEmail);

  if (!entry) {
    return {
      valid: false,
      message: "No active OTP found for this email address. Please request a new code.",
    };
  }

  if (Date.now() > entry.expiresAt) {
    globalOtpStore.delete(cleanEmail);
    return {
      valid: false,
      message: "OTP code has expired (valid for 5 minutes). Please click resend.",
    };
  }

  if (entry.attempts >= 5) {
    globalOtpStore.delete(cleanEmail);
    return {
      valid: false,
      message: "Too many failed attempts. Please request a new OTP code.",
    };
  }

  if (entry.code !== inputCode.trim()) {
    entry.attempts += 1;
    return {
      valid: false,
      message: `Invalid OTP code. Please re-check the 6-digit code sent to ${cleanEmail}.`,
    };
  }

  // Successfully verified - clear OTP entry
  globalOtpStore.delete(cleanEmail);
  return { valid: true };
}
