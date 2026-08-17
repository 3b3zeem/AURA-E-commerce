import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Public GET: Fetch approved reviews for a product or all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const supabase = createClient();
    let query = supabase.from('reviews').select('*, profiles(full_name, avatar_url)');

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: reviews, error } = await query.order('created_at', { ascending: false });

    if (error) return NextResponse.json([]);
    return NextResponse.json(reviews || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// User POST: Submit a product review
export async function POST(request: Request) {
  try {
    const { product_id, user_id, rating, comment } = await request.json();
    if (!product_id || !user_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id, user_id, rating, comment }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Award +25 VIP Loyalty Points to the user in profiles table
    if (user_id && user_id !== 'guest') {
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('loyalty_points')
          .eq('id', user_id)
          .single();

        const currentPts = userProfile?.loyalty_points || 0;
        await supabase
          .from('profiles')
          .update({ loyalty_points: currentPts + 25 })
          .eq('id', user_id);
      } catch (ptsErr) {
        console.error('Failed to update loyalty points for review:', ptsErr);
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
