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
} from "lucide-react";

export type AdminTab =
  | "analytics"
  | "bento"
  | "products"
  | "orders"
  | "categories"
  | "users"
  | "stories"
  | "trending"
  | "addresses";

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
  bentoCount?: number;
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
  bentoCount = 4,
}: AdminTabsNavProps) {
  const tabsList = [
    { id: "products", label: "Products", count: productsCount, icon: Package },
    { id: "orders", label: "Orders", count: ordersCount, icon: ShoppingBag },
    {
      id: "categories",
      label: "Categories",
      count: categoriesCount,
      icon: Layers,
    },
    { id: "users", label: "Users", count: usersCount, icon: Users },
    { id: "bento", label: "Bento CMS", count: bentoCount, icon: LayoutGrid },
    { id: "stories", label: "Stories", count: storiesCount, icon: Sparkles },
    { id: "trending", label: "Trending", count: trendingCount, icon: Flame },
    {
      id: "addresses",
      label: "Addresses",
      count: addressesCount,
      icon: MapPin,
    },
    { id: "analytics", label: "Analytics", count: null, icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8 text-xs font-bold uppercase tracking-wider">
      {tabsList.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as AdminTab)}
            className={`p-3.5 border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer group relative ${
              isActive
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? "text-white"
                    : "text-slate-900 group-hover:scale-110 transition-transform"
                }`}
              />
              {tab.count !== null && (
                <span
                  className={`text-[10px] font-mono font-black px-1.5 py-0.5 border ${
                    isActive
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-100 text-slate-900 border-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </div>
            <span className="font-black text-[11px] truncate tracking-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
