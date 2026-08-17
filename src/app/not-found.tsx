'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] w-full bg-white text-black font-sans flex flex-col items-center justify-center space-y-8 px-4 py-16">
      
      {/* 404 Visual Header */}
      <div className="text-center space-y-4 max-w-lg">
        <div className="w-16 h-16 bg-black text-white mx-auto flex items-center justify-center border border-black">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-black uppercase tracking-widest bg-white px-3 py-1 border border-black inline-block">
            Error 404 • Resource Unavailable
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase text-black tracking-tight">
            Page Not Found
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
          The item or page you are requesting could not be located in our store directory. It may have been relocated, discontinued, or removed.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <Link
          href="/"
          className="w-full sm:flex-1 py-3 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors border border-black cursor-pointer"
        >
          <Home className="w-4 h-4 text-white" />
          <span>Return Home</span>
        </Link>

        <Link
          href="/products"
          className="w-full sm:flex-1 py-3 px-6 bg-white hover:bg-neutral-100 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors border border-black cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-black" />
          <span>Browse Catalog</span>
        </Link>
      </div>
    </div>
  );
}
