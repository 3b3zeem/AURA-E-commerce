"use client";

import React from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Category } from "@/types";

interface AdminCategoriesTabProps {
  categoriesList: Category[];
  actionLoadingId: string | null;
  onOpenAddModal: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export function AdminCategoriesTab({
  categoriesList,
  actionLoadingId,
  onOpenAddModal,
  onEditCategory,
  onDeleteCategory,
}: AdminCategoriesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900">Categories</h2>
          <p className="text-xs text-slate-600">
            Manage shop product departments in cards.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categoriesList.map((cat) => (
          <div
            key={cat.id}
            className="p-4 border border-slate-200 bg-white space-y-3 flex flex-col justify-between hover:border-slate-900 transition-all"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  slug: /{cat.slug || cat.id?.slice(0, 8)}
                </span>
                <div className="flex items-center space-x-1">
                  {cat.is_featured && (
                    <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase mr-1 border border-slate-800">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => onEditCategory(cat)}
                    className="text-slate-700 hover:text-slate-900 p-1 border border-slate-200 hover:border-slate-900 transition-colors cursor-pointer mr-1"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={actionLoadingId === cat.id}
                    onClick={() => onDeleteCategory(cat.id)}
                    className="text-rose-600 hover:text-rose-700 p-1 border border-slate-200 hover:border-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Category"
                  >
                    {actionLoadingId === cat.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {cat.image_url && (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-28 object-cover border border-slate-200"
                />
              )}
              <h3 className="text-base font-black uppercase mt-1 text-slate-900">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-600">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
