import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/users
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    const supabase = createClient();
    
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    const { data, error } = await supabase.from('profiles').select('*');

    if (error || !data || data.length === 0) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([]);
  }
}

// POST /api/users (Create/Upsert Profile)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      email,
      full_name,
      avatar_url,
      role,
      phone,
      company_name,
      store_name,
      business_phone,
      tax_id,
      store_description,
    } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'id and email are required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const profilePayload: Record<string, any> = {
      id,
      email,
      full_name: full_name || email.split('@')[0],
      avatar_url: avatar_url || null,
      role: role || 'user',
      phone: phone || null,
      updated_at: new Date().toISOString(),
    };

    if (company_name) profilePayload.company_name = company_name;
    if (store_name) profilePayload.store_name = store_name;
    if (business_phone) profilePayload.business_phone = business_phone;
    if (tax_id) profilePayload.tax_id = tax_id;
    if (store_description) profilePayload.store_description = store_description;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/users (Update Own Profile Data - Excludes role & loyalty_points)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      full_name,
      avatar_url,
      phone,
      company_name,
      store_name,
      business_phone,
      tax_id,
      store_description,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updates.full_name = full_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (phone !== undefined) updates.phone = phone;
    if (company_name !== undefined) updates.company_name = company_name;
    if (store_name !== undefined) updates.store_name = store_name;
    if (business_phone !== undefined) updates.business_phone = business_phone;
    if (tax_id !== undefined) updates.tax_id = tax_id;
    if (store_description !== undefined) updates.store_description = store_description;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/users (Update Role or Specific Fields)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, role, loyalty_points } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (typeof loyalty_points === 'number') updates.loyalty_points = loyalty_points;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
