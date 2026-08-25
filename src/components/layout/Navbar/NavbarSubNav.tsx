"use client";

import React from "react";
import Link from "next/link";
import { Menu, Flame, Zap } from "lucide-react";
import { Category, Profile } from "@/types";

interface NavbarSubNavProps {
  categories: Category[];
  profile: Profile | null;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function NavbarSubNav({
  categories,
  profile,
  mobileMenuOpen,
  onToggleMobileMenu,
}: NavbarSubNavProps) {
  return (
    <div className="bg-slate-50 text-slate-700 px-3 py-1.5 flex items-center justify-between text-xs overflow-x-auto font-medium border-t border-slate-200">
      <div className="flex items-center space-x-4 whitespace-nowrap">
        {/* Side Drawer Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="flex items-center space-x-1 px-2 py-1 border border-transparent hover:border-slate-900 font-bold text-slate-800 cursor-pointer"
        >
          <Menu className="w-4 h-4 text-slate-900" />
          <span>All</span>
        </button>

        {/* Join VIP Pill */}
        <Link
          href="/profile"
          className="px-2.5 py-0.5 bg-slate-900 text-white font-bold text-[11px] hover:bg-black transition-colors border border-slate-800"
        >
          AURA VIP
        </Link>

        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="px-2 py-1 bg-slate-900 text-white border border-slate-800 font-bold hover:bg-black transition-colors"
          >
            Admin Dashboard
          </Link>
        )}

        {/* Today's Deals */}
        <Link
          href="/offers"
          className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors flex items-center gap-1"
        >
          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
          <span>Offers & Bundles</span>
        </Link>

        <Link
          href="/products?flash=true"
          className="px-2 py-1 border border-transparent hover:border-amber-500 font-bold text-amber-700 flex items-center gap-1"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Today's Deals</span>
        </Link>

        {/* Dynamic Categories Links */}
        <Link
          href="/products"
          className="px-2 py-1 border border-transparent hover:border-slate-300 text-slate-800 hover:text-slate-900 font-bold"
        >
          All Products
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="px-2 py-1 border border-transparent hover:border-slate-300 text-slate-700 hover:text-slate-900 font-medium"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
