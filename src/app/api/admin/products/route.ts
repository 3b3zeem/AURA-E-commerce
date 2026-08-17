import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth/adminGuard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// READ
export async function GET(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json([]);
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// CREATE
export async function POST(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const body = await request.json();
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const slug = body.slug || (body.name ? body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`);

    const payload: any = {
      name: body.name,
      slug,
      description: body.description || '',
      price: parseFloat(body.price) || 0,
      original_price: body.original_price ? parseFloat(body.original_price) : null,
      stock: parseInt(body.stock) || 10,
      category_id: body.category_id || null,
      images: Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []),
      is_featured: body.is_featured ?? false,
      is_flash_deal: body.is_flash_deal ?? false,
      badge: body.badge || null,
    };

    let { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error && error.message?.includes("'badge' column")) {
      delete payload.badge;
      const retry = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE
export async function PUT(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const sanitizeUpdates = (obj: any) => {
      const allowed = [
        'name', 'slug', 'description', 'price', 'original_price', 'stock',
        'category_id', 'images', 'is_featured', 'is_flash_deal', 'flash_deal_ends_at',
        'badge', 'specs', 'variants', 'rating_avg', 'reviews_count', 'updated_at'
      ];
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        if (allowed.includes(key) && obj[key] !== undefined) {
          cleaned[key] = obj[key];
        }
      }
      return cleaned;
    };

    let cleanedUpdates = sanitizeUpdates(updates);
    cleanedUpdates.updated_at = new Date().toISOString();

    let { data, error } = await supabase
      .from('products')
      .update(cleanedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.message?.includes("'badge' column")) {
      delete cleanedUpdates.badge;
      const retry = await supabase
        .from('products')
        .update(cleanedUpdates)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
