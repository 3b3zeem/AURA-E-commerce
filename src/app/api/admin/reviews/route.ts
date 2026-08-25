import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyAdmin } from '@/lib/auth/adminGuard';

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

// READ ALL REVIEWS (Admin Moderation)
export async function GET() {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const supabase = createClient();
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, products(name), profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json([]);
    return NextResponse.json(reviews || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// CREATE REVIEW (Admin)
export async function POST(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const body = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('reviews')
      .insert([body])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    const createdRecord = data && data.length > 0 ? data[0] : null;
    if (createdRecord?.product_id) {
      await updateProductRatingStats(createdRecord.product_id);
    }

    return NextResponse.json(createdRecord);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE / APPROVE REVIEW (Admin)
export async function PUT(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const body = await request.json();
    const { id, rating, comment, is_approved } = body;
    if (!id) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });

    const supabase = createClient();
    
    // Build update object safely with existing columns
    const updateFields: Record<string, any> = {};
    if (rating !== undefined) updateFields.rating = rating;
    if (comment !== undefined) updateFields.comment = comment;

    const { data, error } = await supabase
      .from('reviews')
      .update(updateFields)
      .eq('id', id)
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

// DELETE REVIEW (Admin)
export async function DELETE(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });

    const supabase = createClient();

    // Fetch review first to get product_id
    const { data: rev } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', id)
      .maybeSingle();

    const productId = rev?.product_id;

    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (productId) {
      await updateProductRatingStats(productId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
