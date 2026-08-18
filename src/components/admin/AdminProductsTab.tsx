"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Layers,
  Package,
} from "lucide-react";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/utils";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";

interface AdminProductsTabProps {
  productsList: Product[];
  categoriesList: Category[];
  actionLoadingId: string | null;
  onOpenAddModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export function AdminProductsTab({
  productsList,
  categoriesList,
  actionLoadingId,
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct,
}: AdminProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [selectedBadge, setSelectedBadge] = useState("ALL");
  const [selectedStock, setSelectedStock] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "stock-asc" | "name-asc">("newest");

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((prod) => {
        // Search term matching (name, sku, brand, description)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(query);
          const matchSku = prod.sku?.toLowerCase().includes(query) || false;
          const matchBrand = prod.brand?.toLowerCase().includes(query) || false;
          const matchDesc = prod.description?.toLowerCase().includes(query) || false;
          if (!matchName && !matchSku && !matchBrand && !matchDesc) return false;
        }

        // Category Filter
        if (selectedCategory !== "ALL") {
          if (prod.category_id !== selectedCategory) return false;
        }

        // Gender / Target Audience Filter
        if (selectedGender !== "ALL") {
          if ((prod.target_gender || "unisex") !== selectedGender) return false;
        }

        // Badge Filter
        if (selectedBadge !== "ALL") {
          if ((prod.badge || "Standard") !== selectedBadge) return false;
        }

        // Stock Filter
        if (selectedStock === "IN_STOCK") {
          if ((prod.stock ?? 0) <= 0) return false;
        } else if (selectedStock === "OUT_OF_STOCK") {
          if ((prod.stock ?? 0) > 0) return false;
        } else if (selectedStock === "LOW_STOCK") {
          if ((prod.stock ?? 0) > 10) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "stock-asc") return (a.stock ?? 0) - (b.stock ?? 0);
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        // Default newest
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [productsList, searchTerm, selectedCategory, selectedGender, selectedBadge, selectedStock, sortBy]);

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategory !== "ALL" ||
    selectedGender !== "ALL" ||
    selectedBadge !== "ALL" ||
    selectedStock !== "ALL";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedGender("ALL");
    setSelectedBadge("ALL");
    setSelectedStock("ALL");
    setSortBy("newest");
  };

  // Get unique badges present in products
  const availableBadges = useMemo(() => {
    const badges = new Set<string>();
    productsList.forEach((p) => {
      if (p.badge) badges.add(p.badge);
    });
    return Array.from(badges);
  }, [productsList]);

  // Options for CustomSelects
  const sortOptions: SelectOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "stock-asc", label: "Stock: Low to High" },
    { value: "name-asc", label: "Name: A to Z" },
  ];

  const categoryOptions: SelectOption[] = useMemo(() => {
    return [
      { value: "ALL", label: "All Categories" },
      ...categoriesList.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [categoriesList]);

  const genderOptions: SelectOption[] = [
    { value: "ALL", label: "All Audiences" },
    { value: "unisex", label: "Unisex" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
  ];

  const badgeOptions: SelectOption[] = useMemo(() => {
    return [
      { value: "ALL", label: "All Badges" },
      ...availableBadges.map((b) => ({ value: b, label: b })),
    ];
  }, [availableBadges]);

  const stockOptions: SelectOption[] = [
    { value: "ALL", label: "All Stock Levels" },
    { value: "IN_STOCK", label: "In Stock (> 0)" },
    { value: "LOW_STOCK", label: "Low Stock (<= 10)" },
    { value: "OUT_OF_STOCK", label: "Out of Stock (= 0)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Products Management
            </h2>
            <span className="px-2.5 py-0.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-full">
              {filteredProducts.length} / {productsList.length}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            High-density tabular catalog search, real-time filtering, and product entry.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS BAR - Custom Select White Theme */}
      <div className="bg-white text-slate-900 p-4 border border-slate-200 space-y-3 shadow-sm">
        {/* Top Row: Search Input & Sort CustomSelect */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by Name, SKU, Brand, or Description..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-slate-900 focus:bg-white transition-colors h-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By CustomSelect */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              Sort:
            </span>
            <CustomSelect
              options={sortOptions}
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              triggerClassName="h-9 min-w-[170px]"
            />
          </div>
        </div>

        {/* Bottom Row: Quick CustomSelect Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Category
            </label>
            <CustomSelect
              options={categoryOptions}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              className="w-full"
              triggerClassName="w-full h-9"
            />
          </div>

          {/* Target Audience Filter */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Audience
            </label>
            <CustomSelect
              options={genderOptions}
              value={selectedGender}
              onChange={(val) => setSelectedGender(val)}
              className="w-full"
              triggerClassName="w-full h-9"
            />
          </div>

          {/* Badge Filter */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Status Badge
            </label>
            <CustomSelect
              options={badgeOptions}
              value={selectedBadge}
              onChange={(val) => setSelectedBadge(val)}
              className="w-full"
              triggerClassName="w-full h-9"
            />
          </div>

          {/* Stock Level Filter */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Stock Status
            </label>
            <CustomSelect
              options={stockOptions}
              value={selectedStock}
              onChange={(val) => setSelectedStock(val)}
              className="w-full"
              triggerClassName="w-full h-9"
            />
          </div>
        </div>

        {/* Active Filter Indicators & Clear button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
            <span className="text-slate-500 text-[11px] font-mono">
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> matching items
            </span>
            <button
              onClick={resetFilters}
              className="text-slate-600 hover:text-slate-900 font-bold text-[11px] uppercase tracking-wider underline flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* PRODUCTS DISPLAY GRID */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 space-y-3">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-black uppercase text-slate-700">
            No Products Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No product matches your current filter criteria. Try resetting your search query or filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase border border-slate-800 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-4 border border-slate-200 bg-white flex flex-col justify-between space-y-3 hover:border-slate-900 transition-all group relative"
            >
              <div className="space-y-3">
                {/* Image Gallery Preview & Badges */}
                <div className="relative aspect-square w-full bg-slate-50 border border-slate-100 overflow-hidden">
                  <img
                    src={prod.images?.[0] || "/placeholder.jpg"}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[9px] font-black uppercase border border-slate-800">
                      {prod.badge || "Standard"}
                    </span>
                    {prod.target_gender && prod.target_gender !== "unisex" && (
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white font-mono text-[8px] font-bold uppercase">
                        {prod.target_gender}
                      </span>
                    )}
                  </div>
                  {prod.images && prod.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-mono font-bold backdrop-blur-sm">
                      +{prod.images.length - 1} photos
                    </span>
                  )}
                </div>

                {/* Info Block */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 font-bold text-[10px] text-slate-700 uppercase truncate">
                      {categoriesList.find((c) => c.id === prod.category_id)?.name ||
                        prod.category_id ||
                        "General"}
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900">
                      {formatPrice(prod.price)}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm uppercase line-clamp-1">
                    {prod.name}
                  </h3>

                  {prod.sku && (
                    <span className="text-[10px] font-mono text-slate-400 block font-bold mt-0.5">
                      SKU: {prod.sku}
                    </span>
                  )}

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {prod.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Stock: <strong className={prod.stock === 0 ? "text-rose-600" : "text-slate-900"}>{prod.stock ?? 0}</strong></span>
                    {prod.brand && <span className="truncate max-w-[100px] text-slate-600 font-bold">{prod.brand}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => onEditProduct(prod)}
                  className="p-2 bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Edit Product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  disabled={actionLoadingId === prod.id}
                  onClick={() => onDeleteProduct(prod.id)}
                  className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete Product"
                >
                  {actionLoadingId === prod.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
