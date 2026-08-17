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
