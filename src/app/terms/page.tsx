import React from "react";
import Link from "next/link";
import { FileText, ShieldAlert, CheckCircle2, ArrowLeft, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Review the terms, conditions, and store policies governing AURA platform purchases.",
};

export default function TermsConditionsPage() {
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
            <Scale className="w-4 h-4 text-slate-900" />
            <span>User Agreement & Store Rules</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
            Terms & Conditions
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Welcome to AURA. By accessing or using our platform, placing orders, or utilizing our services, you agree to be bound by these terms and conditions. Please read them carefully before making purchases.
          </p>
        </div>

        {/* Terms Body */}
        <div className="space-y-8 text-xs text-slate-700 leading-relaxed font-normal">
          
          {/* Section 1 */}
          <section className="space-y-3 p-6 bg-slate-50 border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-900" /> 1. Account Eligibility & Registration
            </h2>
            <p>
              By creating an account on AURA, you confirm that you are at least 18 years of age or accessing the platform under the supervision of a parent or legal guardian. You are responsible for maintaining the confidentiality of your account credentials and password.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              2. Orders, Pricing & Product Availability
            </h2>
            <p>
              All prices listed on AURA are specified in Egyptian Pounds (EGP) and include applicable sales tax unless stated otherwise.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Price Adjustments & Flash Deals:</strong> Promotional offers, flash deal discounts, and bundle prices are valid only during the designated timeframe.</li>
              <li><strong>Order Confirmation:</strong> Receipt of an electronic order confirmation does not signify our final acceptance of your order. We reserve the right to decline or cancel orders in cases of stock miscalculations or pricing errors.</li>
              <li><strong>Express Checkout:</strong> 1-Click Express Orders are processed immediately upon confirmation and sent directly to fulfillment dispatch.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              3. Shipping, Delivery & Inspection
            </h2>
            <p>
              Delivery estimates are calculated dynamically based on your selected Governorate and city. Standard shipping typically delivers within 1 to 3 business days across Egypt. Customers are required to inspect package integrity upon delivery.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 bg-slate-50 border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-900" /> 4. Return, Refund & Warranty Policy
            </h2>
            <p>
              AURA offers a 30-day hassle-free return policy for unopened items in original packaging. Hardware products come backed by a 2-Year Hardware Warranty unless specified otherwise on the product specs panel. Extended protection plans (Boxi) follow their respective terms upon purchase.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              5. Intellectual Property
            </h2>
            <p>
              All content on AURA—including logos, product graphics, UI design, text, software code, and recommendation algorithms—is the exclusive property of AURA Technologies Inc. and protected under Egyptian and international copyright laws.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              6. Limitation of Liability & Contact
            </h2>
            <p>
              AURA shall not be liable for indirect, incidental, or consequential damages resulting from product misuse or site downtime. For legal inquiries regarding these terms, please contact <a href="mailto:legal@aura.tech" className="underline font-bold text-slate-900">legal@aura.tech</a>.
            </p>
          </section>

        </div>

        {/* Footer Contact */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AURA Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4 font-bold text-slate-900 uppercase">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">Contact Support</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
