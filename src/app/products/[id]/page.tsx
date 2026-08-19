import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/client';
import ProductClientPage from './ProductClientPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (!product) {
    return {
      title: 'Product Details | AURA Store',
      description: 'Explore high-fidelity tech hardware and smart audio gear at AURA Store.',
    };
  }

  const title = `${product.name} | AURA Store`;
  const description = product.description
    ? product.description.slice(0, 150)
    : `Buy ${product.name} at AURA Store. Fast delivery & 2-year warranty.`;
  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80';

  return {
    title,
    description,
    openGraph: {
      title: `${product.name} — AURA Store`,
      description: `${product.name} - ${description}`,
      url: `https://go-aura.vercel.app/products/${product.id}`,
      siteName: 'AURA Store',
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — AURA Store`,
      description,
      images: [mainImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <ProductClientPage productId={resolvedParams.id} />;
}
