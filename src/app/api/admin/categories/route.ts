import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth/adminGuard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) return NextResponse.json([]);
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const body = await request.json();
    const { name, description, image_url, is_featured, slug: customSlug } = body;
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const slug = customSlug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name,
        slug,
        description: description || '',
        image_url: image_url || '',
        is_featured: is_featured ?? false
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
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const body = await request.json();
    const { id, name, description, image_url, is_featured, slug: customSlug } = body;
    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const slug = customSlug || (name ? name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : undefined);

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
