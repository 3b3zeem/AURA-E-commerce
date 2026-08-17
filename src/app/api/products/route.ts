import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/products
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)');

    if (error || !data) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([]);
  }
}

// POST /api/products (Insert new product to Supabase DB)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: body.name,
          slug: body.name?.toLowerCase().replace(/\s+/g, '-'),
          description: body.description,
          price: body.price,
          original_price: body.original_price || null,
          category_id: body.category_id,
          images: body.images || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
          specs: body.specs || { Brand: 'AURA', Warranty: '2 Years' },
          variants: body.variants || [],
          stock: body.stock || 25,
          is_featured: body.is_featured ?? true,
          is_flash_deal: body.is_flash_deal ?? false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products (Delete product by ID)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
