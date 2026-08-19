import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();

    const { data: catData, error: catError } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true });

    if (!catError && catData) {
      return NextResponse.json(catData);
    }

    // Fallback: extract from blogs table if blog_categories table is empty
    const { data: blogData } = await supabase
      .from('blogs')
      .select('category');

    const uniqueNames = Array.from(
      new Set((blogData || []).map((b: { category: string }) => b?.category?.trim()).filter(Boolean))
    );

    const fallbackCats = uniqueNames.map((name, idx) => ({
      id: `cat_${idx}`,
      name,
      slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));

    return NextResponse.json(fallbackCats);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Check if category is used in any blog post before deleting
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
