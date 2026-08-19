import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { BlogPost } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    const supabase = createClient();
    let query = supabase
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.ilike('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Blogs query error:', error);
      return NextResponse.json([], { status: 200 });
    }

    let blogs: BlogPost[] = (data || []) as BlogPost[];

    if (search) {
      blogs = blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.summary.toLowerCase().includes(search) ||
          (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(search)))
      );
    }

    return NextResponse.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs from Supabase:', err);
    return NextResponse.json([], { status: 500 });
  }
}
