import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your selected AURA products before checkout.',
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
