import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { UserAddress } from '@/types';

// In-memory fallback array for addresses if table doesn't exist yet
let MEMORY_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-1',
    user_id: 'usr-default',
    full_name: 'Ahmed Mostafa',
    street_address: 'شارع رشيد بجوار مدرسة الصنايع',
    building_no: '1111',
    city: 'Minya El Qamh',
    state_region: 'Ash Sharqia',
    zip_code: '44711',
    country: 'Egypt',
    phone_number: '+201011654789',
    delivery_instructions: 'Deliver to front door',
    is_default: true,
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json(MEMORY_ADDRESSES);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(MEMORY_ADDRESSES);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();

    const newAddress: UserAddress = {
      id: `addr-${Date.now()}`,
      user_id: body.user_id || 'usr-default',
      full_name: body.full_name || 'Guest User',
      street_address: body.street_address || '',
      building_no: body.building_no || '',
      city: body.city || '',
      state_region: body.state_region || '',
      zip_code: body.zip_code || '',
      country: body.country || 'Egypt',
      phone_number: body.phone_number || '',
      delivery_instructions: body.delivery_instructions || '',
      is_default: body.is_default || false,
      created_at: new Date().toISOString(),
    };

    if (newAddress.is_default) {
      MEMORY_ADDRESSES = MEMORY_ADDRESSES.map((a) => ({ ...a, is_default: false }));
    }

    MEMORY_ADDRESSES.unshift(newAddress);

    // Attempt Supabase insert
    try {
      await supabase.from('addresses').insert(newAddress);
    } catch {
      // Continue with MEMORY_ADDRESSES return
    }

    return NextResponse.json(newAddress, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    MEMORY_ADDRESSES = MEMORY_ADDRESSES.filter((a) => a.id !== id);

    try {
      const supabase = createClient();
      await supabase.from('addresses').delete().eq('id', id);
    } catch {
      // Ignore fallback
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (action === 'set_default' && id) {
      MEMORY_ADDRESSES = MEMORY_ADDRESSES.map((a) => ({
        ...a,
        is_default: a.id === id,
      }));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}
