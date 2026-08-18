import { NextResponse } from "next/server";

export function verifyRequestOrigin(request: Request): { valid: boolean; response?: NextResponse } {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // If request has an origin header, verify it matches the current host or domain
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return {
          valid: false,
          response: NextResponse.json(
            { error: "Forbidden: Cross-Site Origin Mismatch" },
            { status: 403 }
          ),
        };
      }
    } catch {
      return {
        valid: false,
        response: NextResponse.json(
          { error: "Forbidden: Invalid Origin Header" },
          { status: 403 }
        ),
      };
    }
  }

  return { valid: true };
}
