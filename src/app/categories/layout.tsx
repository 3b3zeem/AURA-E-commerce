import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Explore curated product categories at AURA — Audio, Mechanical Keyboards, Gaming Battlestations, Skincare, and Smart Tech.',
  openGraph: {
    title: 'Explore Categories | AURA Store',
    description: 'Browse specialized tech and lifestyle collections.',
    url: 'https://go-aura.vercel.app/categories',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AURA Product Categories' }],
  },
  alternates: {
    canonical: 'https://go-aura.vercel.app/categories',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
