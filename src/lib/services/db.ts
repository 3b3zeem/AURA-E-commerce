import { Product, Category, Story, Profile, BentoItem, Offer, NewsletterSubscriber } from "@/types";

const ADMIN_HEADERS = {
  "x-admin-key": "aura-admin-token",
  "Content-Type": "application/json",
};

export function notifyDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aura_data_changed"));
  }
}

// ==========================================
// 1. PRODUCTS SERVICES (Public & Admin)
// ==========================================

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

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id || p.slug === id) || null;
}

export async function createProductInDb(
  productData: Partial<Product>,
): Promise<Product | null> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: ADMIN_HEADERS,
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
  updates: Partial<Product>,
): Promise<Product | null> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 2. CATEGORIES SERVICES (Public & Admin)
// ==========================================

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

export async function createCategoryInDb(
  categoryData: Partial<Category> | string,
  description?: string,
): Promise<Category | null> {
  try {
    const payload = typeof categoryData === "string"
      ? { name: categoryData, description }
      : categoryData;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: ADMIN_HEADERS,
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
  updates: Partial<Category>,
): Promise<Category | null> {
  try {
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 3. STORIES SERVICES (Public & Admin)
// ==========================================

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

export async function createStoryInDb(
  title: string,
  subtitle: string,
  imageUrl: string,
): Promise<Story | null> {
  try {
    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ title, subtitle, image_url: imageUrl }),
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
  updates: Partial<Story>,
): Promise<Story | null> {
  try {
    const res = await fetch("/api/admin/stories", {
      method: "PUT",
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 4. USERS & PROFILES SERVICES (Admin & Public)
// ==========================================

export async function getUsersFromDb(): Promise<Profile[]> {
  try {
    const res = await fetch("/api/admin/users", { cache: "no-store", headers: ADMIN_HEADERS });
    if (!res.ok) {
      const fallback = await fetch("/api/users", { cache: "no-store" });
      if (!fallback.ok) return [];
      const data = await fallback.json();
      return Array.isArray(data) ? data : [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function updateUserRoleInDb(
  userId: string,
  role: "customer" | "admin",
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function createUserInDb(userData: any): Promise<Profile | null> {
  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(userData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateUserInDb(userData: any): Promise<Profile | null> {
  try {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(userData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteUserInDb(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/users?id=${userId}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 5. ADDRESSES SERVICES (Public User & Admin)
// ==========================================

export async function getUserAddresses(): Promise<any[]> {
  try {
    const res = await fetch("/api/addresses", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAdminAddresses(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/addresses", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createUserAddress(addressData: any): Promise<any | null> {
  try {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(addressData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateUserAddress(addressData: any): Promise<any | null> {
  try {
    const res = await fetch("/api/addresses", {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(addressData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteUserAddress(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function setDefaultUserAddress(id: string): Promise<boolean> {
  try {
    const res = await fetch("/api/addresses", {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ id, action: "set_default" }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function createAdminAddress(addressData: any): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/addresses", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(addressData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateAdminAddress(addressData: any): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/addresses", {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(addressData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteAdminAddress(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/addresses?id=${id}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 6. ORDERS SERVICES (Public Customer & Admin)
// ==========================================

export async function getOrdersFromDb(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/orders", { cache: "no-store", headers: ADMIN_HEADERS });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getUserOrders(userId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/orders?userId=${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createOrderInDb(orderData: any): Promise<any | null> {
  try {
    console.log("Sending POST /api/orders payload:", orderData);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    console.log("POST /api/orders response status:", res.status);
    if (!res.ok) {
      const errText = await res.text();
      console.error("POST /api/orders failed:", res.status, errText);
      return null;
    }
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch (err) {
    console.error("createOrderInDb fetch exception:", err);
    return null;
  }
}

export async function updateOrderStatusInDb(
  id: string,
  status: string,
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteOrderInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/orders?id=${id}`, { method: "DELETE", headers: ADMIN_HEADERS });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 7. TRENDING SEARCHES SERVICES (Public & Admin)
// ==========================================

export async function getTrendingSearchesFromDb(): Promise<any[]> {
  try {
    const res = await fetch("/api/trending-searches", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAdminTrendingSearches(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/trending-searches", {
      cache: "no-store",
      headers: ADMIN_HEADERS,
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function recordSearchQuery(query: string): Promise<boolean> {
  try {
    const res = await fetch("/api/trending-searches", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ query }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function addAdminTrendingSearch(query: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/trending-searches", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ query }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateAdminTrendingSearch(
  id: string,
  query: string,
  search_count?: number
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/trending-searches", {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ id, query, search_count }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteTrendingSearch(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/trending-searches?id=${id}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 8. REVIEWS SERVICES (Public Customer & Admin)
// ==========================================

export async function getReviewsFromDb(productId?: string): Promise<any[]> {
  try {
    const url = productId
      ? `/api/reviews?productId=${productId}`
      : "/api/reviews";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAdminReviewsFromDb(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/reviews", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createReviewInDb(reviewData: any): Promise<any | null> {
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function approveReviewInDb(
  id: string,
  is_approved: boolean,
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ id, is_approved }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteReviewInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/reviews?id=${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 9. WISHLISTS & CART SERVICES (Public Customer)
// ==========================================

export async function getUserWishlist(userId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/wishlists?userId=${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function addToWishlistInDb(
  userId: string,
  productId: string,
): Promise<any | null> {
  try {
    const res = await fetch("/api/wishlists", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ user_id: userId, product_id: productId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function removeFromWishlistInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/wishlists?id=${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getUserCartFromDb(userId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/cart?userId=${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function syncCartItemToDb(
  userId: string,
  productId: string,
  quantity: number,
): Promise<any | null> {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        quantity,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteCartItemFromDb(
  id?: string,
  userId?: string,
): Promise<boolean> {
  try {
    const url = id ? `/api/cart?id=${id}` : `/api/cart?userId=${userId}`;
    const res = await fetch(url, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 10. LOYALTY SERVICES (Public Customer & Admin)
// ==========================================

export async function getUserLoyaltyInfo(
  userId: string,
): Promise<{ points: number; logs: any[] }> {
  try {
    const res = await fetch(`/api/loyalty?userId=${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return { points: 0, logs: [] };
    return await res.json();
  } catch {
    return { points: 0, logs: [] };
  }
}

export async function awardLoyaltyPointsAdmin(
  userId: string,
  points: number,
  points_type: string,
  reason: string,
): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/loyalty-logs", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ user_id: userId, points, points_type, reason }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ==========================================
// 11. BENTO GRID SERVICES (Public & Admin)
// ==========================================

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

export async function createBentoItemInDb(
  item: Partial<BentoItem>,
): Promise<BentoItem | null> {
  try {
    const res = await fetch("/api/admin/bento", {
      method: "POST",
      headers: ADMIN_HEADERS,
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
  updates: Partial<BentoItem>,
): Promise<BentoItem | null> {
  try {
    const res = await fetch("/api/admin/bento", {
      method: "POST",
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
    });
    if (!res.ok) return false;
    notifyDataChanged();
    return true;
  } catch {
    return false;
  }
}

// PROMO CODES HELPERS
export async function getAdminPromoCodes(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/promo-codes", {
      headers: ADMIN_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function verifyPromoCode(code: string): Promise<{ success: boolean; promo?: any; message?: string }> {
  try {
    const res = await fetch(`/api/promo-codes?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, promo: data.promo };
    }
    return { success: false, message: data.message || "Invalid promo code" };
  } catch {
    return { success: false, message: "Error verifying promo code" };
  }
}

export async function createAdminPromoCode(promoData: { code: string; discount_percent: number; is_active?: boolean }): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(promoData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateAdminPromoCode(promoData: { id: string; code?: string; discount_percent?: number; is_active?: boolean }): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/promo-codes", {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(promoData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteAdminPromoCode(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/promo-codes?id=${id}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (!res.ok) return false;
    notifyDataChanged();
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// 12. NEWSLETTER SERVICES
// ==========================================

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      notifyDataChanged();
      return { success: true, message: data.message };
    }
    return { success: false, message: data.error || "Subscription failed" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const res = await fetch("/api/admin/newsletter", {
      headers: ADMIN_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function deleteNewsletterSubscriber(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/newsletter?id=${id}`, {
      method: "DELETE",
      headers: ADMIN_HEADERS,
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function broadcastOfferEmailAlert(payload: {
  offerTitle: string;
  offerSubtitle?: string;
  offerPrice: number;
  originalPrice: number;
  offerImage: string;
  customMessage?: string;
  products?: { name: string; price?: number; image?: string }[];
}): Promise<{ success: boolean; count?: number; message?: string }> {
  try {
    const res = await fetch("/api/admin/newsletter/broadcast", {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, count: data.recipientsCount, message: data.message };
    }
    return { success: false, message: data.error || "Broadcast failed" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ==========================================
// 13. OFFERS & BUNDLES SERVICES
// ==========================================

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

export async function createOfferInDb(offerData: Partial<Offer>): Promise<Offer | null> {
  try {
    const res = await fetch("/api/admin/offers", {
      method: "POST",
      headers: ADMIN_HEADERS,
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

export async function updateOfferInDb(id: string, updates: Partial<Offer>): Promise<Offer | null> {
  try {
    const res = await fetch("/api/admin/offers", {
      method: "PUT",
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ id }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

