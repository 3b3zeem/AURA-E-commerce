'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Flame } from 'lucide-react';
import { Story } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface StoryHeroProps {
  stories: Story[];
}

export function StoryHero({ stories }: StoryHeroProps) {
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  React.useEffect(() => {
    if (activeStory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeStory]);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 w-full font-sans text-slate-900">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider mb-3 border border-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Featured Collections</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Curated Drops
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Explore active product showcases and specs.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase">
          <Sparkles className="w-4 h-4 text-slate-900" />
          <span>Select card to view drop</span>
        </div>
      </div>

      {/* Stories Horizontal Cards or Skeleton State */}
      {stories.length === 0 ? (
        <div className="flex space-x-5 overflow-x-auto pb-4 min-h-[384px]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-96 bg-slate-900 border border-slate-800 animate-pulse p-6 flex flex-col justify-end space-y-3"
            >
              <div className="h-4 w-20 bg-slate-800" />
              <div className="h-6 w-40 bg-slate-800" />
              <div className="h-3 w-28 bg-slate-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex space-x-5 overflow-x-auto pb-4">
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="group relative flex-shrink-0 w-64 h-96 cursor-pointer overflow-hidden border border-slate-200 bg-white hover:border-slate-900 transition-all"
            >
              {/* Story Image */}
              <img
                src={story.image_url}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Top Ring Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider bg-white px-3 py-1 border border-slate-300">
                  Drop #{idx + 1}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 inset-x-0 p-6 space-y-2 text-left z-10">
                <h3 className="text-lg font-black text-white uppercase leading-tight">
                  {story.title}
                </h3>
                {story.subtitle && (
                  <p className="text-xs text-slate-200 line-clamp-2">
                    {story.subtitle}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1 group-hover:underline">
                    View Drop <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span className="text-[10px] font-bold text-white bg-slate-900 px-2.5 py-1 border border-slate-800">
                    {story.products?.length || 1} Items
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Modal */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white overflow-hidden max-h-[90vh] flex flex-col border border-slate-300 text-slate-900"
            >
              {/* Header */}
              <div className="p-5 bg-slate-100 text-slate-900 flex items-center justify-between border-b border-slate-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-bold border border-slate-800">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase text-slate-900">{activeStory.title}</h2>
                    <p className="text-xs text-slate-600">{activeStory.subtitle}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 border border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Story Products List */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Featured Items in Collection
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {activeStory.products && activeStory.products.length > 0 ? (
                    activeStory.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-3">
                      <EmptyState
                        title="No Products Attached"
                        description="This collection has no items linked."
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
