"use client";

import React from "react";
import Link from "next/link";
import { User, X, LogOut } from "lucide-react";
import { Category, Profile } from "@/types";

interface NavbarMobileDrawerProps {
  isOpen: boolean;
  categories: Category[];
  profile: Profile | null;
  onClose: () => void;
  onSignOut: () => void;
}

export function NavbarMobileDrawer({
  isOpen,
  categories,
  profile,
  onClose,
  onSignOut,
}: NavbarMobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-white text-slate-900 h-full border-r border-slate-300 flex flex-col z-10 overflow-y-auto shadow-2xl">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">
              Hello, {profile?.full_name || "Sign in"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 text-xs font-semibold text-slate-800">
          <div>
            <h4 className="text-slate-500 font-bold uppercase text-[11px] mb-2">
              Shop By Department
            </h4>
            <div className="space-y-1">
              <Link
                href="/products"
                onClick={onClose}
                className="block p-2 hover:bg-slate-100 border-b border-slate-100 font-bold text-slate-900"
              >
                Full Product Catalog
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  onClick={onClose}
                  className="block p-2 hover:bg-slate-100 border-b border-slate-100 text-slate-700"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-slate-500 font-bold uppercase text-[11px] mb-2">
              Settings & Account
            </h4>
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={onClose}
                className="block p-2 hover:bg-slate-100"
              >
                Your Account
              </Link>
              <Link
                href="/order-tracking"
                onClick={onClose}
                className="block p-2 hover:bg-slate-100"
              >
                Order Tracking
              </Link>
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="block p-2 bg-slate-900 text-white font-bold my-1"
                >
                  Admin Dashboard
                </Link>
              )}
              {profile ? (
                <button
                  onClick={onSignOut}
                  className="w-full text-left p-2 text-rose-600 font-bold hover:bg-rose-50 flex items-center space-x-1.5 border-t border-slate-200 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block p-2 text-slate-900 font-bold underline"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
