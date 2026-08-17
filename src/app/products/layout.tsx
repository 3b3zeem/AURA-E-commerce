import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse the full AURA catalog — headphones, gaming gear, mechanical keyboards, skincare, smart watches, and more. Filter by category and find your next upgrade.',
  openGraph: {
    title: 'Shop All Products | AURA Store',
    description: 'Browse premium tech and lifestyle products. Daily flash deals, exclusive drops, and AI-powered recommendations.',
    url: 'https://aura-store.vercel.app/products',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AURA Products Catalog' }],
  },
  alternates: {
    canonical: 'https://aura-store.vercel.app/products',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
