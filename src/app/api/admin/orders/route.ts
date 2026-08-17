import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyAdmin } from '@/lib/auth/adminGuard';

// READ ALL ORDERS
export async function GET() {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const supabase = createClient();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json([]);
    return NextResponse.json(orders || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// UPDATE ORDER STATUS / TRACKING
export async function PATCH(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { id, status, tracking_number } = await request.json();
    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (tracking_number) updates.tracking_number = tracking_number;

    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE ORDER
export async function DELETE(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
