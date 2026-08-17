import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// GET /api/users
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles').select('*');

    if (error || !data || data.length === 0) {
      return NextResponse.json([
        {
          id: 'usr-admin-1',
          email: 'admin@aura.com',
          full_name: 'System Admin',
          role: 'admin',
          loyalty_points: 1500,
          created_at: new Date().toISOString(),
        },
      ]);
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([]);
  }
}

// POST /api/users (Create/Upsert Profile)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email, full_name, role } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'id and email are required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: full_name || email.split('@')[0],
        role: role || 'customer',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/users (Update Role or Profile)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
