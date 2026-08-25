"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, ShoppingBag, ShieldCheck, LogOut } from "lucide-react";
import { Profile } from "@/types";
import { UserNotificationCenter } from "@/components/layout/UserNotificationCenter";

interface NavbarUserMenuProps {
  profile: Profile | null;
  cartCount: number;
  accountDropdownOpen: boolean;
  setAccountDropdownOpen: (open: boolean) => void;
  onOpenCart: () => void;
  onSignOut: () => void;
}

export function NavbarUserMenu({
  profile,
  cartCount,
  accountDropdownOpen,
  setAccountDropdownOpen,
  onOpenCart,
  onSignOut,
}: NavbarUserMenuProps) {
  return (
    <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0 text-xs">
      {/* Accounts & Lists Dropdown */}
      <div className="relative">
        <button
          onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
          className="flex flex-col text-left px-2 py-1.5 border border-transparent hover:border-slate-900 leading-tight transition-all cursor-pointer"
        >
          <span className="text-[10px] text-slate-500">
            Hello, {profile?.full_name?.split(" ")[0] || "Sign in"}
          </span>
          <span className="text-xs font-bold text-slate-900 flex items-center gap-0.5">
            Account & Lists <ChevronDown className="w-3 h-3 text-slate-500" />
          </span>
        </button>

        {/* Dropdown Menu */}
        {accountDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white text-slate-800 border border-slate-300 py-2 z-50 text-xs space-y-1">
            {profile ? (
              <>
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="font-bold text-slate-900">
                    {profile.full_name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {profile.email}
                  </p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setAccountDropdownOpen(false)}
                  className="block px-4 py-2 hover:bg-slate-100 font-bold text-slate-800"
                >
                  Your Account & Rewards
                </Link>
                <Link
                  href="/order-tracking"
                  onClick={() => setAccountDropdownOpen(false)}
                  className="block px-4 py-2 hover:bg-slate-100 font-bold text-slate-800"
                >
                  Your Orders & Tracking
                </Link>
                {(profile.role === "admin" || profile.role === "super_admin") && (
                  <Link
                    href="/admin"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="block px-4 py-2 bg-slate-900 text-white font-bold hover:bg-black border-t border-slate-800"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-white" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={onSignOut}
                  className="w-full text-left px-4 py-2.5 text-rose-600 font-bold hover:bg-rose-50 border-t border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="p-3 text-center space-y-2">
                <Link
                  href="/login"
                  onClick={() => setAccountDropdownOpen(false)}
                  className="block w-full py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs border border-slate-800"
                >
                  Sign In
                </Link>
                <span className="text-[11px] text-slate-500 block">
                  New customer?{" "}
                  <Link
                    href="/register"
                    className="font-bold underline text-slate-900"
                  >
                    Start here.
                  </Link>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Quick Link */}
      <Link
        href="/order-tracking"
        className="hidden md:flex flex-col text-left px-2 py-1.5 border border-transparent hover:border-slate-300 leading-tight"
      >
        <span className="text-[10px] text-slate-500">Returns</span>
        <span className="text-xs font-bold text-slate-900">& Orders</span>
      </Link>

      {/* USER NOTIFICATION CENTER BELL */}
      <UserNotificationCenter />

      {/* Cart Icon & Counter */}
      <button
        onClick={onOpenCart}
        className="flex items-center space-x-1 px-2.5 py-1.5 border border-transparent hover:border-slate-900 font-bold relative transition-all cursor-pointer"
        aria-label="Shopping Bag"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6 text-slate-900" />
          <span className="absolute -top-1.5 -right-1 text-white font-black text-xs font-mono bg-slate-900 px-1 border border-slate-800">
            {cartCount}
          </span>
        </div>
        <span className="hidden sm:inline text-xs text-slate-900 font-bold self-end mb-0.5">
          Cart
        </span>
      </button>
    </div>
  );
}
