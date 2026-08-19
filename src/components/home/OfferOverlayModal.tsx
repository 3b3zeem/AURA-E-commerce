"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  X,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Offer } from "@/types";
import { getOffers } from "@/lib/services/db";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

export function OfferOverlayModal() {
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 35,
    seconds: 22,
  });

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadOverlayOffer() {
      const offers = await getOffers(true);
      if (offers && offers.length > 0) {
        const selected =
          offers.find((o) => o.show_in_overlay && o.is_active) || offers[0];

        setActiveOffer(selected);

        // Offer is available; floating trigger pill will be visible.
        // Modal opens on user interaction via floating pill to preserve fast page loading and clean UX.
      }
    }

    loadOverlayOffer();

    const handleDataChange = () => {
      loadOverlayOffer();
    };

    window.addEventListener("aura_data_changed", handleDataChange);
    window.addEventListener("storage", handleDataChange);

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChange);
      window.removeEventListener("storage", handleDataChange);
    };
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Countdown timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (activeOffer) {
      try {
        sessionStorage.setItem(
          `aura_offer_dismissed_${activeOffer.id}`,
          "true",
        );
      } catch {}
    }
  };

  const handleClaimOffer = () => {
    if (!activeOffer) return;

    try {
      sessionStorage.setItem(`aura_offer_dismissed_${activeOffer.id}`, "true");
    } catch {}

    if (activeOffer.products && activeOffer.products.length > 0) {
      activeOffer.products.forEach((prod) => {
        addItem(prod, 1);
      });
    }

    setAdded(true);
    toast.success(`Bundle "${activeOffer.title}" added to your cart!`, {
      style: {
        background: "#0f172a",
        color: "#ffffff",
        borderRadius: "0px",
        fontSize: "12px",
        fontWeight: "bold",
        border: "1px solid #1e293b",
      },
    });

    setTimeout(() => {
      setIsOpen(false);
      openCart();
    }, 600);
  };

  if (!activeOffer) return null;

  return (
    <>
      {/* Floating Offer Trigger Pill (Non-intrusive bottom-left badge) */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 bg-slate-900/95 hover:bg-slate-950 text-white px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center space-x-1.5 sm:space-x-2 font-mono text-xs cursor-pointer group transition-all duration-300 hover:scale-105"
          title="Open Special Offer"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform flex-shrink-0" />
          <span className="font-bold uppercase tracking-wider text-slate-100 text-[10px] sm:text-[11px] font-sans whitespace-nowrap">
            Special Offer
          </span>
          <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black rounded-full font-mono flex-shrink-0">
            -{activeOffer.discount_percentage}%
          </span>
        </motion.button>
      )}

      {/* Main Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto min-h-screen">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl max-h-[calc(100vh-4rem)] md:max-h-[90vh] bg-white border-2 border-slate-900 z-10 text-slate-900 font-sans my-auto"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -top-12 -right-12 sm:top-3 sm:right-3 z-30 p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer shadow-lg border border-slate-700"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Banner Top Strip */}
              <div className="bg-slate-900 text-white px-3 py-2 sm:px-4 sm:py-2 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs font-mono border-b border-slate-800 pr-10 sm:pr-12">
                <div className="flex items-center space-x-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <span className="font-bold uppercase text-amber-400 tracking-wider truncate">
                    {activeOffer.badge || "EXCLUSIVE BUNDLE"}
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center space-x-1 font-bold text-[10px] sm:text-[11px] text-slate-300">
                  <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="hidden sm:inline">Ends in:</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 text-amber-400 font-black font-mono">
                    {String(timeLeft.hours).padStart(2, "0")}:
                    {String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Product Image Column */}
                <div className="relative bg-slate-900 h-44 sm:h-56 md:h-auto min-h-[180px] md:min-h-[340px] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                  <img
                    src={activeOffer.image_url}
                    alt={activeOffer.title}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Savings Tag Floating */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs uppercase tracking-wider shadow-lg border border-amber-500">
                    SAVE {activeOffer.discount_percentage}% OFF
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                      AURA Official Bundle
                    </p>
                    <h4 className="text-xs sm:text-base font-black leading-tight text-white font-mono truncate">
                      {activeOffer.title}
                    </h4>
                  </div>
                </div>

                {/* Right Details Column */}
                <div className="p-4 sm:p-6 flex flex-col justify-between space-y-3 sm:space-y-4 bg-slate-50">
                  <div className="space-y-2 sm:space-y-3">
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono block">
                      Curated Offer Pack
                    </span>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      {activeOffer.title}
                    </h3>

                    {activeOffer.subtitle && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {activeOffer.subtitle}
                      </p>
                    )}

                    {activeOffer.description && (
                      <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-2 hidden sm:block">
                        {activeOffer.description}
                      </p>
                    )}

                    {/* Included Products Preview */}
                    {activeOffer.products &&
                      activeOffer.products.length > 0 && (
                        <div className="space-y-1 pt-1 sm:pt-2">
                          <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-800 tracking-wider block">
                            Included Products ({activeOffer.products.length}):
                          </span>
                          <div className="space-y-1 max-h-24 sm:max-h-36 overflow-y-auto pr-1">
                            {activeOffer.products.map((p, idx) => (
                              <div
                                key={p.id || idx}
                                className="flex items-center space-x-2 p-1 sm:p-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                              >
                                {p.images && p.images[0] && (
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="w-6 h-6 sm:w-7 sm:h-7 object-cover border border-slate-200"
                                  />
                                )}
                                <span className="flex-1 truncate text-[11px] sm:text-xs">
                                  {p.name}
                                </span>
                                <span className="text-slate-500 font-mono text-[10px] sm:text-[11px]">
                                  ${p.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="border-t border-slate-200 pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                    <div className="flex items-baseline space-x-2 sm:space-x-3 font-mono">
                      <span className="text-xl sm:text-2xl font-black text-slate-900">
                        ${activeOffer.offer_price}
                      </span>
                      {activeOffer.original_price > activeOffer.offer_price && (
                        <span className="text-xs sm:text-sm font-bold text-slate-400 line-through">
                          ${activeOffer.original_price}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase">
                        (Instant Savings)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        onClick={handleClaimOffer}
                        disabled={added}
                        className="flex-1 py-2.5 sm:py-3 bg-slate-900 hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border border-slate-800 transition-colors cursor-pointer"
                      >
                        {added ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 text-white" />
                            <span>Claim & Add to Cart</span>
                          </>
                        )}
                      </button>

                      <a
                        href="/offers"
                        className="px-4 py-2.5 sm:py-3 bg-white hover:bg-slate-100 text-slate-900 font-mono text-xs font-bold border border-slate-300 uppercase flex items-center justify-center transition-colors text-center"
                      >
                        Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
