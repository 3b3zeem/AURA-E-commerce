import {
  Product,
  Category,
  Brand,
  Story,
  BentoItem,
  Offer,
} from "@/types";
import { getAdminHeaders } from "./authHeaders";

export function notifyDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aura_data_changed"));
  }
}

// ==========================================
// 1. PRODUCTS SERVICES (Public User & Admin)
// ==========================================

// Public GET for User
export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/products", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminProductsFromDb(): Promise<Product[]> {
  try {
    const res = await fetch("/api/admin/products", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id || p.slug === id) || null;
}

export async function createProductInDb(
  productData: Partial<Product>
): Promise<Product | null> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(productData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateProductInDb(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteProductInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 2. CATEGORIES SERVICES (Public User & Admin)
// ==========================================

// Public GET for User
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminCategoriesFromDb(): Promise<Category[]> {
  try {
    const res = await fetch("/api/admin/categories", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createCategoryInDb(
  categoryData: Partial<Category> | string,
  description?: string
): Promise<Category | null> {
  try {
    const payload =
      typeof categoryData === "string"
        ? { name: categoryData, description }
        : categoryData;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateCategoryInDb(
  id: string,
  updates: Partial<Category>
): Promise<Category | null> {
  try {
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteCategoryInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/categories?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 3. STORIES SERVICES (Public User & Admin)
// ==========================================

// Public GET for User
export async function getStories(): Promise<Story[]> {
  try {
    const res = await fetch("/api/stories", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminStoriesFromDb(): Promise<Story[]> {
  try {
    const res = await fetch("/api/admin/stories", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createStoryInDb(
  title: string,
  subtitle: string,
  imageUrl: string,
  productIds?: string[],
  bgGradient?: string,
  isActive: boolean = true
): Promise<Story | null> {
  try {
    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({
        title,
        subtitle,
        image_url: imageUrl,
        bg_gradient: bgGradient || 'from-yellow-950 via-stone-900 to-black',
        is_active: isActive,
        product_ids: productIds || [],
      }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateStoryInDb(
  id: string,
  updates: Partial<Story> & { product_ids?: string[] }
): Promise<Story | null> {
  try {
    const res = await fetch("/api/admin/stories", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteStoryInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/stories?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 4. OFFERS & BUNDLES SERVICES
// ==========================================

// Public GET for User
export async function getOffers(overlayOnly = false): Promise<Offer[]> {
  try {
    const url = overlayOnly ? "/api/offers?overlay=true" : "/api/offers";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminOffersFromDb(): Promise<Offer[]> {
  try {
    const res = await fetch("/api/admin/offers", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createOfferInDb(
  offerData: Partial<Offer>
): Promise<Offer | null> {
  try {
    const res = await fetch("/api/admin/offers", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(offerData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateOfferInDb(
  id: string,
  updates: Partial<Offer>
): Promise<Offer | null> {
  try {
    const res = await fetch("/api/admin/offers", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteOfferInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/offers?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function setOverlayFeaturedOffer(id: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/offers", {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ id }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 5. BENTO GRID SERVICES
// ==========================================

// Public GET for User
export async function getBentoItems(): Promise<BentoItem[]> {
  try {
    const res = await fetch("/api/bento", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminBentoItemsFromDb(): Promise<BentoItem[]> {
  try {
    const res = await fetch("/api/admin/bento", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createBentoItemInDb(
  item: Partial<BentoItem>
): Promise<BentoItem | null> {
  try {
    const res = await fetch("/api/admin/bento", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateBentoItemInDb(
  id: string,
  updates: Partial<BentoItem>
): Promise<BentoItem | null> {
  try {
    const res = await fetch("/api/admin/bento", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteBentoItemInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/bento?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return false;
    notifyDataChanged();
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// 6. BRANDS SERVICES
// ==========================================

// Public GET for User
export async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch("/api/brands", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminBrandsFromDb(): Promise<Brand[]> {
  try {
    const res = await fetch("/api/admin/brands", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createBrandInDb(brandData: { name: string; logo_url?: string; description?: string }): Promise<Brand | null> {
  try {
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(brandData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateBrandInDb(id: string, updates: Partial<Brand>): Promise<Brand | null> {
  try {
    const res = await fetch("/api/admin/brands", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteBrandInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/brands?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// AI REVIEWS SUMMARY & VISUAL SEARCH SERVICES
// ==========================================

export interface AIReviewSummaryResult {
  totalReviews: number;
  hasReviews?: boolean;
  recommendationRate: number;
  sentimentScore: number;
  aiVerdict: string;
  pros: string[];
  cons: string[];
  isAIPreview: boolean;
}

export async function fetchAIReviewSummary(
  productId: string
): Promise<AIReviewSummaryResult | null> {
  try {
    const res = await fetch("/api/ai-assistant/summarize-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

