"use client";

import React from "react";
import Link from "next/link";
import { User, Heart, Package, CreditCard, Sparkles, ShieldCheck, LogOut } from "lucide-react";
import { Profile } from "@/types";

export type ProfileTab = "info" | "wishlist" | "orders" | "payment" | "loyalty";

interface ProfileNavSidebarProps {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  wishlistCount: number;
  profile: Profile;
  onLogout: () => void;
}

export function ProfileNavSidebar({
  activeTab,
  setActiveTab,
  wishlistCount,
  profile,
  onLogout,
}: ProfileNavSidebarProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => setActiveTab("info")}
        className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border cursor-pointer ${
          activeTab === "info"
            ? "bg-slate-900 text-white border-slate-800"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <User className={`w-4 h-4 ${activeTab === "info" ? "text-white" : "text-slate-900"}`} />
        <span>Account Settings</span>
      </button>

      <button
        onClick={() => setActiveTab("wishlist")}
        className={`w-full p-3 text-xs font-bold flex items-center justify-between transition-colors uppercase border cursor-pointer ${
          activeTab === "wishlist"
            ? "bg-slate-900 text-white border-slate-800"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          <Heart className={`w-4 h-4 ${activeTab === "wishlist" ? "text-white" : "text-slate-900"}`} />
          <span>Saved Wishlist</span>
        </div>
        <span
          className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
            activeTab === "wishlist"
              ? "bg-white text-slate-900 border-white"
              : "bg-slate-100 text-slate-900 border-slate-300"
          }`}
        >
          {wishlistCount}
        </span>
      </button>

      <button
        onClick={() => setActiveTab("orders")}
        className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border cursor-pointer ${
          activeTab === "orders"
            ? "bg-slate-900 text-white border-slate-800"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Package className={`w-4 h-4 ${activeTab === "orders" ? "text-white" : "text-slate-900"}`} />
        <span>Order History</span>
      </button>

      <Link
        href="/addresses"
        className="w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
      >
        <User className="w-4 h-4 text-slate-900" />
        <span>Your Addresses</span>
      </Link>

      <button
        onClick={() => setActiveTab("payment")}
        className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border cursor-pointer ${
          activeTab === "payment"
            ? "bg-slate-900 text-white border-slate-800"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <CreditCard
          className={`w-4 h-4 ${activeTab === "payment" ? "text-amber-400" : "text-slate-900"}`}
        />
        <span>Payment & Express Buy</span>
      </button>

      <button
        onClick={() => setActiveTab("loyalty")}
        className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border cursor-pointer ${
          activeTab === "loyalty"
            ? "bg-slate-900 text-white border-slate-800"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Sparkles className={`w-4 h-4 ${activeTab === "loyalty" ? "text-white" : "text-slate-900"}`} />
        <span>VIP Rewards</span>
      </button>

      {profile.role === "admin" && (
        <Link
          href="/admin"
          className="block w-full p-3 text-xs font-bold text-center bg-slate-900 text-white border border-slate-800 hover:bg-black transition-colors uppercase"
        >
          <ShieldCheck className="w-4 h-4 inline mr-1" />
          Admin Dashboard
        </Link>
      )}

      <button
        onClick={onLogout}
        className="w-full p-3 text-xs font-bold flex items-center space-x-3 bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors uppercase mt-6 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
