import { Profile } from "@/types";
import { notifyDataChanged } from "./productsService";
import { getAdminHeaders } from "./authHeaders";

// ==========================================
// 1. USERS & PROFILES SERVICES (Admin & Public)
// ==========================================

export async function getUsersFromDb(): Promise<Profile[]> {
  try {
    const res = await fetch("/api/admin/users", {
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

export async function getUserProfileFromDb(
  userId: string,
): Promise<Profile | null> {
  try {
    const res = await fetch(`/api/users?id=${userId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateUserRoleInDb(
  userId: string,
  role: "customer" | "admin",
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 2. ADDRESSES SERVICES (Public User & Admin)
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
    const res = await fetch("/api/admin/addresses", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "set_default" }),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

export async function createAdminAddress(
  addressData: any,
): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/addresses", {
      method: "POST",
      headers: getAdminHeaders(),
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

export async function updateAdminAddress(
  addressData: any,
): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/addresses", {
      method: "PUT",
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// ==========================================
// 3. WISHLISTS & CART SERVICES (Public Customer)
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, product_id: productId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function removeFromWishlistInDb(
  userIdOrId: string,
  productId?: string,
): Promise<boolean> {
  try {
    const url = productId
      ? `/api/wishlists?userId=${userIdOrId}&productId=${productId}`
      : `/api/wishlists?id=${userIdOrId}`;
    const res = await fetch(url, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateUserLoyaltyPointsInDb(
  userId: string,
  loyaltyPoints: number,
): Promise<boolean> {
  try {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, loyalty_points: loyaltyPoints }),
    });
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
      headers: { "Content-Type": "application/json" },
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
// 4. LOYALTY SERVICES
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

export async function recordUserLoyaltyRedemption(
  userId: string,
  points: number,
  reason: string,
): Promise<any | null> {
  try {
    const res = await fetch("/api/loyalty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        points,
        points_type: "redeemed",
        reason,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
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
      headers: getAdminHeaders(),
      body: JSON.stringify({ user_id: userId, points, points_type, reason }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
