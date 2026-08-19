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
} from "lucide-react";

export type AdminTab =
  | "analytics"
  | "support"
  | "offers"
  | "newsletter"
  | "bento"
  | "products"
  | "orders"
  | "categories"
  | "users"
  | "stories"
  | "trending"
  | "addresses"
  | "promos";

interface AdminTabsNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  productsCount: number;
  ordersCount: number;
  categoriesCount: number;
  usersCount: number;
  storiesCount: number;
  trendingCount: number;
  addressesCount: number;
  promosCount?: number;
  bentoCount?: number;
  offersCount?: number;
  subscribersCount?: number;
}

export function AdminTabsNav({
  activeTab,
  onTabChange,
  productsCount,
  ordersCount,
  categoriesCount,
  usersCount,
  storiesCount,
  trendingCount,
  addressesCount,
  promosCount = 4,
  bentoCount = 4,
  offersCount = 2,
  subscribersCount = 2,
}: AdminTabsNavProps) {
  const tabsList = [
    { id: "analytics", label: "Analytics", count: null, icon: BarChart3 },
    { id: "support", label: "Customer Service", count: null, icon: Headset },
    { id: "users", label: "Users", count: usersCount, icon: Users },
    { id: "products", label: "Products", count: productsCount, icon: Package },
    { id: "offers", label: "Offers/Bundles", count: offersCount, icon: Tag },
    { id: "trending", label: "Trending", count: trendingCount, icon: Flame },
    { id: "promos", label: "Coupons", count: promosCount, icon: Tag },
    { id: "orders", label: "Orders", count: ordersCount, icon: ShoppingBag },
    {
      id: "categories",
      label: "Categories",
      count: categoriesCount,
      icon: Layers,
    },
    { id: "bento", label: "Bento CMS", count: bentoCount, icon: LayoutGrid },
    { id: "stories", label: "Stories", count: storiesCount, icon: Sparkles },
    {
      id: "newsletter",
      label: "Newsletter",
      count: subscribersCount,
      icon: Sparkles,
    },
    {
      id: "addresses",
      label: "Addresses",
      count: addressesCount,
      icon: MapPin,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 mb-8 text-xs font-bold uppercase tracking-wider">
      {tabsList.map((tab) => {
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
                  className={`text-[9px] font-mono font-black px-1 py-0.5 border ${
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
