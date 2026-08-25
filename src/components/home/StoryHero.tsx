"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  Eye,
  Check,
  Flame,
} from "lucide-react";
import { Story, Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

interface StoryHeroProps {
  stories?: Story[];
  isLoading?: boolean;
}

export function StoryHero({ stories = [], isLoading = false }: StoryHeroProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeProductIndex, setActiveProductIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  const STORY_DURATION = 5000; // 5 seconds per product slide

  const activeStory =
    activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const products: Product[] =
    activeStory?.products && activeStory.products.length > 0
      ? activeStory.products
      : [];
  const currentProduct: Product | undefined = products[activeProductIndex];

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (activeStoryIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeStoryIndex]);

  // Handle auto-advance timer for stories
  useEffect(() => {
    if (activeStoryIndex === null || isPaused || !currentProduct) return;

    const intervalStep = 50; // update progress every 50ms
    const increment = (intervalStep / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [activeStoryIndex, activeProductIndex, isPaused, currentProduct]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [activeStoryIndex, activeProductIndex]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setActiveProductIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handleClose = () => {
    setActiveStoryIndex(null);
    setActiveProductIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handleNext = () => {
    if (activeStoryIndex === null) return;
    const currentIndex = activeStoryIndex;

    if (activeProductIndex < products.length - 1) {
      setActiveProductIndex((prev) => prev + 1);
    } else if (currentIndex < stories.length - 1) {
      setActiveStoryIndex(currentIndex + 1);
      setActiveProductIndex(0);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex === null) return;
    const currentIndex = activeStoryIndex;

    if (activeProductIndex > 0) {
      setActiveProductIndex((prev) => prev - 1);
    } else if (currentIndex > 0) {
      const prevStoryIndex = currentIndex - 1;
      const prevStoryProducts = stories[prevStoryIndex]?.products || [];
      setActiveStoryIndex(prevStoryIndex);
      setActiveProductIndex(
        prevStoryProducts.length > 0 ? prevStoryProducts.length - 1 : 0
      );
    } else {
      setProgress(0);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <section className="py-6 px-4 sm:px-6 lg:px-8 w-full font-sans text-slate-900 bg-[#f8fafc]">
        <div className="flex space-x-4 overflow-x-auto py-2 scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center space-y-2 flex-shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full aspect-square bg-slate-200 animate-pulse border-2 border-slate-300" />
              <div className="h-3 w-16 bg-slate-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 2. Hide completely if not loading and stories array is empty
  if (!isLoading && (!stories || stories.length === 0)) {
    return null;
  }

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 w-full font-sans text-slate-900 bg-[#f8fafc] relative group">
      {/* Instagram Circular Avatars Bar with Smooth Scroll Controls */}
      <div className="relative flex items-center">
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll("left")}
          className="hidden sm:flex absolute -left-2 z-10 p-2 bg-white/95 border border-slate-300 rounded-full shadow-md text-slate-800 hover:bg-slate-900 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Stories Avatars List */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-5 py-2 overflow-x-auto scroll-smooth scrollbar-none w-full"
        >
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => handleOpenStory(idx)}
              className="flex flex-col items-center space-y-2 flex-shrink-0 group/avatar cursor-pointer"
            >
              {/* Circular Avatar with Dynamic Gradient Ring */}
              <div
                style={{ borderRadius: "9999px" }}
                className={`story-avatar relative p-[3px] rounded-full aspect-square bg-gradient-to-tr ${story.bg_gradient || "from-amber-500 via-rose-500 to-fuchsia-600"} flex-shrink-0`}
              >
                <div
                  style={{ borderRadius: "9999px" }}
                  className="story-avatar w-16 h-16 sm:w-20 sm:h-20 rounded-full aspect-square overflow-hidden border-2 border-white bg-slate-900 relative"
                >
                  <img
                    src={story.image_url}
                    alt={story.title}
                    style={{ borderRadius: "9999px" }}
                    className="story-avatar w-full h-full object-cover rounded-full aspect-square"
                  />
                </div>
                {/* Sleek Floating Count Badge */}
                {story.products && story.products.length > 0 && (
                  <span className="story-avatar absolute -bottom-1 -right-1 bg-slate-950 border-2 border-white text-[9px] font-black text-white px-1.5 py-0.5 rounded-full shadow-sm">
                    {story.products.length}
                  </span>
                )}
              </div>

              {/* Title */}
              <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[88px] text-center tracking-tight group-hover/avatar:text-slate-950">
                {story.title}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll("right")}
          className="hidden sm:flex absolute -right-2 z-10 p-2 bg-white/95 border border-slate-300 rounded-full shadow-md text-slate-800 hover:bg-slate-900 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Full-Screen Instagram Story Viewer Overlay */}
      <AnimatePresence>
        {activeStory && (
          <div
            className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Story"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Desktop Side Navigation Arrows (Outside Card) */}
            {activeStoryIndex !== null && activeStoryIndex > 0 && (
              <button
                onClick={handlePrev}
                className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Previous Story"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            {activeStoryIndex !== null &&
              activeStoryIndex < stories.length - 1 && (
                <button
                  onClick={handleNext}
                  className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  title="Next Story"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              )}

            {/* Center Story Phone Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative w-full max-w-[410px] h-[85vh] max-h-[740px] flex flex-col justify-between overflow-hidden shadow-2xl rounded-2xl border border-white/10 bg-slate-950`}
            >
              {/* Product Background Image */}
              {currentProduct ? (
                <img
                  src={currentProduct.images[0] || activeStory.image_url}
                  alt={currentProduct.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeStory.image_url}
                  alt={activeStory.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Dark Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

              {/* Top Progress Bars & Header */}
              <div className="relative z-10 p-4 space-y-3">
                {/* Segmented Progress Bar */}
                <div className="flex space-x-1 w-full">
                  {products.length > 0 ? (
                    products.map((_, pIdx) => {
                      let barWidth = "0%";
                      if (pIdx < activeProductIndex) barWidth = "100%";
                      else if (pIdx === activeProductIndex)
                        barWidth = `${progress}%`;

                      return (
                        <div
                          key={pIdx}
                          className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                        >
                          <div
                            className="h-full bg-white transition-all duration-75 ease-linear"
                            style={{ width: barWidth }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Story Author / Header Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={activeStory.image_url}
                      alt={activeStory.title}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {activeStory.title}
                      </h4>
                      {activeStory.subtitle && (
                        <p className="text-[11px] text-white/80 font-medium">
                          {activeStory.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Play/Pause Control */}
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-1.5 text-white/80 hover:text-white rounded-full bg-black/40 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Clickable Navigation Areas (Left 30% = Prev, Right 70% = Next) */}
              <div className="absolute inset-0 z-0 flex">
                <div
                  onClick={handlePrev}
                  className="w-1/3 h-full cursor-pointer"
                  title="Previous"
                />
                <div
                  onClick={handleNext}
                  className="w-2/3 h-full cursor-pointer"
                  title="Next"
                />
              </div>

              {/* Bottom Interactive Product Card (Shoppable Pin) */}
              {currentProduct && (
                <div className="relative z-10 p-4">
                  <motion.div
                    key={currentProduct.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-slate-900/90 backdrop-blur-md border border-white/20 p-3.5 rounded-xl shadow-2xl flex items-center space-x-3"
                  >
                    <img
                      src={currentProduct.images[0]}
                      alt={currentProduct.name}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase rounded">
                          FEATURED
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {currentProduct.brand || "AURA"}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white truncate mt-0.5">
                        {currentProduct.name}
                      </h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {formatPrice(currentProduct.price)}
                        </span>
                        {currentProduct.original_price && (
                          <span className="text-[10px] text-slate-400 line-through font-mono">
                            {formatPrice(currentProduct.original_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => handleAddToCart(e, currentProduct)}
                        className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded flex items-center space-x-1 transition-all cursor-pointer ${
                          addedProductId === currentProduct.id
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-400 hover:bg-amber-300 text-slate-950"
                        }`}
                      >
                        {addedProductId === currentProduct.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ADDED</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>BUY NOW</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/products/${currentProduct.id}`}
                        onClick={handleClose}
                        className="px-3 py-1 text-[10px] font-mono font-bold uppercase text-white/80 hover:text-white text-center underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
