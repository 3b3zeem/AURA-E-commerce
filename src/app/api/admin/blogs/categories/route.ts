import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyAdmin } from '@/lib/auth/adminGuard';

export async function GET(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin) {
    return guard.response || NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const supabase = createClient();
    const { data: catData, error: catError } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true });

    if (!catError && catData) {
      return NextResponse.json(catData);
    }
    return NextResponse.json([]);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin) {
    return guard.response || NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const supabase = createClient();

    const { data, error } = await supabase
      .from('blog_categories')
      .insert([{ name: trimmedName, slug }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin) {
    return guard.response || NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: catData } = await supabase
      .from('blog_categories')
      .select('name, slug')
      .eq('id', id)
      .single();

    if (catData) {
      const { data: assignedBlogs } = await supabase
        .from('blogs')
        .select('id')
        .or(`category.ilike.${catData.name},category.ilike.${catData.slug}`)
        .limit(1);

      if (assignedBlogs && assignedBlogs.length > 0) {
        return NextResponse.json(
          { error: `Cannot delete category "${catData.name}" because it is currently assigned to blog articles.` },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase.from('blog_categories').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
