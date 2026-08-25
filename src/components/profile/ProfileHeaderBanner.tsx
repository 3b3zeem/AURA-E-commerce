"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Profile } from "@/types";

interface ProfileHeaderBannerProps {
  profile: Profile;
  loyaltyPoints: number;
  loyaltyDataPoints: number;
  onOpenLoyaltyTab: () => void;
}

export function ProfileHeaderBanner({
  profile,
  loyaltyPoints,
  loyaltyDataPoints,
  onOpenLoyaltyTab,
}: ProfileHeaderBannerProps) {
  const currentPoints = loyaltyDataPoints ?? profile?.loyalty_points ?? loyaltyPoints ?? 0;

  return (
    <div className="p-6 bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center space-x-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || "User"}
            className="w-16 h-16 object-cover border border-slate-200"
          />
        ) : (
          <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-black text-xl border border-slate-800 uppercase">
            {profile.full_name?.charAt(0) || "U"}
          </div>
        )}
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 uppercase">
              {profile.full_name || "Member Account"}
            </h1>
            {profile.role === "admin" && (
              <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold border border-slate-800">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5 font-mono">{profile.email}</p>
        </div>
      </div>

      {/* Loyalty Points Pill */}
      <button
        type="button"
        onClick={onOpenLoyaltyTab}
        className="flex items-center space-x-4 bg-slate-50 text-slate-900 px-5 py-3 border border-slate-200 hover:bg-slate-100 transition-colors text-left cursor-pointer group"
      >
        <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
        <div>
          <span className="text-[10px] text-slate-500 font-bold block font-mono uppercase">
            VIP Points (Click to Redeem)
          </span>
          <span className="text-base font-black text-amber-600 font-mono">
            {currentPoints} PTS
          </span>
        </div>
      </button>
    </div>
  );
}
