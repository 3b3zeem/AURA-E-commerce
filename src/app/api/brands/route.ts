import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/brands - Fetch all brands from Supabase
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json([]);
  }
}

// POST /api/brands - Create a new brand in Supabase
export async function POST(req: Request) {
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

// PUT /api/brands - Update a brand
export async function PUT(req: Request) {
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

// DELETE /api/brands?id=xyz - Delete a brand
export async function DELETE(req: Request) {
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
