import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyAdmin } from '@/lib/auth/adminGuard';

// READ ALL LOYALTY LOGS (Admin)
export async function GET() {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const supabase = createClient();
    const { data: logs, error } = await supabase
      .from('loyalty_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json([]);
    return NextResponse.json(logs || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// CREATE LOYALTY LOG (Admin award/deduct points)
export async function POST(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { user_id, points, points_type, reason } = await request.json();
    if (!user_id || typeof points !== 'number') {
      return NextResponse.json({ error: 'user_id and points required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('loyalty_logs')
      .insert([{ user_id, points, points_type: points_type || 'earned', reason: reason || 'Admin Award' }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update profile loyalty_points sum
    const { data: profile } = await supabase.from('profiles').select('loyalty_points').eq('id', user_id).single();
    const currentPoints = profile?.loyalty_points || 0;
    const newTotal = points_type === 'redeemed' ? Math.max(0, currentPoints - points) : currentPoints + points;

    await supabase.from('profiles').update({ loyalty_points: newTotal }).eq('id', user_id);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE LOYALTY LOG (Admin)
export async function DELETE(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Log ID required' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('loyalty_logs').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
