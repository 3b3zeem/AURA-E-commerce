import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bento_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([]);
  }
}
