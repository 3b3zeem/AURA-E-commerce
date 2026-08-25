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
      .from('permissions')
      .select('*')
      .order('module', { ascending: true });

    if (error || !data) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const guard = await verifyPermission(request, "manage_roles");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { code, name, module, description } = await request.json();
    if (!code || !name || !module) {
      return NextResponse.json({ error: 'Permission code, name, and module are required' }, { status: 400 });
    }

    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9_.]+/g, '_');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('permissions')
      .insert([{
        code: cleanCode,
        name,
        module,
        description: description || '',
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guard = await verifyPermission(request, "manage_roles");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { code, name, module, description } = await request.json();
    if (!code) return NextResponse.json({ error: 'Permission code required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const updates: any = {};
    if (name) updates.name = name;
    if (module) updates.module = module;
    if (description !== undefined) updates.description = description;

    const { data, error } = await supabase
      .from('permissions')
      .update(updates)
      .eq('code', code)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await verifyPermission(request, "manage_roles");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'Permission code required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('permissions').delete().eq('code', code);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
