"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flame, Clock, X } from "lucide-react";
import { Category } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { trackSearchQuery } from "@/lib/analytics/tracker";

import {
  getTrendingSearchesFromDb,
  recordSearchQueryInDb,
} from "@/lib/services/adminService";

interface NavbarSearchProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
}

export function NavbarSearch({
  categories,
  selectedCategory,
  setSelectedCategory,
  isSearchFocused,
  setIsSearchFocused,
}: NavbarSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("aura_recent_searches");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const hasFetchedTrendingRef = useRef(false);

  // Lazy load Trending ONLY when search input is focused
  useEffect(() => {
    if (!isSearchFocused || hasFetchedTrendingRef.current) return;
    hasFetchedTrendingRef.current = true;

    async function fetchTrending() {
      try {
        const data = await getTrendingSearchesFromDb();
        if (data && data.length > 0) {
          setTrendingSearches(data);
        } else {
          setTrendingSearches([
            "CyberHeadset",
            "OLED Display",
            "Wireless Audio",
            "Smartwatch Pro",
          ]);
        }
      } catch {
        setTrendingSearches([
          "CyberHeadset",
          "OLED Display",
          "Wireless Audio",
          "Smartwatch Pro",
        ]);
      }
    }
    fetchTrending();
  }, [isSearchFocused]);

  // Click Outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSearchFocused]);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    const updated = [
      clean,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase(),
      ),
    ].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aura_recent_searches", JSON.stringify(updated));
      } catch {}
    }

    // Record search query in Supabase DB via service layer
    recordSearchQueryInDb(clean).catch(() => {});
  };

  const removeRecentSearch = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aura_recent_searches", JSON.stringify(updated));
      } catch {}
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("aura_recent_searches");
      } catch {}
    }
  };

  const executeSearch = (queryToSearch: string) => {
    if (!queryToSearch.trim() && selectedCategory === "all") return;
    saveRecentSearch(queryToSearch);
    if (queryToSearch.trim()) {
      trackSearchQuery(queryToSearch.trim());
    }
    setIsSearchFocused(false);
    const url = `/products?search=${encodeURIComponent(queryToSearch)}&category=${selectedCategory}`;
    window.location.href = url;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  return (
    <div
      ref={searchContainerRef}
      className="relative order-3 sm:order-none w-full sm:w-auto sm:flex-1 sm:max-w-2xl lg:max-w-3xl z-40"
    >
      <form
        onSubmit={handleSearchSubmit}
        className="w-full flex items-center h-9 sm:h-10 bg-slate-100 text-slate-900 border border-slate-300 transition-all focus-within:border-slate-900"
      >
        {/* Custom Category Dropdown Selector */}
        <div className="hidden sm:flex items-center">
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={[
              { value: "all", label: "All" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            triggerClassName="h-10 bg-slate-200 border-0 border-r border-slate-300 hover:bg-slate-300 text-xs font-semibold text-slate-800"
          />
        </div>

        {/* Search Input Text Box */}
        <input
          type="text"
          placeholder="Search AURA products..."
          value={searchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium h-full bg-transparent"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-slate-900 hover:bg-black text-white px-3 sm:px-4 h-full flex items-center justify-center transition-colors font-bold flex-shrink-0 cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </form>

      {/* Interactive Recent & Trending Searches Dropdown */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 z-50 overflow-hidden font-sans text-slate-900 p-4 space-y-4 shadow-none"
          >
            {/* 1. Trending Searches */}
            {trendingSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {trendingSearches.map((term, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term);
                        executeSearch(term);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-300 text-xs font-bold uppercase transition-colors flex items-center space-x-1 cursor-pointer text-slate-800"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-slate-900" />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllRecent}
                    className="text-[10px] text-slate-500 hover:text-slate-900 underline font-bold uppercase cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-1 pt-1">
                  {recentSearches.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSearchQuery(item);
                        executeSearch(item);
                      }}
                      className="flex items-center justify-between px-3 py-2 hover:bg-slate-100 border border-transparent hover:border-slate-300 text-xs font-semibold cursor-pointer group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
                        <span className="text-slate-800">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(e, item)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {recentSearches.length === 0 && trendingSearches.length === 0 && (
              <div className="py-4 text-center text-xs font-bold text-slate-500 uppercase">
                Type a query or press Enter to search products
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
