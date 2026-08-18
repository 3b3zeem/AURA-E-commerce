import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';
import { sanitizeObject } from '@/lib/security/sanitize';
import { verifyRequestOrigin } from '@/lib/security/csrfGuard';
import { isValidEgyptianPhone, isValidEmail } from '@/lib/security/validators';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });

    if (error || !data) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const csrf = verifyRequestOrigin(request);
    if (!csrf.valid && csrf.response) return csrf.response;

    const clientIp = getClientIp(request);
    const rate = checkRateLimit(`addr_${clientIp}`, 15, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many address updates. Please wait a minute.' }, { status: 429 });
    }

    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    if (body.phone && !isValidEgyptianPhone(body.phone)) {
      return NextResponse.json(
        { error: 'Invalid Egyptian phone number. Must be 11 digits starting with 010, 011, 012, or 015' },
        { status: 400 }
      );
    }

    if (body.email && !isValidEmail(body.email)) {
      return NextResponse.json({ error: 'Invalid or disposable email domain rejected.' }, { status: 400 });
    }

    const supabase = createClient();

    if (body.is_default && body.user_id) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', body.user_id);
    }

    const { data, error } = await supabase.from('addresses').insert(body).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const csrf = verifyRequestOrigin(request);
    if (!csrf.valid && csrf.response) return csrf.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('addresses').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const csrf = verifyRequestOrigin(request);
    if (!csrf.valid && csrf.response) return csrf.response;

    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);
    const { id, action, user_id, ...updates } = body;

    if (updates.phone && !isValidEgyptianPhone(updates.phone)) {
      return NextResponse.json(
        { error: 'Invalid Egyptian phone number. Must be 11 digits starting with 010, 011, 012, or 015' },
        { status: 400 }
      );
    }

    if (updates.email && !isValidEmail(updates.email)) {
      return NextResponse.json({ error: 'Invalid or disposable email domain rejected.' }, { status: 400 });
    }

    const supabase = createClient();

    if (action === 'set_default' && id) {
      if (user_id) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user_id);
      } else {
        await supabase.from('addresses').update({ is_default: false }).neq('id', id);
      }
      await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    if (updates.is_default) {
      if (user_id) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user_id);
      } else {
        await supabase.from('addresses').update({ is_default: false }).neq('id', id);
      }
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update address' }, { status: 500 });
  }
}
