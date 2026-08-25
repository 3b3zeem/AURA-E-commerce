import { BlogPost, BlogCategory } from "@/types";
import { notifyDataChanged } from "./productsService";
import { getAdminHeaders } from "./authHeaders";

// ==========================================
// BLOGS & ARTICLES SERVICES
// ==========================================

// Public GET for User
export async function getBlogCategoryObjects(): Promise<BlogCategory[]> {
  try {
    const res = await fetch("/api/blogs/categories", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item) =>
        typeof item === "string"
          ? { id: item, name: item, slug: item.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
          : item
      );
    }
    return [];
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminBlogCategoryObjects(): Promise<BlogCategory[]> {
  try {
    const res = await fetch("/api/admin/blogs/categories", {
      cache: "no-store",
      headers: getAdminHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item) =>
        typeof item === "string"
          ? { id: item, name: item, slug: item.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
          : item
      );
    }
    return [];
  } catch {
    return [];
  }
}

export async function getBlogCategories(): Promise<string[]> {
  try {
    const cats = await getBlogCategoryObjects();
    const names = cats.map((c) => c.name);
    return ["All", ...Array.from(new Set(names))];
  } catch {
    return ["All"];
  }
}

export async function createBlogCategoryInDb(name: string): Promise<BlogCategory | null> {
  try {
    const res = await fetch("/api/admin/blogs/categories", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function deleteBlogCategoryInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/blogs/categories?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}

// Public GET for User
export async function getBlogs(category?: string, search?: string): Promise<BlogPost[]> {
  try {
    const queryParams = new URLSearchParams();
    if (category && category !== "All") queryParams.set("category", category);
    if (search && search.trim()) queryParams.set("search", search.trim());

    const url = `/api/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Admin GET with Bearer Token
export async function getAdminBlogsFromDb(): Promise<BlogPost[]> {
  try {
    const res = await fetch("/api/admin/blogs", {
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

export async function getBlogById(id: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`/api/blogs/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getBlogsFromDb(): Promise<BlogPost[]> {
  return getBlogs();
}

export async function createBlogInDb(
  blogData: Partial<BlogPost>
): Promise<BlogPost | null> {
  try {
    const res = await fetch("/api/admin/blogs", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(blogData),
    });
    if (!res.ok) return null;
    const result = await res.json();
    notifyDataChanged();
    return result;
  } catch {
    return null;
  }
}

export async function updateBlogInDb(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost | null> {
  try {
    const res = await fetch("/api/admin/blogs", {
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

export async function deleteBlogInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/blogs?id=${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) notifyDataChanged();
    return res.ok;
  } catch {
    return false;
  }
}
