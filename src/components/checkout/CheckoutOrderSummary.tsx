"use client";

import React from "react";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CheckoutPromoCodeBox } from "./CheckoutPromoCodeBox";
import { Profile } from "@/types";

interface CheckoutOrderSummaryProps {
  items: any[];
  subtotal: number;
  shipping: number;
  pointsDiscount: number;
  promoDiscount: number;
  finalTotal: number;
  usePoints: boolean;
  setUsePoints: (val: boolean) => void;
  loyaltyPoints: number;
  profile: Profile | null;
  appliedPromo: { code: string; discountPercent: number; name: string } | null;
  promoCodeInput: string;
  setPromoCodeInput: (val: string) => void;
  promoError: string;
  setPromoError: (val: string) => void;
  handleApplyPromo: (e?: React.FormEvent) => void;
  handleRemovePromo: () => void;
  orderError: string;
  isSubmitting: boolean;
  handlePlaceOrder: (e?: React.FormEvent) => void;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shipping,
  pointsDiscount,
  promoDiscount,
  finalTotal,
  usePoints,
  setUsePoints,
  loyaltyPoints,
  profile,
  appliedPromo,
  promoCodeInput,
  setPromoCodeInput,
  promoError,
  setPromoError,
  handleApplyPromo,
  handleRemovePromo,
  orderError,
  isSubmitting,
  handlePlaceOrder,
}: CheckoutOrderSummaryProps) {
  const earnedBonusPoints =
    Math.round(finalTotal * 0.1) +
    (finalTotal >= 5000 ? 1200 : finalTotal >= 3000 ? 600 : finalTotal >= 1500 ? 250 : 0);

  return (
    <div className="p-6 bg-white border border-slate-200 space-y-6 h-fit font-sans text-slate-900">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
        <span>Order Summary</span>
        <span className="font-mono text-xs text-slate-500 font-bold">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </h3>

      {/* Cart Items Breakdown List */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 border-b border-slate-100 pb-3">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center space-x-3 text-xs">
            <img
              src={item.product.images?.[0] || "/placeholder.png"}
              alt={item.product.name}
              className="w-11 h-11 object-cover border border-slate-200 flex-shrink-0 bg-slate-50"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 truncate uppercase text-[11px]">
                {item.product.name}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                Qty: <span className="font-bold text-slate-900">{item.quantity}</span> ×{" "}
                {formatPrice(item.product.price)}
              </p>
            </div>
            <div className="text-right font-mono font-bold text-slate-900 text-xs">
              {formatPrice(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Loyalty Points Redemption */}
      {profile && loyaltyPoints > 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-900" /> VIP Loyalty Points
            </span>
            <span className="text-xs font-mono text-slate-900 font-bold">
              {loyaltyPoints} pts
            </span>
          </div>
          <label className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer pt-1 uppercase font-semibold">
            <input
              type="checkbox"
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
              className="accent-slate-900 w-4 h-4 cursor-pointer"
            />
            <span>Redeem points for discount (${(loyaltyPoints / 10).toFixed(2)})</span>
          </label>
        </div>
      )}

      {/* Coupon Code Input Box */}
      <CheckoutPromoCodeBox
        appliedPromo={appliedPromo}
        promoCodeInput={promoCodeInput}
        setPromoCodeInput={setPromoCodeInput}
        promoError={promoError}
        setPromoError={setPromoError}
        handleApplyPromo={handleApplyPromo}
        handleRemovePromo={handleRemovePromo}
      />

      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-mono text-slate-900 font-bold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-mono text-slate-900 font-bold">
            {shipping === 0 ? "FREE" : formatPrice(shipping)}
          </span>
        </div>
        {usePoints && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>VIP Points Discount</span>
            <span className="font-mono">-{formatPrice(pointsDiscount)}</span>
          </div>
        )}
        {appliedPromo && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>
              Promo Discount ({appliedPromo.code} - {appliedPromo.discountPercent}%)
            </span>
            <span className="font-mono">-{formatPrice(promoDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
          <span>Total Payment</span>
          <span className="font-mono text-slate-900 font-black">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Points Reward Banner */}
      {profile && (
        <div className="p-3 bg-slate-900 text-white space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Points Earned On Order
            </span>
            <span className="font-mono text-amber-400 font-black">
              +{earnedBonusPoints} PTS
            </span>
          </div>
          {finalTotal >= 1500 ? (
            <p className="text-[10px] text-amber-300 font-mono font-bold">
              Includes +
              {finalTotal >= 5000
                ? "1,200 (Platinum)"
                : finalTotal >= 3000
                ? "600 (Gold)"
                : "250 (Silver)"}{" "}
              Automatic High-Value Bonus!
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 font-mono">
              Spend {formatPrice(1500 - finalTotal)} more to unlock +250 Automatic Bonus
              Points!
            </p>
          )}
        </div>
      )}

      {orderError && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => handlePlaceOrder()}
        disabled={isSubmitting || items.length === 0}
        className="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 border border-slate-800 uppercase cursor-pointer transition-colors disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Processing Order...</span>
          </div>
        ) : (
          <span>Place Order ({formatPrice(finalTotal)})</span>
        )}
      </button>
    </div>
  );
}
