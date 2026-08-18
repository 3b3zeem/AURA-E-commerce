/**
 * Input Sanitizer Utility
 * Sanitizes input strings and objects against XSS attacks, HTML injections, and malicious payloads.
 */

export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script> tags
    .replace(/on\w+="[^"]*"/gi, "") // Remove inline event handlers like onload="..."
    .replace(/javascript:[^\s"]*/gi, "") // Remove javascript: pseudo-protocol
    .trim();
}

export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeString(obj) as any;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as any;
  }

  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj as Record<string, any>)) {
    const val = (obj as Record<string, any>)[key];
    cleaned[key] = sanitizeObject(val);
  }
  return cleaned as T;
}
