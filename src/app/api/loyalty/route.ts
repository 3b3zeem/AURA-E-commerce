import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Public GET: Fetch current user's loyalty points and history log
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ points: 0, logs: [] });

    const supabase = createClient();
    const [profileRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('loyalty_points').eq('id', userId).single(),
      supabase.from('loyalty_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      points: profileRes.data?.loyalty_points || 0,
      logs: logsRes.data || [],
    });
  } catch {
    return NextResponse.json({ points: 0, logs: [] }, { status: 500 });
  }
}

// Public POST: User redeems points
export async function POST(request: Request) {
  try {
    const { user_id, points, points_type, reason } = await request.json();
    if (!user_id || typeof points !== 'number') {
      return NextResponse.json({ error: 'user_id and points required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('loyalty_logs')
      .insert([{ user_id, points, points_type: points_type || 'redeemed', reason: reason || 'Redeemed Reward' }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: profile } = await supabase.from('profiles').select('loyalty_points').eq('id', user_id).single();
    const currentPoints = profile?.loyalty_points || 0;
    const absPoints = Math.abs(points);
    const newTotal = Math.max(0, currentPoints - absPoints);

    await supabase.from('profiles').update({ loyalty_points: newTotal }).eq('id', user_id);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
