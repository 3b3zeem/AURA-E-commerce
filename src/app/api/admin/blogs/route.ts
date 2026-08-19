import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { BlogPost } from '@/types';

const ADMIN_KEY = 'aura-admin-token';

function checkAdminPermission(request: Request) {
  const adminHeader = request.headers.get('x-admin-key');
  return adminHeader === ADMIN_KEY;
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAdminPermission(request)) {
    return NextResponse.json({ error: 'Unauthorized admin request' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, summary, content, cover_image, category, author_name, author_avatar, read_time_minutes, tags, is_featured } = body;

    if (!title || !summary || !content || !cover_image) {
      return NextResponse.json({ error: 'Missing required blog fields' }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newBlog: Partial<BlogPost> = {
      title,
      slug: generatedSlug,
      summary,
      content,
      cover_image,
      category: category || 'Tech',
      author_name: author_name || 'AURA Team',
      author_avatar: author_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      read_time_minutes: Number(read_time_minutes) || 5,
      published_at: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : ['Tech'],
      is_featured: Boolean(is_featured),
    };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .insert([newBlog])
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

export async function PUT(request: Request) {
  if (!checkAdminPermission(request)) {
    return NextResponse.json({ error: 'Unauthorized admin request' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t: string) => t.trim());
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAdminPermission(request)) {
    return NextResponse.json({ error: 'Unauthorized admin request' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase.from('blogs').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
