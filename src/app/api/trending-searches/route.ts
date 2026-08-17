import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// Fallback trending keywords if database table isn't populated yet
const DEFAULT_TRENDING = [
  'AURA CyberHeadset',
  'OLED Display',
  'Wireless Audio',
  'Smartwatch Pro',
  'VR Headset'
];

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('trending_searches')
      .select('query, search_count')
      .order('search_count', { ascending: false })
      .limit(5);

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_TRENDING);
    }

    return NextResponse.json(data.map((item) => item.query));
  } catch {
    return NextResponse.json(DEFAULT_TRENDING);
  }
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();
    const supabase = createClient();

    // Check if query exists
    const { data: existing } = await supabase
      .from('trending_searches')
      .select('id, search_count')
      .eq('query', cleanQuery)
      .single();

    if (existing) {
      await supabase
        .from('trending_searches')
        .update({ search_count: (existing.search_count || 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('trending_searches')
        .insert([{ query: cleanQuery, search_count: 1 }]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
