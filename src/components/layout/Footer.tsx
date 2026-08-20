"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  ArrowRight,
  Check,
  Tag,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { subscribeNewsletter } from "@/lib/services/db";
import toast from "react-hot-toast";

export function Footer() {
  const { profile } = useUserStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitting(true);
      const res = await subscribeNewsletter(email.trim());
      setSubmitting(false);

      if (res.success) {
        setSubscribed(true);
        setEmail("");
        toast.success(res.message || "Subscribed successfully!");
        setTimeout(() => setSubscribed(false), 4000);
      } else {
        toast.error(res.message || "Subscription failed");
      }
    }
  };

  return (
    <footer className="bg-white text-slate-900 text-xs border-t border-slate-200 font-sans w-full mt-12">
      {/* Full-width Back to Top Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold tracking-wider text-center transition-colors cursor-pointer block border-b border-slate-200 active:bg-slate-100"
      >
        Back to top
      </button>
      {/* Value Proposition Highlights */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-200">
          <div className="p-2.5 bg-slate-900 text-white border border-slate-800">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900">
              Express Shipping
            </h4>
            <p className="text-[11px] text-slate-500">
              Dispatch within 24 hours
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-200">
          <div className="p-2.5 bg-slate-900 text-white border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900">
              2-Year Warranty
            </h4>
            <p className="text-[11px] text-slate-500">
              Hardware replacement protection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-200">
          <div className="p-2.5 bg-slate-900 text-white border border-slate-800">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900">
              Hassle-Free Returns
            </h4>
            <p className="text-[11px] text-slate-500">30 days return policy</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-200">
          <div className="p-2.5 bg-slate-900 text-white border border-slate-800">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900">
              24/7 AI Concierge
            </h4>
            <p className="text-[11px] text-slate-500">
              Instant assistant support
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center font-black border border-slate-800">
              <Sparkles className="w-5 h-5 fill-current text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 font-mono">
              aura
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            High-performance hardware & smart tech accessories engineered with
            precision craftsmanship.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 font-bold uppercase">
            <li>
              <Link
                href="/offers"
                className="text-amber-800 hover:text-amber-950 font-black transition-colors flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-amber-800" /> Exclusive Offers
                & Bundles
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-slate-900 transition-colors underline"
              >
                About AURA
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-slate-900 transition-colors underline"
              >
                Catalog Explorer
              </Link>
            </li>
            <li>
              <Link
                href="/blogs"
                className="hover:text-slate-900 transition-colors underline"
              >
                Journal & Blogs
              </Link>
            </li>
            <li>
              <Link
                href="/categories"
                className="hover:text-slate-900 transition-colors underline"
              >
                Product Categories
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-slate-900 transition-colors underline"
              >
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 font-bold uppercase">
            {profile && (
              <li>
                <Link
                  href="/profile"
                  className="hover:text-slate-900 transition-colors underline"
                >
                  User Profile
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/cart"
                className="hover:text-slate-900 transition-colors underline"
              >
                Shopping Cart
              </Link>
            </li>
            {profile && (
              <>
                <li>
                  <Link
                    href="/addresses"
                    className="hover:text-slate-900 transition-colors underline"
                  >
                    Your Addresses
                  </Link>
                </li>
                <li>
                  <Link
                    href="/checkout"
                    className="hover:text-slate-900 transition-colors underline"
                  >
                    Checkout
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Links Column 3: Dedicated Legal & Policies List */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">
            Legal & Policies
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 font-bold uppercase">
            <li>
              <Link
                href="/privacy"
                className="hover:text-slate-900 transition-colors underline"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-slate-900 transition-colors underline"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase">
            Newsletter
          </h4>
          <p className="text-xs text-slate-600">
            Subscribe for early access to product drops and release alerts.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex space-x-2"
            data-webmcp-form="newsletter-subscribe-form"
            data-webmcp-name="Newsletter Subscription Form"
            data-webmcp-action="subscribe_newsletter"
          >
            <input
              type="email"
              placeholder="Your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
            <button
              type="submit"
              disabled={submitting}
              aria-label="Subscribe to newsletter"
              className="px-4 bg-slate-900 text-white hover:bg-black transition-colors flex items-center justify-center border border-slate-800 cursor-pointer disabled:opacity-50"
            >
              <span className="sr-only">Subscribe</span>
              {subscribed ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <ArrowRight className="w-4 h-4 text-white" />
              )}
            </button>
          </form>
          {subscribed && (
            <p className="text-[11px] font-bold text-emerald-600 uppercase">
              Subscribed successfully!
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-bold uppercase">
        © {new Date().getFullYear()} AURA Technologies Inc. All rights reserved.
      </div>
    </footer>
  );
}
