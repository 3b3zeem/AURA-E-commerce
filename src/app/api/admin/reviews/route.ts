import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyAdmin } from '@/lib/auth/adminGuard';

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
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE / APPROVE REVIEW (Admin)
export async function PUT(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { id, is_approved, rating, comment } = await request.json();
    if (!id) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
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
    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
