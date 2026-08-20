import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how AURA collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">
            Last Updated: August 20, 2026
          </span>
        </div>

        {/* Header Title */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold uppercase">
            <ShieldCheck className="w-4 h-4 text-slate-900" />
            <span>Legal & Data Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
            AURA Privacy Policy
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            At AURA Technologies Inc., we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-xs text-slate-700 leading-relaxed font-normal">
          
          {/* Section 1 */}
          <section className="space-y-3 p-6 bg-slate-50 border border-slate-200 rounded-none">
            <h2 className="text-base font-bold text-slate-900 uppercase flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-900" /> 1. Information We Collect
            </h2>
            <p>
              We collect several types of information from and about users of our website, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Personal Identifiers:</strong> Name, email address, shipping address, billing address, and phone number when you register an account or place an order.</li>
              <li><strong>Order History & Favorites:</strong> Items placed in your shopping cart, wishlisted products, order transactions, and delivery details.</li>
              <li><strong>Analytics & Behavioral Data:</strong> Pages visited, product clicks, search queries executed, device type, IP address, and browser information recorded for personalization.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              2. How We Use Your Information
            </h2>
            <p>
              We use the collected information for key commercial and technical operations, including:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-white border border-slate-200 space-y-1">
                <h3 className="font-bold text-slate-900 text-xs">Order Fulfillment & Delivery</h3>
                <p className="text-[11px] text-slate-500">Processing payments, managing shipping, issuing invoices, and communicating tracking status updates.</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 space-y-1">
                <h3 className="font-bold text-slate-900 text-xs">AI & Dynamic Personalization</h3>
                <p className="text-[11px] text-slate-500">Tailoring product recommendations, catalog flash deals, and browsing history recommendations based on your preferences.</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 space-y-1">
                <h3 className="font-bold text-slate-900 text-xs">Customer Support & Concierge</h3>
                <p className="text-[11px] text-slate-500">Responding to customer support tickets, resolving product inquiries, and processing returns.</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 space-y-1">
                <h3 className="font-bold text-slate-900 text-xs">Security & Fraud Prevention</h3>
                <p className="text-[11px] text-slate-500">Detecting fraudulent transactions, protecting network integrity, and verifying administrative credentials.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              3. Data Security & Storage
            </h2>
            <p>
              We implement enterprise-grade security measures including SSL/TLS encryption, secure database access via Supabase with Row Level Security (RLS), and sanitized API endpoints. Payment processing details are managed by certified PCI-DSS compliant payment gateways and are never stored directly on our servers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 bg-slate-50 border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-900" /> 4. Cookies & Analytics Tracking
            </h2>
            <p>
              AURA uses essential session tokens and analytics events to remember your cart items, login status, and search interactions. You can adjust your browser settings to refuse cookies, though certain interactive store features may not function as intended.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              5. Your Data Rights
            </h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data stored on AURA. You may update your profile details directly from your user dashboard or contact our support team at <a href="mailto:privacy@aura.tech" className="underline font-bold text-slate-900">privacy@aura.tech</a>.
            </p>
          </section>

        </div>

        {/* Footer Contact */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AURA Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4 font-bold text-slate-900 uppercase">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">Contact Support</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
