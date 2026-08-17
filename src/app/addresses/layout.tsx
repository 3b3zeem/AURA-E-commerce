import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Addresses',
  description: 'Manage your saved delivery addresses at AURA.',
  robots: { index: false, follow: false },
};

export default function AddressesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
