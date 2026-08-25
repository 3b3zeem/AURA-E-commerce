import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyPermission } from '@/lib/auth/adminGuard';

export async function GET(req: Request) {
  const guard = await verifyPermission(req, "manage_brands");
  if (!guard.isAdmin) {
    return guard.response || NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) return NextResponse.json([]);
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const guard = await verifyPermission(req, "manage_brands");
  if (!guard.isAdmin) {
    return guard.response || NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .insert([{ name: body.name, logo_url: body.logo_url || null, description: body.description || null }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const guard = await verifyPermission(req, "manage_brands");
  if (!guard.isAdmin) {
    return guard.response || NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'Brand ID and Name are required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .update({ name: body.name, logo_url: body.logo_url, description: body.description, is_active: body.is_active })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const guard = await verifyPermission(req, "manage_brands");
  if (!guard.isAdmin) {
    return guard.response || NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Brand ID required' }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase.from('brands').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
