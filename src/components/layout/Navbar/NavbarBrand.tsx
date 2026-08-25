"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, MapPin } from "lucide-react";
import { Profile, UserAddress } from "@/types";

interface NavbarBrandProps {
  profile: Profile | null;
  userAddress: UserAddress | null;
  onOpenMobileMenu: () => void;
}

export function NavbarBrand({
  profile,
  userAddress,
  onOpenMobileMenu,
}: NavbarBrandProps) {
  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={onOpenMobileMenu}
        className="sm:hidden p-1.5 text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        aria-label="Open Mobile Navigation Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Brand Logo */}
      <Link
        href="/"
        className="flex items-center space-x-2 px-1 py-1 hover:opacity-95 flex-shrink-0 border border-transparent hover:border-black"
      >
        <Image
          src="/logo.png"
          alt="AURA Logo"
          width={32}
          height={32}
          priority
          className="w-7 h-7 sm:w-8 sm:h-8 object-cover border border-slate-900"
        />
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none font-mono">
            aura
          </span>
          <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            Luxury Tech
          </span>
        </div>
      </Link>

      {/* Deliver To Location Picker (Desktop) */}
      {!profile ? (
        <Link
          href="/login?redirect=/addresses"
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 border border-rose-400 hover:border-rose-600 bg-rose-100/90 cursor-pointer transition-all flex-shrink-0"
          title="Sign In to Set Address"
        >
          <MapPin className="w-4 h-4 text-rose-800 mt-1" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[9px] text-rose-800 font-extrabold uppercase tracking-wider">
              Login Required
            </span>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Set Your Delivery Location
            </span>
          </div>
        </Link>
      ) : (
        <Link
          href="/addresses"
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 border border-slate-300 hover:border-slate-900 cursor-pointer transition-all flex-shrink-0 bg-slate-50"
        >
          <MapPin className="w-4 h-4 text-slate-900 mt-1" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] text-slate-500">
              Deliver to{" "}
              {userAddress?.full_name?.split(" ")[0] ||
                profile?.full_name?.split(" ")[0] ||
                "User"}
            </span>
            <span
              className="text-xs font-bold text-slate-800 tracking-tight truncate max-w-[130px]"
              title={
                userAddress
                  ? `${userAddress.street_address}, ${userAddress.city}`
                  : "Add Delivery Address"
              }
            >
              {userAddress
                ? `${userAddress.city}${
                    userAddress.state_region
                      ? `, ${userAddress.state_region}`
                      : ""
                  }`
                : "Set Location..."}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}
