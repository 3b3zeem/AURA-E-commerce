import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, verifyPermission } from '@/lib/auth/adminGuard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json([]);
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await verifyPermission(request, "manage_users");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const {
      email,
      full_name,
      role,
      phone,
      loyalty_points,
      company_name,
      store_name,
      business_phone,
      tax_id,
      store_description,
    } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const userId = `usr-${Date.now()}`;
    const newProfile: Record<string, any> = {
      id: userId,
      email,
      full_name: full_name || email.split('@')[0],
      role: role || 'user',
      phone: phone || null,
      loyalty_points: typeof loyalty_points === 'number' ? loyalty_points : 100,
      company_name: company_name || null,
      store_name: store_name || null,
      business_phone: business_phone || null,
      tax_id: tax_id || null,
      store_description: store_description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || newProfile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guard = await verifyPermission(request, "manage_users");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const {
      id,
      email,
      full_name,
      role,
      phone,
      loyalty_points,
      company_name,
      store_name,
      business_phone,
      tax_id,
      store_description,
    } = await request.json();
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (email) updates.email = email;
    if (full_name !== undefined) updates.full_name = full_name;
    if (role) updates.role = role;
    if (phone !== undefined) updates.phone = phone;
    if (typeof loyalty_points === 'number') updates.loyalty_points = loyalty_points;
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || { success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const guard = await verifyPermission(request, "manage_users");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { userId, role, loyalty_points, custom_permissions } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (typeof loyalty_points === 'number') updates.loyalty_points = loyalty_points;
    if (Array.isArray(custom_permissions)) updates.custom_permissions = custom_permissions;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await verifyPermission(request, "manage_users");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
