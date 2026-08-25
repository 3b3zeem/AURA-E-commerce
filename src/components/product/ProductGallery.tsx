"use client";

import React from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedImage: string;
  setSelectedImage: (img: string) => void;
  discount: number;
  badge?: string;
}

export function ProductGallery({
  images,
  productName,
  selectedImage,
  setSelectedImage,
  discount,
  badge,
}: ProductGalleryProps) {
  return (
    <div className="lg:col-span-4 flex flex-col-reverse sm:flex-row gap-3 items-start lg:sticky top-24 font-sans">
      {/* Vertical Thumbnails */}
      {images.length > 1 && (
        <div className="flex sm:flex-col gap-2 max-h-[500px] w-full sm:w-auto shrink-0 py-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(img)}
              className={`w-14 h-14 sm:w-16 sm:h-16 bg-white border transition-all cursor-pointer ${
                selectedImage === img
                  ? "border-slate-900 border-2 shadow-sm scale-105"
                  : "border-slate-200 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Display Image */}
      <div className="relative aspect-square w-full flex-1 bg-white border border-slate-200 overflow-hidden group">
        <img
          src={selectedImage || images[0]}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 uppercase border border-rose-700 shadow-md">
            -{discount}% OFF
          </span>
        )}
        {badge && (
          <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase border border-amber-600 shadow-md">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
