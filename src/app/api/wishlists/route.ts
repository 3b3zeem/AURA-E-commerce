import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Public GET: Fetch current user's wishlist
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json([]);

    const supabase = createClient();
    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) return NextResponse.json([]);
    return NextResponse.json(wishlists || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// User POST: Add product to wishlist
export async function POST(request: Request) {
  try {
    const { user_id, product_id, product } = await request.json();
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

    const { data, error } = await supabase
      .from('wishlists')
      .insert([{ user_id, product_id }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// User DELETE: Remove product from wishlist
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    const supabase = createClient();
    if (id) {
      await supabase.from('wishlists').delete().eq('id', id);
    } else if (userId && productId) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
