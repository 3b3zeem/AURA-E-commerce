import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/client';
import BlogClientPage from './BlogClientPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (!blog) {
    return {
      title: 'Article Details | AURA Journal',
      description: 'Read hardware insights, audio engineering guides, and release notes on AURA Journal.',
    };
  }

  const title = `${blog.title} | AURA Journal`;
  const description = blog.summary
    ? blog.summary.slice(0, 160)
    : `Read ${blog.title} on AURA Journal. Tech hardware & planar audio insights.`;
  const coverImage =
    blog.cover_image ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';

  return {
    title,
    description,
    openGraph: {
      title: `${blog.title} — AURA Journal`,
      description,
      url: `https://go-aura.vercel.app/blogs/${blog.id}`,
      siteName: 'AURA Journal',
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: 'article',
      authors: blog.author_name ? [blog.author_name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blog.title} — AURA Journal`,
      description,
      images: [coverImage],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BlogClientPage blogId={resolvedParams.id} />;
}
