import { NewsletterSubscriber } from "@/types";
import { notifyDataChanged } from "./productsService";
import { getAdminHeaders } from "./authHeaders";

// ==========================================
// 1. TRENDING SEARCHES SERVICES
// ==========================================

export async function getTrendingSearchesFromDb(): Promise<string[]> {
  try {
    const res = await fetch("/api/trending-searches", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function recordSearchQueryInDb(query: string): Promise<boolean> {
  try {
    const res = await fetch("/api/trending-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    return res.ok;
  } catch {
    return false;
  }
}


export async function getAdminTrendingSearches(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/trending-searches", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function addAdminTrendingSearch(query: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/trending-searches", {
      method: "POST",
      headers: getAdminHeaders(),
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
  search_count?: number,
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/trending-searches", {
      method: "PUT",
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 2. REVIEWS SERVICES
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
    const res = await fetch("/api/admin/reviews", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateReviewInDb(payload: {
  id: string;
  rating?: number;
  comment?: string;
}): Promise<boolean> {
  try {
    let res = await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: payload.id,
          id: payload.id,
          rating: payload.rating,
          comment: payload.comment,
        }),
      });
    }
    return res.ok;
  } catch {
    return false;
  }
}

export async function approveReviewInDb(
  id: string,
  is_approved: boolean,
): Promise<boolean> {
  return updateReviewInDb({ id });
}

export async function deleteReviewInDb(id: string): Promise<boolean> {
  try {
    let res = await fetch(`/api/admin/reviews?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      res = await fetch(`/api/reviews?reviewId=${id}`, {
        method: "DELETE",
      });
    }
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 3. NEWSLETTER SERVICES
// ==========================================

export async function subscribeNewsletter(
  email: string,
): Promise<{ success: boolean; message?: string }> {
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

export async function getNewsletterSubscribers(): Promise<
  NewsletterSubscriber[]
> {
  try {
    const res = await fetch("/api/admin/newsletter", {
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        count: data.recipientsCount,
        message: data.message,
      };
    }
    return { success: false, message: data.error || "Broadcast failed" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ==========================================
// 4. ANALYTICS & VISITOR SERVICES (Admin)
// ==========================================

export async function getAdminAnalytics(
  timeframe: "today" | "7d" | "30d" | "all" = "7d",
): Promise<any> {
  try {
    const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`, {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getSecurityLogsFromDb(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/security-logs", {
      headers: getAdminHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getLoyaltyLogsFromDb(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/loyalty-logs", {
      headers: getAdminHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

