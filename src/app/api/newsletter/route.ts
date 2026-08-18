import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { sanitizeString } from '@/lib/security/sanitize';
import { verifyRequestOrigin } from '@/lib/security/csrfGuard';
import { isValidEmail } from '@/lib/security/validators';
import { logSecurityEvent } from '@/lib/security/auditLog';

export async function POST(req: Request) {
  try {
    const csrf = verifyRequestOrigin(req);
    if (!csrf.valid && csrf.response) return csrf.response;

    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`news_${clientIp}`, 5, 60 * 1000);
    if (!rate.allowed) {
      await logSecurityEvent({
        event_type: "RATE_LIMIT_EXCEEDED",
        ip_address: clientIp,
        endpoint: "/api/newsletter",
        details: "Exceeded max newsletter subscription attempts",
      });
      return NextResponse.json({ error: 'Too many subscription attempts. Please wait a minute.' }, { status: 429 });
    }

    const { email } = await req.json();
    const sanitizedEmail = sanitizeString(email);

    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      await logSecurityEvent({
        event_type: "SUSPICIOUS_INPUT",
        ip_address: clientIp,
        endpoint: "/api/newsletter",
        details: `Rejected invalid/disposable email: ${email}`,
      });
      return NextResponse.json({ error: 'Valid, non-disposable email is required' }, { status: 400 });
    }

    const cleanEmail = sanitizedEmail.trim().toLowerCase();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: cleanEmail }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already subscribed!' });
      }
      return NextResponse.json({ error: error.message || 'Subscription failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Subscription failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });

    if (error || !data) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
