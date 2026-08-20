"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts, useCategories, useRecommendationsQuery } from "@/hooks/useStoreData";
import { useUserStore } from "@/store/useUserStore";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsTopBar } from "@/components/products/ProductsTopBar";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { ProductsLoadMore } from "@/components/products/ProductsLoadMore";
import { ProductsFilterDrawer } from "@/components/products/ProductsFilterDrawer";

const BATCH_SIZE = 24;
const STORAGE_KEY = "aura_catalog_visible_count";
const BADGES = [
  "all",
  "HOT",
  "NEW",
  "BESTSELLER",
  "TRENDING",
  "PREMIUM",
  "SALE",
];

function ProductsContent() {
  const searchParams = useSearchParams();

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const loading = productsLoading || categoriesLoading;

  // Advanced Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [flashDealsOnly, setFlashDealsOnly] = useState<boolean>(false);
  const [recommendedOnly, setRecommendedOnly] = useState<boolean>(false);
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "rating" | "newest"
  >("featured");
  const [viewMode, setViewMode] = useState<"grid-4" | "grid-3" | "list">(
    "grid-4",
  );

  // Advanced Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Progressive Load State (Restored on Refresh)
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isBatchLoading, setIsBatchLoading] = useState<boolean>(false);

  const { profile } = useUserStore();
  const { data: recsList = [] } = useRecommendationsQuery(profile?.id || '');
  const recommendedProductIds = useMemo(() => recsList.map((r: any) => r.id), [recsList]);

  // Read URL search params & SessionStorage on mount
  useEffect(() => {
    const catParam = searchParams.get("category");
    const flashParam = searchParams.get("flash");
    const recommendedParam = searchParams.get("recommended");
    const searchParam = searchParams.get("search");
    const badgeParam = searchParams.get("badge");
    const limitParam = searchParams.get("limit");

    if (catParam) setSelectedCategory(catParam);
    if (flashParam === "true") setFlashDealsOnly(true);
    if (recommendedParam === "true") setRecommendedOnly(true);
    if (searchParam) setSearchQuery(searchParam);
    if (badgeParam) setSelectedBadge(badgeParam);

    if (limitParam && !isNaN(Number(limitParam)) && Number(limitParam) > 0) {
      setVisibleCount(Number(limitParam));
    } else if (typeof window !== "undefined") {
      const savedCount = sessionStorage.getItem(STORAGE_KEY);
      if (savedCount && !isNaN(Number(savedCount)) && Number(savedCount) > 0) {
        setVisibleCount(Number(savedCount));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map((p) => p.price));
      setMaxPrice(Math.ceil(highestPrice));
    }
  }, [products]);

  const updateVisibleCount = (newCount: number) => {
    setVisibleCount(newCount);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, newCount.toString());
      const url = new URL(window.location.href);
      url.searchParams.set("limit", newCount.toString());
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Filter Computation Engine
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (
          selectedCategory !== "all" &&
          product.category_id !== selectedCategory
        ) {
          return false;
        }
        if (
          searchQuery.trim() !== "" &&
          !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        if (product.price > maxPrice) {
          return false;
        }
        if (minRating > 0 && product.rating_avg < minRating) {
          return false;
        }
        if (inStockOnly && product.stock <= 0) {
          return false;
        }
        if (flashDealsOnly && !product.is_flash_deal) {
          return false;
        }
        if (recommendedOnly && !recommendedProductIds.includes(product.id)) {
          return false;
        }
        if (selectedBadge !== "all" && product.badge !== selectedBadge) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating_avg - a.rating_avg;
        if (sortBy === "newest")
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
        // Default sort (Featured / Default): Featured items first, then Newest created at top!
        const featuredDiff = (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        if (featuredDiff !== 0) return featuredDiff;
        return (
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        );
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    maxPrice,
    minRating,
    inStockOnly,
    flashDealsOnly,
    recommendedOnly,
    recommendedProductIds,
    selectedBadge,
    sortBy,
  ]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (searchQuery.trim() !== "") count++;
    if (flashDealsOnly) count++;
    if (recommendedOnly) count++;
    if (inStockOnly) count++;
    if (selectedBadge !== "all") count++;
    if (minRating > 0) count++;
    return count;
  }, [
    selectedCategory,
    searchQuery,
    flashDealsOnly,
    recommendedOnly,
    inStockOnly,
    selectedBadge,
    minRating,
  ]);

  // Visible Slice
  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const progressPercent =
    filteredProducts.length > 0
      ? Math.min(
          100,
          Math.round(
            (displayedProducts.length / filteredProducts.length) * 100,
          ),
        )
      : 0;

  const handleLoadMore = () => {
    setIsBatchLoading(true);
    setTimeout(() => {
      updateVisibleCount(visibleCount + BATCH_SIZE);
      setIsBatchLoading(false);
    }, 200);
  };

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    const highestPrice =
      products.length > 0 ? Math.max(...products.map((p) => p.price)) : 30000;
    setMaxPrice(Math.ceil(highestPrice));
    setMinRating(0);
    setInStockOnly(false);
    setFlashDealsOnly(false);
    setRecommendedOnly(false);
    setSelectedBadge("all");
    setSortBy("featured");

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      const url = new URL(window.location.href);
      url.searchParams.delete("limit");
      url.searchParams.delete("category");
      url.searchParams.delete("flash");
      url.searchParams.delete("recommended");
      url.searchParams.delete("search");
      url.searchParams.delete("badge");
      window.history.replaceState({}, "", url.pathname);
    }
    setVisibleCount(BATCH_SIZE);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const productsMaxPrice = useMemo(() => {
    return products.length > 0
      ? Math.max(...products.map((p) => p.price))
      : 30000;
  }, [products]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans text-slate-900 bg-[#f8fafc]">
      {/* 1. Header Banner */}
      <ProductsHeader
        totalCount={filteredProducts.length}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={resetAllFilters}
      />

      {/* 2. Sleek Non-Intrusive Top Filter Command Bar */}
      <ProductsTopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        totalProductsCount={products.length}
        products={products}
        flashDealsOnly={flashDealsOnly}
        setFlashDealsOnly={setFlashDealsOnly}
        recommendedOnly={recommendedOnly}
        setRecommendedOnly={setRecommendedOnly}
        activeFiltersCount={activeFiltersCount}
        setIsFilterDrawerOpen={setIsFilterDrawerOpen}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedBadge={selectedBadge}
        setSelectedBadge={setSelectedBadge}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        minRating={minRating}
        setMinRating={setMinRating}
        onResetFilters={resetAllFilters}
      />

      {/* 3. Product Grid Display */}
      <main className="w-full space-y-6">
        <ProductsGrid
          loading={loading}
          filteredProducts={filteredProducts}
          displayedProducts={displayedProducts}
          viewMode={viewMode}
          onResetFilters={resetAllFilters}
        />

        {/* Interactive Load More Section */}
        <ProductsLoadMore
          displayedCount={displayedProducts.length}
          totalCount={filteredProducts.length}
          progressPercent={progressPercent}
          hasMore={hasMore}
          isBatchLoading={isBatchLoading}
          onLoadMore={handleLoadMore}
          onScrollToTop={scrollToTop}
        />
      </main>

      {/* 4. Advanced Filter Overlay Drawer */}
      <ProductsFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        productsMaxPrice={productsMaxPrice}
        selectedBadge={selectedBadge}
        setSelectedBadge={setSelectedBadge}
        badges={BADGES}
        minRating={minRating}
        setMinRating={setMinRating}
        flashDealsOnly={flashDealsOnly}
        setFlashDealsOnly={setFlashDealsOnly}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        filteredCount={filteredProducts.length}
        onResetFilters={resetAllFilters}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-bold uppercase">
          Loading Catalog...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
