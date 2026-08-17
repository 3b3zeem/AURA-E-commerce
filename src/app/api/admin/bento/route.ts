import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth/adminGuard';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// GET ADMIN BENTO ITEMS
export async function GET(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('bento_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

// POST CREATE / UPDATE BENTO ITEM
export async function POST(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const body = await request.json();
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const payload = {
      box_type: body.box_type,
      title: body.title,
      subtitle: body.subtitle || null,
      description: body.description || null,
      badge_text: body.badge_text || null,
      badge_icon: body.badge_icon || null,
      image_url: body.image_url || null,
      cta_text: body.cta_text || 'SHOP NOW',
      cta_link: body.cta_link || '/products',
      discount_percentage: body.discount_percentage ? parseInt(body.discount_percentage) : null,
      display_order: body.display_order ? parseInt(body.display_order) : 1,
      is_active: body.is_active ?? true,
    };

    // Only treat as UPDATE if id looks like a real UUID
    const isRealUUID = body.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id);

    if (isRealUUID) {
      const { data, error } = await supabase
        .from('bento_items')
        .update(payload)
        .eq('id', body.id)
        .select()
        .single();

      if (error) {
        console.error('[Bento UPDATE error]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('bento_items')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('[Bento INSERT error]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error('[Bento POST error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// DELETE BENTO ITEM
export async function DELETE(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('bento_items').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
