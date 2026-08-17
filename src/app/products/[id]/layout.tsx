import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = createClient();
    const { data: product } = await supabase
      .from("products")
      .select("name, description, image_url, price")
      .eq("id", id)
      .single();

    if (!product) {
      return { title: "Product Not Found" };
    }

    const title = product.name;
    const description = product.description
      ? product.description.slice(0, 155)
      : `Shop ${product.name} at AURA — premium quality guaranteed.`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | AURA Store`,
        description,
        url: `https://go-aura.vercel.app/products/${id}`,
        images: product.image_url
          ? [{ url: product.image_url, width: 800, height: 800, alt: title }]
          : [
              {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "AURA Store",
              },
            ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | AURA Store`,
        description,
        images: product.image_url ? [product.image_url] : ["/og-image.png"],
      },
      alternates: {
        canonical: `https://go-aura.vercel.app/products/${id}`,
      },
    };
  } catch {
    return { title: "Product | AURA Store" };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
