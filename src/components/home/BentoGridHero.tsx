"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBentoItems } from "@/hooks/useStoreData";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Grid,
  Truck,
  RotateCcw,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { BentoItem } from "@/types";

export function BentoGridHero() {
  const { data: bentoItems = [], isLoading } = useBentoItems();

  const fallbackSpotlight: BentoItem = {
    id: "default-spotlight",
    box_type: "spotlight",
    title: "AURA CYBERHEADSET PRO '28",
    subtitle: "NEXT-GEN PLANAR ACOUSTICS",
    description:
      "Beryllium-coated 50mm dynamic drivers with 48kHz lossless wireless streaming & magnetic ear cushions.",
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=75",
    cta_text: "EXPLORE HEADSET",
    cta_link: "/products",
    badge_text: "STAR SPOTLIGHT",
    display_order: 1,
    is_active: true,
  };

  const fallbackFlash: BentoItem = {
    id: "default-flash",
    box_type: "flash_deals",
    title: "DAILY TECH DROPS",
    description: "Limited flagship drops refreshed every 24 hours.",
    image_url:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=75",
    cta_text: "CLAIM DEAL",
    cta_link: "/products",
    badge_text: "LIMITED DROP",
    discount_percentage: 25,
    display_order: 2,
    is_active: true,
  };

  const fallbackGuarantee: BentoItem = {
    id: "default-guarantee",
    box_type: "guarantee",
    title: "THE AURA HARDWARE PROMISE",
    description: "Direct 2-year warranty replacement & 24/7 concierge.",
    cta_text: "OUR PROMISE",
    cta_link: "/about",
    badge_text: "VERIFIED",
    display_order: 3,
    is_active: true,
  };

  const fallbackCategories: BentoItem = {
    id: "default-categories",
    box_type: "categories",
    title: "EXPLORE AUDIO & TECH CATALOG",
    description:
      "Browse flagship planar headphones, IEM monitors & smart workstation gear.",
    image_url:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=75",
    cta_text: "BROWSE ALL",
    cta_link: "/products",
    badge_text: "CATALOG",
    display_order: 4,
    is_active: true,
  };

  const spotlight =
    bentoItems.find((i) => i.box_type === "spotlight") || fallbackSpotlight;
  const flash =
    bentoItems.find((i) => i.box_type === "flash_deals") || fallbackFlash;
  const guarantee =
    bentoItems.find((i) => i.box_type === "guarantee") || fallbackGuarantee;
  const categories =
    bentoItems.find((i) => i.box_type === "categories") || fallbackCategories;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-6 lg:pb-12 font-sans">
      {/* Section Label */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-slate-900 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
            AURA SPOTLIGHT & CURATED HIGHLIGHTS
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase hidden sm:block">
          [ BENTO GRID ]
        </span>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-[280px]">
        {/* SPOTLIGHT — 2×2 */}
        {spotlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative lg:col-span-2 lg:row-span-2 overflow-hidden border border-slate-900 bg-slate-950 text-white flex flex-col justify-end p-6 sm:p-8 md:p-10 shadow-2xl"
          >
            {spotlight.image_url && (
              <img
                src={spotlight.image_url}
                alt={spotlight.title}
                fetchPriority="high"
                decoding="sync"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />

            <div className="absolute top-6 left-6 z-10">
              <span className="px-3 py-1.5 bg-slate-900/90 text-white border border-slate-700 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{spotlight.badge_text || "STAR SPOTLIGHT"}</span>
              </span>
            </div>

            <div className="relative z-10 space-y-3 max-w-xl">
              {spotlight.subtitle && (
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block font-mono">
                  {spotlight.subtitle}
                </span>
              )}
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                {spotlight.title}
              </h3>
              {spotlight.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                  {spotlight.description}
                </p>
              )}
              <div className="pt-2">
                <Link
                  href={spotlight.cta_link || "/products"}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs uppercase tracking-wider border border-white transition-all transform hover:-translate-y-0.5 shadow-lg"
                >
                  <span>{spotlight.cta_text || "SHOP NOW"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* FLASH DEALS — 1×1 */}
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden border border-slate-300 bg-slate-900 text-white p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
          >
            {flash.image_url && (
              <img
                src={flash.image_url}
                alt={flash.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2.5 py-1 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3 h-3 fill-slate-900 animate-bounce" />
                <span>{flash.badge_text || "LIMITED DROP"}</span>
              </span>
              {flash.discount_percentage && (
                <span className="font-mono text-xs font-black text-amber-400 bg-slate-950/80 px-2 py-0.5 border border-amber-400/30">
                  -{flash.discount_percentage}% OFF
                </span>
              )}
            </div>

            <div className="relative z-10 space-y-2 mt-auto">
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-snug">
                {flash.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2">
                {flash.description}
              </p>
              <Link
                href={flash.cta_link || "/products?flash=true"}
                className="inline-flex items-center space-x-2 pt-2 text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider group-hover:underline"
              >
                <span>{flash.cta_text || "CLAIM DEAL"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* GUARANTEE — 1×1 */}
        {guarantee && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative overflow-hidden border border-slate-200 bg-white text-slate-900 p-6 flex flex-col justify-between hover:border-slate-900 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-slate-100 border border-slate-300 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <ShieldCheck className="w-5 h-5 text-slate-900 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-mono font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 border border-emerald-300 uppercase flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                <span>{guarantee.badge_text || "VERIFIED"}</span>
              </span>
            </div>

            <div className="space-y-3 my-auto">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                {guarantee.title}
              </h3>
              <div className="space-y-1.5 text-xs text-slate-600 font-semibold">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>100% Authentic Guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>Express Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
              </div>
            </div>

            <Link
              href={guarantee.cta_link || "/about"}
              className="inline-flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-900 uppercase tracking-wider"
            >
              <span>{guarantee.cta_text || "OUR PROMISE"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}

        {/* CATEGORIES — 2×1 */}
        {categories && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative lg:col-span-2 overflow-hidden border border-slate-300 bg-slate-100 text-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-slate-900 transition-all shadow-sm"
          >
            {categories.image_url && (
              <img
                src={categories.image_url}
                alt={categories.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-20"
              />
            )}

            <div className="relative z-10 space-y-2 max-w-lg">
              <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider inline-flex items-center space-x-1">
                <Grid className="w-3 h-3 text-white" />
                <span>{categories.badge_text || "CATALOG"}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight leading-tight">
                {categories.title}
              </h3>
              {categories.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {categories.description}
                </p>
              )}
            </div>

            <div className="relative z-10 flex-shrink-0 w-full sm:w-auto">
              <Link
                href={categories.cta_link || "/products"}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider border border-slate-900 transition-all transform hover:-translate-y-0.5 shadow-md"
              >
                <span>{categories.cta_text || "BROWSE ALL"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
