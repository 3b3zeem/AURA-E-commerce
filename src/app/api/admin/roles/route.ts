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

    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (rolesError || !rolesData) {
      return NextResponse.json([]);
    }

    const { data: rpData } = await supabase
      .from('role_permissions')
      .select('role_code, permission_code');

    const mappedRoles = rolesData.map((role: any) => {
      const perms = (rpData || [])
        .filter((rp: any) => rp.role_code === role.code)
        .map((rp: any) => rp.permission_code);
      return { ...role, permissions: perms };
    });

    return NextResponse.json(mappedRoles);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const guard = await verifyPermission(request, "manage_roles");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { code, name, description, permissions } = await request.json();
    if (!code || !name) {
      return NextResponse.json({ error: 'Role code and name are required' }, { status: 400 });
    }

    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9_]+/g, '_');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: newRole, error } = await supabase
      .from('roles')
      .insert([{
        code: cleanCode,
        name,
        description: description || '',
        is_system: false
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (Array.isArray(permissions) && permissions.length > 0) {
      const permRows = permissions.map((pCode: string) => ({
        role_code: cleanCode,
        permission_code: pCode
      }));
      await supabase.from('role_permissions').insert(permRows);
    }

    return NextResponse.json({ ...newRole, permissions: permissions || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guard = await verifyPermission(request, "manage_roles");
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { code, name, description, permissions } = await request.json();
    if (!code) return NextResponse.json({ error: 'Role code required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const updates: any = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length > 0) {
      await supabase.from('roles').update(updates).eq('code', code);
    }

    if (Array.isArray(permissions)) {
      await supabase.from('role_permissions').delete().eq('role_code', code);
      if (permissions.length > 0) {
        const permRows = permissions.map((pCode: string) => ({
          role_code: code,
          permission_code: pCode
        }));
        await supabase.from('role_permissions').insert(permRows);
      }
    }

    return NextResponse.json({ success: true, code, permissions });
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
    if (!code) return NextResponse.json({ error: 'Role code required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('roles').delete().eq('code', code);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
