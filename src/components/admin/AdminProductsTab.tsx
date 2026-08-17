"use client";

import React from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Product, Category } from "@/types";
import { formatPrice } from "@/lib/utils";

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
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900">
            Products Catalog
          </h2>
          <p className="text-xs text-slate-600">
            Live products table rendered in card layout from Supabase DB.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Create New Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {productsList.map((prod) => (
          <div
            key={prod.id}
            className="p-4 border border-slate-200 bg-white flex flex-col justify-between space-y-3 hover:border-slate-900 transition-all group"
          >
            <div className="space-y-3">
              <div className="relative aspect-square w-full bg-slate-50 border border-slate-100 overflow-hidden">
                <img
                  src={prod.images?.[0] || "/placeholder.jpg"}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900 text-white font-mono text-[9px] font-black uppercase border border-slate-800">
                  {prod.badge || "Standard"}
                </span>
              </div>
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
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {prod.description}
                </p>
              </div>
            </div>
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
    </div>
  );
}
