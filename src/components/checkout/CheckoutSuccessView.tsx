"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CheckoutSuccessViewProps {
  placedOrderId: string;
  fullName: string;
  city: string;
  finalTotal: number;
  isLoggedIn: boolean;
}

export function CheckoutSuccessView({
  placedOrderId,
  fullName,
  city,
  finalTotal,
  isLoggedIn,
}: CheckoutSuccessViewProps) {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 font-sans text-slate-900 bg-white">
      <div className="w-16 h-16 bg-slate-900 text-white border border-slate-900 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-white" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
          Order Confirmed!
        </span>
        <h1 className="text-2xl font-black text-slate-900 uppercase">
          Thank You For Your Order
        </h1>
        <p className="text-xs text-slate-600">
          Order ID:{" "}
          <span className="font-mono text-slate-900 font-bold">
            {placedOrderId || "ORD-323898"}
          </span>
        </p>
      </div>

      <div className="p-6 bg-slate-50 border border-slate-200 text-xs text-slate-900 space-y-3 text-left">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-600">Deliver To:</span>
          <span className="font-bold text-slate-900">
            {fullName} ({city})
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-600">Total Paid:</span>
          <span className="font-mono font-bold text-slate-900">
            {formatPrice(finalTotal)}
          </span>
        </div>
        {isLoggedIn && (
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600">VIP Points Earned:</span>
            <span className="font-mono font-bold text-slate-900">
              +{Math.round(finalTotal * 0.1)} Points
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-600">Estimated Delivery:</span>
          <span className="font-mono font-bold text-slate-900">Within 2-3 Days</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={() => router.push(`/order-tracking?id=${placedOrderId}`)}
          className="flex-1 py-3 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-800 uppercase cursor-pointer transition-all"
        >
          <span>Track Order</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => router.push("/products")}
          className="py-3 px-6 bg-white border border-slate-300 text-slate-900 text-xs font-bold hover:bg-slate-50 uppercase cursor-pointer transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
