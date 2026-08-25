"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Sparkles,
  Gift,
  Tag,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Profile } from "@/types";
import { useUserStore } from "@/store/useUserStore";
import { recordUserLoyaltyRedemption } from "@/lib/services/userService";
import { createPromoCodeInDb } from "@/lib/services/ordersService";

interface ProfileLoyaltyTabProps {
  profile: Profile;
  loyaltyData: { points: number; logs: any[] };
  setLoyaltyData: React.Dispatch<
    React.SetStateAction<{ points: number; logs: any[] }>
  >;
}

interface Voucher {
  title: string;
  code: string;
  date: string;
  discountAmount: number;
  discountPercent: number;
}

export function ProfileLoyaltyTab({
  profile,
  loyaltyData,
  setLoyaltyData,
}: ProfileLoyaltyTabProps) {
  const { loyaltyPoints, addLoyaltyPoints } = useUserStore();
  const [redeemedVouchers, setRedeemedVouchers] = useState<Voucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(
          `aura_vouchers_${profile?.id || "guest"}`,
        );
        if (saved) {
          setRedeemedVouchers(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to load saved vouchers:", err);
      }
    }
  }, [profile?.id]);

  const rewardsCatalog = [
    {
      id: "reward-50",
      title: "EGP 50 Shopping Voucher",
      description: "Instant EGP 50 off discount applied to your next purchase.",
      pointsCost: 500,
      discountAmount: 50,
      discountPercent: 10,
      badge: "INSTANT CREDIT",
    },
    {
      id: "reward-100",
      title: "EGP 100 VIP Cash Coupon",
      description: "EGP 100 coupon code valid across all hardware categories.",
      pointsCost: 1000,
      discountAmount: 100,
      discountPercent: 15,
      badge: "POPULAR CHOICE",
    },
    {
      id: "reward-250",
      title: "EGP 250 Luxury Gift Voucher",
      description: "EGP 250 big savings voucher for high-end orders.",
      pointsCost: 2500,
      discountAmount: 250,
      discountPercent: 25,
      badge: "PLATINUM FAVORITE",
    },
    {
      id: "reward-500",
      title: "EGP 500 Super VIP Coupon",
      description: "EGP 500 discount for serious tech collectors & builders.",
      pointsCost: 5000,
      discountAmount: 500,
      discountPercent: 40,
      badge: "ULTIMATE SAVINGS",
    },
  ];

  const currentPoints =
    loyaltyData.points ?? profile?.loyalty_points ?? loyaltyPoints ?? 0;

  const handleRedeemReward = async (reward: {
    id: string;
    title: string;
    pointsCost: number;
    discountAmount: number;
    discountPercent: number;
  }) => {
    if (currentPoints < reward.pointsCost) {
      toast.error(
        `Insufficient points. You need ${reward.pointsCost - currentPoints} more PTS.`,
      );
      return;
    }

    setIsRedeeming(reward.id);

    try {
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();
      const generatedCode = `VIP-${reward.discountAmount}-${randomSuffix}`;

      // 1. Save new single-use promo code in Supabase DB
      const success = await createPromoCodeInDb({
        code: generatedCode,
        discount_percent: reward.discountPercent,
        max_uses: 1,
        max_uses_per_user: 1,
        user_id: profile?.id || null,
      });

      if (!success) {
        throw new Error("Failed to register promo code in database.");
      }

      // 2. Log points deduction in DB if user is logged in
      if (profile?.id) {
        await recordUserLoyaltyRedemption(
          profile.id,
          -reward.pointsCost,
          `Redeemed ${reward.title} (${generatedCode})`,
        );
      }

      // 3. Update local Zustand state
      addLoyaltyPoints(-reward.pointsCost);
      setLoyaltyData((prev) => ({
        ...prev,
        points: Math.max(0, prev.points - reward.pointsCost),
      }));

      // 4. Save active coupon to localStorage so Checkout auto-fills it
      localStorage.setItem("aura_active_coupon", generatedCode);

      const newVoucher: Voucher = {
        title: reward.title,
        code: generatedCode,
        date: new Date().toLocaleDateString(),
        discountAmount: reward.discountAmount,
        discountPercent: reward.discountPercent,
      };

      const updatedVouchers = [newVoucher, ...redeemedVouchers];
      setRedeemedVouchers(updatedVouchers);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `aura_vouchers_${profile?.id || "guest"}`,
          JSON.stringify(updatedVouchers),
        );
      }

      toast.success(
        `Redeemed "${reward.title}"! Code ${generatedCode} activated & auto-applied to Checkout!`,
        {
          duration: 7000,
          style: {
            background: "#0f172a",
            color: "#ffffff",
            borderRadius: "0px",
            fontSize: "12px",
            fontWeight: "bold",
            border: "1px solid #1e293b",
          },
        },
      );
    } catch (err: any) {
      console.error("Redemption error:", err);
      toast.error("Failed to redeem reward. Please try again.");
    } finally {
      setIsRedeeming(null);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    localStorage.setItem("aura_active_coupon", code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied & saved for Checkout!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="p-6 bg-white border border-slate-200 space-y-6 font-sans text-slate-900">
      {/* Header & Status Pill */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-black text-slate-900 uppercase">
              VIP Loyalty Rewards Hub
            </h2>
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-mono text-[10px] font-bold border border-amber-300">
              TIER: PLATINUM MEMBER
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Earn 10 PTS for every EGP 100 spent. Redeem points for instant
            discount coupons.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 text-right font-mono">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">
            Available Rewards Balance
          </span>
          <span className="text-xl font-black text-amber-600">
            {currentPoints} PTS
          </span>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Gift className="w-4 h-4 text-amber-500" />
          Redeem Your Points For Cash Coupons
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewardsCatalog.map((reward) => {
            const canAfford = currentPoints >= reward.pointsCost;
            const loadingThis = isRedeeming === reward.id;

            return (
              <div
                key={reward.id}
                className={`p-4 border transition-all flex flex-col justify-between space-y-3 ${
                  canAfford
                    ? "bg-white border-slate-300 hover:border-slate-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-mono text-[9px] font-bold uppercase">
                      {reward.badge}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-600">
                      {reward.pointsCost} PTS
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase mt-2">
                    {reward.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {reward.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canAfford || loadingThis}
                  onClick={() => handleRedeemReward(reward)}
                  className={`w-full py-2 px-3 text-xs font-bold uppercase transition-colors border flex items-center justify-center space-x-2 cursor-pointer ${
                    canAfford
                      ? "bg-slate-900 text-white hover:bg-black border-slate-800"
                      : "bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed"
                  }`}
                >
                  {loadingThis ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Activating Coupon...</span>
                    </>
                  ) : canAfford ? (
                    `Redeem for ${reward.pointsCost} PTS`
                  ) : (
                    `Need ${reward.pointsCost - currentPoints} More PTS`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeemed Coupons List */}
      {redeemedVouchers.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              Your Active Redeemed Coupon Codes ({redeemedVouchers.length})
            </h3>
            <Link
              href="/checkout"
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 uppercase font-mono flex items-center gap-1 underline"
            >
              <span>Go to Checkout</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {redeemedVouchers.map((v, i) => (
              <div
                key={i}
                className="p-3 bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">
                    {v.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Issued on {v.date} ({v.discountPercent}% Discount)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-1 border border-emerald-300">
                    {v.code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(v.code)}
                    className="p-1 bg-slate-900 text-white hover:bg-black transition-colors cursor-pointer"
                    title="Copy & Auto-Apply Code"
                  >
                    {copiedCode === v.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
