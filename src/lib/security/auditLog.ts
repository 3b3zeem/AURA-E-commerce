import { createClient } from "@/lib/supabase/client";

export interface SecurityEvent {
  event_type: "RATE_LIMIT_EXCEEDED" | "CSRF_ATTEMPT" | "COUPON_BRUTE_FORCE" | "SUSPICIOUS_INPUT" | "UNAUTHORIZED_ADMIN";
  ip_address: string;
  endpoint: string;
  details?: string;
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("security_logs").insert([
      {
        event_type: event.event_type,
        ip_address: event.ip_address,
        endpoint: event.endpoint,
        details: event.details || null,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("Failed to log security audit event:", err);
  }
}
