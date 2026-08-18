import crypto from "crypto";

/**
 * Obfuscate sensitive IDs (like order UUIDs or user IDs) into non-predictable tracking codes
 */

const SECRET_SALT = process.env.SECURITY_SALT || "AURA_SECURE_TOKEN_2026_SALT";

export function generateSecureOrderToken(rawId: string): string {
  if (!rawId) return "";
  const hash = crypto.createHmac("sha256", SECRET_SALT).update(rawId).digest("hex");
  const prefix = rawId.slice(0, 4).toUpperCase();
  const tokenBody = hash.slice(0, 8).toUpperCase();
  return `AURA-${prefix}-${tokenBody}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.com";
  const [name, domain] = email.split("@");
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}*`;
  return `${maskedName}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return "***";
  const clean = phone.trim();
  if (clean.length < 7) return "***";
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}
