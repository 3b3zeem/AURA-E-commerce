import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

async function updateProductRatingStats(productId: string) {
  if (!productId) return;
  try {
    const supabase = createClient();
    const { data: revs } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (revs) {
      const count = revs.length;
      const avg =
        count > 0
          ? Number(
              (
                revs.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
                count
              ).toFixed(1)
            )
          : 0;

      await supabase
        .from('products')
        .update({
          rating_avg: avg,
          reviews_count: count,
        })
        .eq('id', productId);
    }
  } catch (err) {
    console.error('Failed to update product rating stats in Supabase:', err);
  }
}

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

    const formattedReviews = (reviews || []).map((rev: any) => ({
      ...rev,
      profile: Array.isArray(rev.profiles) ? rev.profiles[0] : (rev.profiles || rev.profile || null),
    }));

    return NextResponse.json(formattedReviews);
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
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const createdRecord = data && data.length > 0 ? data[0] : null;

    // Recalculate and update rating stats for product in Supabase DB
    await updateProductRatingStats(product_id);

    // Award +25 VIP Loyalty Points to the user in profiles table
    if (user_id && user_id !== 'guest') {
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('loyalty_points')
          .eq('id', user_id)
          .maybeSingle();

        const currentPts = userProfile?.loyalty_points || 0;
        await supabase
          .from('profiles')
          .update({ loyalty_points: currentPts + 25 })
          .eq('id', user_id);
      } catch (ptsErr) {
        console.error('Failed to update loyalty points for review:', ptsErr);
      }
    }

    return NextResponse.json(createdRecord);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// User PUT: Update an existing review
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const reviewId = body.review_id || body.id;
    const { rating, comment } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Missing review_id' }, { status: 400 });
    }

    const supabase = createClient();
    
    const updatePayload: Record<string, any> = {};
    if (rating !== undefined) updatePayload.rating = rating;
    if (comment !== undefined) updatePayload.comment = comment;

    const { data, error } = await supabase
      .from('reviews')
      .update(updatePayload)
      .eq('id', reviewId)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const updatedRecord = data && data.length > 0 ? data[0] : null;

    if (updatedRecord?.product_id) {
      await updateProductRatingStats(updatedRecord.product_id);
    }

    return NextResponse.json(updatedRecord || { success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// User DELETE: Delete a review
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId') || searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });
    }

    const supabase = createClient();

    // Get review product_id before deleting
    const { data: targetReview } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', reviewId)
      .maybeSingle();

    const productId = targetReview?.product_id;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (productId) {
      await updateProductRatingStats(productId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
