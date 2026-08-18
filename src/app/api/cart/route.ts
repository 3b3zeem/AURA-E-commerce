import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Public GET: Fetch current user's persistent cart items from Supabase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json([]);

    const supabase = createClient();
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) return NextResponse.json([]);
    return NextResponse.json(cartItems || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// User POST: Sync/Add item to user's cart
export async function POST(request: Request) {
  try {
    const { user_id, product_id, quantity, product } = await request.json();
    if (!user_id || !product_id) {
      return NextResponse.json({ error: 'user_id and product_id required' }, { status: 400 });
    }

    const supabase = createClient();

    // Ensure product exists in DB to satisfy foreign key constraint
    const { data: prodCheck } = await supabase.from('products').select('id').eq('id', product_id).single();
    if (!prodCheck && product) {
      await supabase.from('products').insert([{
        id: product_id,
        name: product.name || 'Sample Product',
        slug: product.slug || `prod-${Date.now()}`,
        price: product.price || 99,
        images: product.images || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
        stock: product.stock || 100,
      }]);
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .single();

    // Record entry in persistent cart_history table for smart recommendations (never deleted)
    try {
      await supabase.from('cart_history').insert([{
        user_id,
        product_id,
        category_name: product?.category?.name || product?.category || 'Electronics',
      }]);
    } catch {}

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: (existing.quantity || 1) + (quantity || 1), updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id, product_id, quantity: quantity || 1 }])
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// User DELETE: Remove item or clear cart
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    const supabase = createClient();
    if (id) {
      await supabase.from('cart_items').delete().eq('id', id);
    } else if (userId) {
      await supabase.from('cart_items').delete().eq('user_id', userId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
