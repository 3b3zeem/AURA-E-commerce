import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyAdmin } from '@/lib/auth/adminGuard';

export async function GET() {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('trending_searches')
      .select('*')
      .order('search_count', { ascending: false });

    if (error) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();
    const supabase = createClient();

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { id, query, search_count } = await request.json();
    if (!id || !query) return NextResponse.json({ error: 'Missing ID or Query' }, { status: 400 });

    const supabase = createClient();
    const updates: Record<string, any> = { query: query.trim(), updated_at: new Date().toISOString() };
    if (typeof search_count === 'number') updates.search_count = search_count;

    const { data, error } = await supabase
      .from('trending_searches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || { success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const supabase = createClient();
    await supabase.from('trending_searches').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
