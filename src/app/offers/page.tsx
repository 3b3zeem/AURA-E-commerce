"use client";

import React, { useState } from "react";
import { Zap, Sparkles, CheckCircle2, ArrowRight, Tag, Mail } from "lucide-react";
import { Offer } from "@/types";
import { subscribeNewsletter } from "@/lib/services/db";
import { useOffers } from "@/hooks/useStoreData";
import { useCartStore } from "@/store/useCartStore";
import toast, { Toaster } from "react-hot-toast";
import { OfferCard } from "@/components/offers/OfferCard";

export default function OffersPage() {
  const { data: rawOffersList = [], isLoading: loading } = useOffers();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { addItem, openCart } = useCartStore();

  const nowStr = new Date().toISOString();
  const offersList = rawOffersList.filter((o) => {
    if (!o.is_active) return false;
    if (o.starts_at && o.starts_at > nowStr) return false;
    if (o.ends_at && o.ends_at < nowStr) return false;
    return true;
  });

  const handleAddBundleToCart = (offer: Offer) => {
    setAddingId(offer.id);
    if (offer.products && offer.products.length > 0) {
      offer.products.forEach((prod) => {
        addItem(prod, 1);
      });
    }

    toast.success(`Bundle "${offer.title}" added to your cart!`, {
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
      setAddingId(null);
      openCart();
    }, 400);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    const res = await subscribeNewsletter(newsletterEmail);
    if (res.success) {
      setSubscribed(true);
      setNewsletterEmail("");
      toast.success(res.message || "Subscribed successfully for release alerts!");
      setTimeout(() => setSubscribed(false), 4000);
    } else {
      toast.error(res.message || "Failed to subscribe");
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-16">
      <Toaster position="top-center" />

      {/* HERO SECTION */}
      <div className="relative bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>AURA Exclusive Releases & Bundles</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight leading-tight">
              Special Offers & Curated Tech Bundles
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Unlock maximum value with our engineered hardware bundles. Every offer includes
              full warranty protection, express shipping, and instant bundle savings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto font-mono text-center">
            <div className="p-4 bg-slate-900/90 border border-slate-800">
              <span className="text-2xl font-black text-amber-400 block">Up to 40%</span>
              <span className="text-[11px] text-slate-400 uppercase font-bold">
                Bundle Discounts
              </span>
            </div>
            <div className="p-4 bg-slate-900/90 border border-slate-800">
              <span className="text-2xl font-black text-emerald-400 block">1-Click</span>
              <span className="text-[11px] text-slate-400 uppercase font-bold">
                Cart Instant Add
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OFFERS LISTING */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase font-mono tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-slate-900" />
              Active Hardware Bundles ({offersList.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Select a bundle below to add all included components to your cart with guaranteed
              offer pricing.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs font-bold uppercase text-slate-500 font-mono">
            Loading active offer bundles...
          </div>
        ) : offersList.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200 p-8 space-y-3">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 uppercase">
              No active offers right now
            </h3>
            <p className="text-xs text-slate-500">
              Subscribe to our newsletter below to get notified as soon as new offer drops go
              live!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {offersList.map((offer, idx) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                idx={idx}
                addingId={addingId}
                handleAddBundleToCart={handleAddBundleToCart}
              />
            ))}
          </div>
        )}

        {/* NEWSLETTER ALERT SUBSCRIPTION BANNER */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center font-sans">
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              <span>Stay Ahead of Limited Drops</span>
            </div>
            <h3 className="text-2xl font-black text-white font-mono tracking-tight">
              Get Early Access to Future Bundles & Release Alerts
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Subscribe to our insider email alerts. Be the first to receive notifications
              whenever a new limited-edition hardware offer goes live on AURA.
            </p>
          </div>

          <div className="md:col-span-5">
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email for offer alerts..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="submit"
                className="px-6 bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black font-mono uppercase transition-colors flex items-center justify-center border border-amber-500 cursor-pointer whitespace-nowrap"
              >
                {subscribed ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                )}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mt-2 font-mono">
                You are on the VIP offer alert list!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
