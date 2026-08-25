"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShoppingBag, CheckCircle2 } from "lucide-react";
import { Offer } from "@/types";
import { OfferCountdown } from "./OfferCountdown";

interface OfferCardProps {
  offer: Offer;
  idx: number;
  addingId: string | null;
  handleAddBundleToCart: (offer: Offer) => void;
}

export function OfferCard({
  offer,
  idx,
  addingId,
  handleAddBundleToCart,
}: OfferCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-white border-2 border-slate-200 hover:border-slate-900 transition-all overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm font-sans"
    >
      {/* Image Column */}
      <div className="lg:col-span-5 relative bg-slate-950 min-h-[260px] lg:min-h-full flex items-center justify-center p-6 overflow-hidden">
        <img
          src={offer.image_url}
          alt={offer.title}
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        <div className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-black px-3 py-1 text-xs uppercase tracking-wider font-mono border border-amber-500">
          {offer.badge || `SAVE ${offer.discount_percentage}%`}
        </div>

        {offer.show_in_overlay && (
          <div className="absolute top-4 right-4 bg-slate-900 text-amber-400 font-bold px-2.5 py-1 text-[10px] uppercase font-mono border border-amber-400/40">
            Featured Entrance Offer
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">
            AURA Verified Deal
          </span>
          <h3 className="text-lg font-black text-white font-mono leading-tight">
            {offer.title}
          </h3>
        </div>
      </div>

      {/* Details Column */}
      <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-slate-900">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                  {offer.title}
                </h3>
                {offer.ends_at && <OfferCountdown endsAt={offer.ends_at} />}
              </div>
              {offer.subtitle && (
                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                  {offer.subtitle}
                </p>
              )}
            </div>

            <div className="text-right font-mono">
              <span className="text-xs text-slate-400 line-through block">
                ${offer.original_price}
              </span>
              <span className="text-2xl font-black text-slate-900">
                ${offer.offer_price}
              </span>
            </div>
          </div>

          {offer.description && (
            <p className="text-xs text-slate-600 leading-relaxed">{offer.description}</p>
          )}

          {/* Included Products List */}
          {offer.products && offer.products.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Included Products in Bundle ({offer.products.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {offer.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center space-x-3 p-2 bg-slate-50 border border-slate-200 text-xs"
                  >
                    {prod.images && prod.images[0] && (
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-10 object-cover border border-slate-300 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ${prod.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold uppercase">
            <ShieldCheck className="w-4 h-4 text-slate-900" />
            <span>Free Express Delivery & Warranty Included</span>
          </div>

          <button
            onClick={() => handleAddBundleToCart(offer)}
            disabled={addingId === offer.id}
            className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-2 border border-slate-800 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span>
              {addingId === offer.id ? "Adding Bundle..." : "Add Entire Bundle to Cart"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
