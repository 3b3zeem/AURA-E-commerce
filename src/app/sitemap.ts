import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://go-aura.vercel.app";
  const now = new Date();

  // Core static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/order-tracking`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamically include product pages for SEO indexing
  try {
    const supabase = createClient();
    const { data: products } = await supabase.from("products").select("id, updated_at");
    if (products && Array.isArray(products)) {
      const productRoutes: MetadataRoute.Sitemap = products.map((prod) => ({
        url: `${baseUrl}/products/${prod.id}`,
        lastModified: prod.updated_at ? new Date(prod.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
      routes.push(...productRoutes);
    }
  } catch (err) {
    console.error("Sitemap dynamic products fetch error:", err);
  }

  return routes;
}
