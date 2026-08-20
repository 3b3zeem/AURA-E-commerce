import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/admin/offers
export async function GET() {
  try {
    const supabase = createClient();
    const { data: dbOffers, error } = await supabase
      .from('offers')
      .select('*, offer_products(product_id)')
      .order('created_at', { ascending: false });

    if (error || !dbOffers) {
      return NextResponse.json([]);
    }

    const { data: allProducts } = await supabase.from('products').select('*');
    const prodsList = allProducts || [];

    const formatted = dbOffers.map((off: any) => {
      const pIds = off.offer_products ? off.offer_products.map((op: any) => op.product_id) : [];
      const attached = prodsList.filter((p: any) => pIds.includes(p.id));
      return { ...off, product_ids: pIds, products: attached };
    });
    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/admin/offers (Create new Offer bundle)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, description, badge, image_url, original_price, offer_price, product_ids, show_in_overlay, starts_at, ends_at } = body;

    if (!title || !offer_price) {
      return NextResponse.json({ error: 'Title and offer price are required' }, { status: 400 });
    }

    const origP = parseFloat(original_price || offer_price);
    const offP = parseFloat(offer_price);
    const discount = origP > offP ? Math.round(((origP - offP) / origP) * 100) : 0;

    const supabase = createClient();

    // If show_in_overlay is true, unset other overlays first
    if (show_in_overlay) {
      await supabase.from('offers').update({ show_in_overlay: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert([
        {
          title,
          subtitle: subtitle || null,
          description: description || null,
          badge: badge || 'SPECIAL OFFER',
          image_url: image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
          original_price: origP,
          offer_price: offP,
          discount_percentage: discount,
          is_active: true,
          show_in_overlay: !!show_in_overlay,
          starts_at: starts_at || null,
          ends_at: ends_at || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert selected product relations
    if (Array.isArray(product_ids) && product_ids.length > 0) {
      const rows = product_ids.map((pid: string) => ({ offer_id: newOffer.id, product_id: pid }));
      await supabase.from('offer_products').insert(rows);
    }
    return NextResponse.json({ ...newOffer, product_ids: product_ids || [] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/offers (Update Offer)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, description, badge, image_url, original_price, offer_price, product_ids, is_active, show_in_overlay, starts_at, ends_at } = body;

    if (!id) return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });

    const origP = parseFloat(original_price || offer_price);
    const offP = parseFloat(offer_price);
    const discount = origP > offP ? Math.round(((origP - offP) / origP) * 100) : 0;

    const supabase = createClient();

    if (show_in_overlay) {
      await supabase.from('offers').update({ show_in_overlay: false }).neq('id', id);
    }

    const { data: updated, error } = await supabase
      .from('offers')
      .update({
        title,
        subtitle,
        description,
        badge,
        image_url,
        original_price: origP,
        offer_price: offP,
        discount_percentage: discount,
        is_active,
        show_in_overlay,
        starts_at,
        ends_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (Array.isArray(product_ids)) {
      await supabase.from('offer_products').delete().eq('offer_id', id);
      if (product_ids.length > 0) {
        const rows = product_ids.map((pid: string) => ({ offer_id: id, product_id: pid }));
        await supabase.from('offer_products').insert(rows);
      }
    }
    return NextResponse.json({ ...updated, product_ids: product_ids || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/offers?id=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('offers').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/offers (Set specific offer as active overlay popup)
export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });

    const supabase = createClient();
    // Unset all, then set targeted
    await supabase.from('offers').update({ show_in_overlay: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('offers').update({ show_in_overlay: true, is_active: true }).eq('id', id);

    return NextResponse.json({ success: true, activeOverlayId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
