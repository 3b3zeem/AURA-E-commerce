import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/categories
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*');

    if (error || !data) {
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([]);
  }
}

// POST /api/categories
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createClient();
    const slug = body.name.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: body.name, slug, description: body.description }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
