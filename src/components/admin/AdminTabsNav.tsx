"use client";

import React from "react";
import {
  Package,
  ShoppingBag,
  Layers,
  Users,
  Sparkles,
  Flame,
  MapPin,
  BarChart3,
  LayoutGrid,
  Tag,
  Headset,
  BookOpen,
  KeyRound,
} from "lucide-react";

export type AdminTab =
  | "analytics"
  | "roles"
  | "support"
  | "offers"
  | "newsletter"
  | "bento"
  | "blogs"
  | "products"
  | "brands"
  | "orders"
  | "categories"
  | "users"
  | "stories"
  | "trending"
  | "addresses"
  | "promos";

export const PERMISSION_TO_TAB_MAP: Record<string, AdminTab> = {
  // Analytics
  view_analytics: "analytics",
  manage_analytics: "analytics",
  "analytics.view": "analytics",
  "analytics.manage": "analytics",
  analytics: "analytics",

  // Products
  manage_products: "products",
  "products.create": "products",
  "products.edit": "products",
  "products.delete": "products",
  "products.manage": "products",
  products: "products",

  // Categories
  manage_categories: "categories",
  "categories.manage": "categories",
  categories: "categories",

  // Brands
  manage_brands: "brands",
  "brands.manage": "brands",
  brands: "brands",

  // Orders
  manage_orders: "orders",
  "orders.manage": "orders",
  orders: "orders",

  // Offers
  manage_offers: "offers",
  "offers.manage": "offers",
  offers: "offers",

  // Users
  manage_users: "users",
  "users.manage": "users",
  users: "users",

  // Roles
  manage_roles: "roles",
  "roles.manage": "roles",
  roles: "roles",

  // Support
  manage_support: "support",
  "support.manage": "support",
  support: "support",

  // Blogs
  manage_blogs: "blogs",
  "blogs.manage": "blogs",
  blogs: "blogs",

  // Trending
  manage_trending: "trending",
  "trending.manage": "trending",
  trending: "trending",

  // Promos
  manage_promos: "promos",
  "promos.manage": "promos",
  promos: "promos",

  // Bento
  manage_bento: "bento",
  "bento.manage": "bento",
  bento: "bento",

  // Stories
  manage_stories: "stories",
  "stories.manage": "stories",
  stories: "stories",

  // Newsletter
  manage_newsletter: "newsletter",
  "newsletter.manage": "newsletter",
  newsletter: "newsletter",

  // Addresses
  manage_addresses: "addresses",
  "addresses.manage": "addresses",
  addresses: "addresses",
};

export function getAllowedTabsForRole(
  role?: string,
  userPermissions?: string[]
): AdminTab[] {
  if (role === "super_admin") {
    return [
      "analytics",
      "roles",
      "support",
      "users",
      "products",
      "brands",
      "blogs",
      "offers",
      "trending",
      "promos",
      "orders",
      "categories",
      "bento",
      "stories",
      "newsletter",
      "addresses",
    ];
  }

  const allowed = new Set<AdminTab>();

  if (Array.isArray(userPermissions) && userPermissions.length > 0) {
    userPermissions.forEach((perm) => {
      const tab = PERMISSION_TO_TAB_MAP[perm];
      if (tab) allowed.add(tab);
    });
  }

  if (allowed.size > 0) {
    return Array.from(allowed);
  }

  // Fallback defaults for seller if permissions set is not yet explicitly mapped
  if (role === "seller") {
    return ["products", "categories", "brands", "orders", "offers", "analytics"];
  }

  return [];
}

interface AdminTabsNavProps {
  userRole?: string;
  userPermissions?: string[];
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  productsCount: number;
  ordersCount: number;
  categoriesCount: number;
  usersCount: number;
  storiesCount: number;
  trendingCount: number;
  addressesCount: number;
  brandsCount?: number;
  promosCount?: number;
  bentoCount?: number;
  offersCount?: number;
  subscribersCount?: number;
  blogsCount?: number;
  rolesCount?: number;
}

export function AdminTabsNav({
  userRole = "super_admin",
  userPermissions,
  activeTab,
  onTabChange,
  productsCount,
  ordersCount,
  categoriesCount,
  usersCount,
  storiesCount,
  trendingCount,
  addressesCount,
  brandsCount = 12,
  promosCount = 4,
  bentoCount = 4,
  offersCount = 2,
  subscribersCount = 2,
  blogsCount = 4,
  rolesCount = 4,
}: AdminTabsNavProps) {
  const allowedTabs = getAllowedTabsForRole(userRole, userPermissions);

  const tabsList = [
    { id: "analytics", label: "Analytics", count: null, icon: BarChart3 },
    { id: "roles", label: "Roles & Perms", count: rolesCount, icon: KeyRound },
    { id: "support", label: "Customer Service", count: null, icon: Headset },
    { id: "users", label: "Users", count: usersCount, icon: Users },
    { id: "products", label: "Products", count: productsCount, icon: Package },
    { id: "brands", label: "Brands", count: brandsCount, icon: Tag },
    { id: "blogs", label: "Blogs", count: blogsCount, icon: BookOpen },
    { id: "offers", label: "Offers/Bundles", count: offersCount, icon: Tag },
    { id: "trending", label: "Trending", count: trendingCount, icon: Flame },
    { id: "promos", label: "Coupons", count: promosCount, icon: Tag },
    { id: "orders", label: "Orders", count: ordersCount, icon: ShoppingBag },
    { id: "categories", label: "Categories", count: categoriesCount, icon: Layers },
    { id: "bento", label: "Bento CMS", count: bentoCount, icon: LayoutGrid },
    { id: "stories", label: "Stories", count: storiesCount, icon: Sparkles },
    { id: "newsletter", label: "Newsletter", count: subscribersCount, icon: Sparkles },
    { id: "addresses", label: "Addresses", count: addressesCount, icon: MapPin },
  ];

  const visibleTabs = tabsList.filter((tab) => allowedTabs.includes(tab.id as AdminTab));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8 text-xs font-bold uppercase tracking-wider">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as AdminTab)}
            className={`p-3 border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer group relative ${
              isActive
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? "text-white"
                    : "text-slate-900 group-hover:scale-110 transition-transform"
                }`}
              />
              {tab.count !== null && (
                <span
                  className={`text-[9px] font-mono font-black px-1.5 py-0.5 border ${
                    isActive
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-100 text-slate-900 border-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </div>
            <span className="font-black text-[10px] truncate tracking-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
