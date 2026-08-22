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
  stories: Story[];
}

export function StoryHero({ stories }: StoryHeroProps) {
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
        prevStoryProducts.length > 0 ? prevStoryProducts.length - 1 : 0,
      );
    } else {
      setProgress(0);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
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

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 w-full font-sans text-slate-900 bg-[#f8fafc]">
      {/* Instagram Circular Avatars Bar */}
      {stories.length === 0 ? (
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
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex space-x-5 py-2 scroll-smooth"
        >
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => handleOpenStory(idx)}
              className="flex flex-col items-center space-y-2 flex-shrink-0 group cursor-pointer"
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
              <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[88px] text-center tracking-tight group-hover:text-slate-950">
                {story.title}
              </span>
            </div>
          ))}
        </div>
      )}

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
              className={`relative w-full max-w-[410px] h-[85vh] max-h-[740px] flex flex-col justify-between`}
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

              {/* Gradient Dark Overlays for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent via-50% to-black/90 pointer-events-none" />

              {/* TOP HEADER OVERLAY */}
              <div className="relative z-30 p-3 space-y-2">
                {/* Segmented Multi-Progress Bar */}
                <div className="flex gap-1.5 w-full">
                  {products.length > 0 ? (
                    products.map((_, idx) => {
                      let fillPercent = 0;
                      if (idx < activeProductIndex) fillPercent = 100;
                      else if (idx === activeProductIndex)
                        fillPercent = progress;
                      else fillPercent = 0;

                      return (
                        <div
                          key={idx}
                          className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                        >
                          <div
                            className="h-full bg-white transition-all duration-75 ease-linear"
                            style={{ width: `${fillPercent}%` }}
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

                {/* Story Header (Avatar + Title + Controls) */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-fuchsia-600">
                      <img
                        src={activeStory.image_url}
                        alt={activeStory.title}
                        className="w-full h-full rounded-full object-cover border border-slate-900"
                      />
                    </div>
                    <div className="text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white tracking-tight">
                          {activeStory.title}
                        </span>
                        <span className="text-[10px] text-white/70 font-semibold bg-white/10 px-1.5 py-0.5 rounded">
                          {activeProductIndex + 1}/{products.length || 1}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/70 line-clamp-1">
                        {activeStory.subtitle || "Exclusive Collection"}
                      </p>
                    </div>
                  </div>

                  {/* Top Control Action Icons (Pause/Play, Mute) */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
                      title={isPaused ? "Resume" : "Pause"}
                    >
                      {isPaused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* TAP NAVIGATION TOUCH ZONES (Left 35% prev, Right 35% next) */}
              <div className="absolute inset-0 z-20 flex">
                <div
                  onClick={handlePrev}
                  className="w-1/3 h-full cursor-pointer"
                  title="Previous Item"
                />
                <div
                  onMouseDown={() => setIsPaused(true)}
                  onMouseUp={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                  className="w-1/3 h-full cursor-pointer"
                />
                <div
                  onClick={handleNext}
                  className="w-1/3 h-full cursor-pointer"
                  title="Next Item"
                />
              </div>

              {/* BOTTOM PRODUCT DETAILS CARD DRAWER */}
              {currentProduct && (
                <div className="relative z-30 m-3 bg-black/75 backdrop-blur-xl p-4 rounded-xl border border-white/15 text-white space-y-2.5 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {currentProduct.badge ||
                        currentProduct.brand ||
                        "Featured Drop"}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {formatPrice(currentProduct.price)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 tracking-tight">
                      {currentProduct.name}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                      {currentProduct.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={(e) => handleAddToCart(e, currentProduct)}
                      className={`py-2 px-3 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        addedProductId === currentProduct.id
                          ? "bg-emerald-600 text-white border border-emerald-500"
                          : "bg-white text-slate-950 hover:bg-slate-200"
                      }`}
                    >
                      {addedProductId === currentProduct.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/products/${currentProduct.id}`}
                      onClick={handleClose}
                      className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-1.5 border border-white/20 text-center"
                    >
                      <Eye className="w-3.5 h-3.5 text-white" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
