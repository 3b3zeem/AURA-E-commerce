"use client";

import React from "react";
import { Tag } from "lucide-react";

interface CheckoutPromoCodeBoxProps {
  appliedPromo: { code: string; discountPercent: number; name: string } | null;
  promoCodeInput: string;
  setPromoCodeInput: (val: string) => void;
  promoError: string;
  setPromoError: (val: string) => void;
  handleApplyPromo: (e?: React.FormEvent) => void;
  handleRemovePromo: () => void;
}

export function CheckoutPromoCodeBox({
  appliedPromo,
  promoCodeInput,
  setPromoCodeInput,
  promoError,
  setPromoError,
  handleApplyPromo,
  handleRemovePromo,
}: CheckoutPromoCodeBoxProps) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 space-y-2 font-sans text-slate-900">
      <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-900">
        <span className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-900" /> Coupon Code
        </span>
      </div>

      {appliedPromo ? (
        <div className="p-2.5 bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs font-bold text-emerald-900">
          <div className="flex items-center space-x-1.5 truncate">
            <Tag className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span className="font-mono">{appliedPromo.code}</span>
            <span className="text-[10px] text-emerald-700 font-normal">
              ({appliedPromo.discountPercent}% OFF)
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemovePromo}
            className="text-[10px] text-rose-600 hover:text-rose-800 underline uppercase cursor-pointer ml-2"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Coupon Code..."
              value={promoCodeInput}
              onChange={(e) => {
                setPromoCodeInput(e.target.value);
                if (promoError) setPromoError("");
              }}
              className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900 uppercase"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 cursor-pointer"
            >
              Apply
            </button>
          </div>
          {promoError && (
            <p className="text-[10px] font-bold text-rose-600 uppercase">
              {promoError}
            </p>
          )}
          <p className="text-[10px] text-slate-500 font-mono">
            Enter your valid coupon code to apply your instant discount.
          </p>
        </div>
      )}
    </div>
  );
}
