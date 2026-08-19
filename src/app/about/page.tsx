import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, ShieldCheck, Cpu, ArrowRight, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | AURA Luxury Tech & Hardware',
  description: 'Learn about AURA: High-performance audio, wearable technology, and flagship hardware engineered for creators and tech enthusiasts.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-mono font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>THE AURA STANDARD</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 uppercase font-mono leading-none">
            ENGINEERED FOR THE FUTURE
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            AURA is a high-performance tech hardware company producing luxury acoustics, bio-tracking wearables, and precision workspace accessories built for creators and enthusiasts worldwide.
          </p>
        </section>

        {/* Pillars Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-8 bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-900 transition-colors shadow-sm">
            <div className="p-3 bg-slate-900 text-amber-400 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Planar Acoustics</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Custom 40mm planar magnetic drivers delivering ultra-pure spatial sound, zero distortion, and active noise cancellation up to -45dB.
            </p>
          </div>

          <div className="p-8 bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-900 transition-colors shadow-sm">
            <div className="p-3 bg-slate-900 text-amber-400 w-fit">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Grade-5 Titanium</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crafted from aerospace-grade titanium and sapphire glass for extreme durability, ultralight weight, and effortless daily comfort.
            </p>
          </div>

          <div className="p-8 bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-900 transition-colors shadow-sm">
            <div className="p-3 bg-slate-900 text-amber-400 w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">2-Year Warranty</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every AURA flagship hardware unit is backed by a 2-year direct replacement warranty and 24/7 concierge support.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="p-8 sm:p-12 bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">EXPLORE OUR CATALOG</h3>
            <p className="text-xs text-slate-300">Discover flagship headphones, titanium wearables, and mechanical keyboards.</p>
          </div>
          <Link
            href="/products"
            className="px-6 py-3 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
