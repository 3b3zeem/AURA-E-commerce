import { notifyDataChanged } from "./productsService";
import { getAdminHeaders } from "./authHeaders";

// ==========================================
// ORDERS SERVICES (Public Customer & Admin)
// ==========================================

export async function getOrdersFromDb(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/orders", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
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
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch (err) {
    console.error("createOrderInDb exception:", err);
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
      headers: getAdminHeaders(),
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
    const res = await fetch(`/api/admin/orders?id=${id}`, {
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
// PROMO CODES HELPERS
// ==========================================

export async function getAdminPromoCodes(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/promo-codes", {
      headers: getAdminHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function verifyPromoCode(
  code: string,
  userId?: string,
): Promise<{ success: boolean; promo?: any; message?: string }> {
  try {
    const url = userId
      ? `/api/promo-codes?code=${encodeURIComponent(code)}&userId=${encodeURIComponent(userId)}`
      : `/api/promo-codes?code=${encodeURIComponent(code)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, promo: data.promo };
    }
    return {
      success: false,
      message: data.message || "Invalid or expired coupon",
    };
  } catch {
    return { success: false, message: "Error verifying coupon code" };
  }
}

export async function createAdminPromoCode(promoData: {
  code: string;
  discount_percent: number;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: getAdminHeaders(),
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

export async function updateAdminPromoCode(promoData: {
  id: string;
  code?: string;
  discount_percent?: number;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/promo-codes", {
      method: "PUT",
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
    });
    if (!res.ok) return false;
    notifyDataChanged();
    return true;
  } catch {
    return false;
  }
}

export async function createPromoCodeInDb(promoData: {
  code: string;
  discount_percent: number;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
  user_id?: string | null;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promoData),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function seedDemoOrdersInDb(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/seed-orders", {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateUserOrderInDb(
  orderId: string,
  updates: { status?: string; shipping_address?: any },
): Promise<boolean> {
  try {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, ...updates }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

