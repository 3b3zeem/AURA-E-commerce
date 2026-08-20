"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductCarouselSectionProps {
  title: string;
  subtitle?: string;
  actionLink?: {
    href: string;
    label: string;
  };
  products: Product[];
  itemsPerPage?: number;
}

export function ProductCarouselSection({
  title,
  subtitle,
  actionLink,
  products,
}: ProductCarouselSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const updateVisibleCount = () => {
      const w = window.innerWidth;
      if (w >= 1280) {
        setVisibleCount(5);
      } else if (w >= 1024) {
        setVisibleCount(4);
      } else if (w >= 768) {
        setVisibleCount(3);
      } else if (w >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  if (!products || products.length === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(products.length / visibleCount));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);

  const currentProducts = products.slice(
    safeCurrentPage * visibleCount,
    (safeCurrentPage + 1) * visibleCount
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const getGridColsClass = () => {
    switch (visibleCount) {
      case 5:
        return "grid-cols-5";
      case 4:
        return "grid-cols-4";
      case 3:
        return "grid-cols-3";
      case 2:
        return "grid-cols-2";
      case 1:
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div className="pt-8 border-t border-slate-200 space-y-4 font-sans text-slate-900">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            {title}
          </h2>
          {actionLink && (
            <Link
              href={actionLink.href}
              className="text-xs font-bold text-slate-900 hover:text-slate-600 uppercase underline transition-colors"
            >
              {actionLink.label}
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {subtitle && (
            <span className="hidden sm:inline text-xs text-slate-500 mr-2">
              {subtitle}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-600 font-mono">
            Page {safeCurrentPage + 1} of {totalPages}
          </span>
        </div>
      </div>

      {/* Carousel Grid Row with Left & Right Arrow Navigation Buttons */}
      <div className="relative group/carousel">
        {/* Left Nav Button */}
        {totalPages > 1 && (
          <button
            type="button"
            onClick={handlePrevPage}
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-11 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-md flex items-center justify-center text-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </button>
        )}

        {/* Dynamic Single-Row Product Cards Grid */}
        <div className={`grid gap-4 ${getGridColsClass()}`}>
          {currentProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

        {/* Right Nav Button */}
        {totalPages > 1 && (
          <button
            type="button"
            onClick={handleNextPage}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-11 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-md flex items-center justify-center text-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5 text-slate-800" />
          </button>
        )}
      </div>
    </div>
  );
}
