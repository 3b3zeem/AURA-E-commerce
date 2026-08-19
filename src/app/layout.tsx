import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((mod) => mod.CartDrawer)
);
const AIChatWidget = dynamic(
  () => import("@/components/ai/AIChatWidget").then((mod) => mod.AIChatWidget)
);
const OfferOverlayModal = dynamic(
  () => import("@/components/home/OfferOverlayModal").then((mod) => mod.OfferOverlayModal)
);

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://go-aura.vercel.app"),
  title: {
    default: "AURA | Premium Tech & Lifestyle Store",
    template: "%s | AURA Store",
  },
  description:
    "Shop premium tech, audio, gaming, and lifestyle products at AURA. Powered by AI-driven recommendations, curated collections, and exclusive flash deals.",
  keywords: [
    "AURA store",
    "premium tech",
    "headphones",
    "gaming gear",
    "skincare",
    "mechanical keyboards",
    "smart watches",
    "online shopping Egypt",
    "flash deals",
    "curated tech",
  ],
  authors: [{ name: "AURA Team" }],
  creator: "AURA",
  publisher: "AURA",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://go-aura.vercel.app",
    siteName: "AURA Store",
    title: "AURA | Premium Tech & Lifestyle Store",
    description:
      "Shop premium tech, audio, gaming, and lifestyle products at AURA. AI-powered recommendations & exclusive flash deals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AURA Premium Tech & Lifestyle Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AURA | Premium Tech & Lifestyle Store",
    description: "Shop premium tech, audio, gaming, and lifestyle at AURA.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Script
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AURA Store",
              url: "https://go-aura.vercel.app",
              logo: "https://go-aura.vercel.app/icon.png",
              description:
                "Premium Tech & Lifestyle Store powered by AI recommendations.",
              sameAs: [],
            }),
          }}
        />
        <QueryProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <AIChatWidget />
          <OfferOverlayModal />
        </QueryProvider>
      </body>
    </html>
  );
}
