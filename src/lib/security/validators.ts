/**
 * Strict Phone & Email Security Validation
 */

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "trashmail.com",
  "dispostable.com",
  "sharklasers.com",
  "yopmail.com",
  "getnada.com",
  "throwawaymail.com",
  "tempail.com",
  "boun.cr",
  "fakeinbox.com",
  "maildrop.cc",
]);

export function isValidEgyptianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s-]/g, "");
  return /^01[0125]\d{8}$/.test(clean);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) return false;

  const domain = clean.split("@")[1];
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return false;
  }
  return true;
}
