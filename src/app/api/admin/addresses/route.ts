import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyAdmin } from '@/lib/auth/adminGuard';

// READ ALL ADDRESSES (Admin)
export async function GET() {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const supabase = createClient();
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json([]);
    return NextResponse.json(addresses || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

// CREATE ADDRESS (Admin)
export async function POST(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const body = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('addresses')
      .insert([body])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE ADDRESS (Admin)
export async function PUT(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: 'Address ID required' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE ADDRESS (Admin)
export async function DELETE(request: Request) {
  const guard = await verifyAdmin();
  if (!guard.isAdmin) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Address ID required' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('addresses').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
