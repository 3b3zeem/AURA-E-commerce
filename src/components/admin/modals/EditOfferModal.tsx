"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Filter } from "lucide-react";
import { Offer, Product, Category } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface EditOfferModalProps {
  editingOffer: Offer | null;
  setEditingOffer?: (offer: Offer | null) => void;
  isSubmitting: boolean;
  productsList?: Product[];
  categoriesList?: Category[];
  onSubmit: (e: React.FormEvent) => void;
}

export function EditOfferModal({
  editingOffer,
  setEditingOffer,
  isSubmitting,
  productsList,
  categoriesList,
  onSubmit,
}: EditOfferModalProps) {
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  return (
    <AnimatePresence>
      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black uppercase text-slate-900">
                Edit Offer Bundle
              </h3>
              {setEditingOffer && (
                <button
                  onClick={() => setEditingOffer(null)}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.title}
                  onChange={(e) =>
                    setEditingOffer && setEditingOffer({ ...editingOffer, title: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Badge</label>
                  <input
                    type="text"
                    value={editingOffer.badge || ""}
                    onChange={(e) =>
                      setEditingOffer && setEditingOffer({ ...editingOffer, badge: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={editingOffer.subtitle || ""}
                    onChange={(e) =>
                      setEditingOffer && setEditingOffer({ ...editingOffer, subtitle: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Multi-Select Products for Edit Offer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-900 font-bold uppercase text-[11px]">
                    1. Select Included Products:
                  </label>
                  {productsList && editingOffer.product_ids && editingOffer.product_ids.length > 0 && (
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      Total Reg Price: $
                      {productsList
                        .filter((p) => (editingOffer.product_ids || []).includes(p.id))
                        .reduce((acc, p) => acc + (Number(p.price) || 0), 0)
                        .toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Category Filter Dropdown using CustomSelect */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Filter Catalog by Category:
                    </span>
                  </div>
                  <CustomSelect
                    value={categoryFilter}
                    onChange={(val) => setCategoryFilter(val)}
                    options={[
                      {
                        value: "ALL",
                        label: `All Categories (${(productsList || []).length} products)`,
                      },
                      ...(categoriesList || []).map((c) => {
                        const count = (productsList || []).filter(
                          (p) => p.category_id === c.id || p.category?.id === c.id
                        ).length;
                        return {
                          value: c.id,
                          label: `${c.name} (${count} items)`,
                        };
                      }),
                    ]}
                    triggerClassName="w-full justify-between py-1.5 text-xs font-bold bg-white border-slate-300"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-300 bg-slate-50 p-2 space-y-1">
                  {(productsList || [])
                    .filter((p) => {
                      if (categoryFilter === "ALL") return true;
                      return p.category_id === categoryFilter || p.category?.id === categoryFilter;
                    })
                    .map((p) => {
                    const isSelected = (editingOffer.product_ids || []).includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2 p-1.5 hover:bg-white cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (!setEditingOffer) return;
                            const currentIds = editingOffer.product_ids || [];
                            const updatedIds = e.target.checked
                              ? [...currentIds, p.id]
                              : currentIds.filter((id) => id !== p.id);

                            const newTotalOrig = (productsList || [])
                              .filter((item) => updatedIds.includes(item.id))
                              .reduce((acc, item) => acc + (Number(item.price) || 0), 0);

                            setEditingOffer({
                              ...editingOffer,
                              product_ids: updatedIds,
                              original_price: newTotalOrig > 0 ? newTotalOrig : editingOffer.original_price,
                            });
                          }}
                          className="w-4 h-4 accent-slate-900"
                        />
                        <span className="text-slate-900 font-medium truncate flex-1">{p.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">${p.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quick Discount Percent Picker */}
              <div className="bg-slate-50 p-3 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold uppercase text-[10px]">
                    2. Quick Apply Discount Percentage:
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 25, 30, 35, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        if (!setEditingOffer) return;
                        const currentOrig = Number(editingOffer.original_price) || 0;
                        if (currentOrig > 0) {
                          const calculatedOfferP = parseFloat((currentOrig * (1 - pct / 100)).toFixed(2));
                          setEditingOffer({
                            ...editingOffer,
                            offer_price: calculatedOfferP,
                            badge: `${pct}% OFF BUNDLE`,
                          });
                        }
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 text-slate-800 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {pct}% OFF
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOffer.original_price}
                    onChange={(e) =>
                      setEditingOffer &&
                      setEditingOffer({
                        ...editingOffer,
                        original_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Offer Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingOffer.offer_price}
                    onChange={(e) =>
                      setEditingOffer &&
                      setEditingOffer({
                        ...editingOffer,
                        offer_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={editingOffer.image_url}
                  onChange={(e) =>
                    setEditingOffer && setEditingOffer({ ...editingOffer, image_url: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Offer Start & Expiry Date Inputs */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 border border-slate-200">
                <div>
                  <label className="block text-slate-800 font-bold mb-1 uppercase text-[10px]">
                    Start Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editingOffer.starts_at ? new Date(editingOffer.starts_at).toISOString().slice(0, 16) : ""}
                    onChange={(e) =>
                      setEditingOffer &&
                      setEditingOffer({
                        ...editingOffer,
                        starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1 uppercase text-[10px]">
                    End Date & Time (Expiry)
                  </label>
                  <input
                    type="datetime-local"
                    value={editingOffer.ends_at ? new Date(editingOffer.ends_at).toISOString().slice(0, 16) : ""}
                    onChange={(e) =>
                      setEditingOffer &&
                      setEditingOffer({
                        ...editingOffer,
                        ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-1 text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={editingOffer.is_active}
                    onChange={(e) =>
                      setEditingOffer &&
                      setEditingOffer({ ...editingOffer, is_active: e.target.checked })
                    }
                    className="w-4 h-4 accent-slate-900 cursor-pointer"
                  />
                  <span>Active Offer</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-amber-700">
                  <input
                    type="checkbox"
                    checked={editingOffer.show_in_overlay}
                    onChange={(e) =>
                      setEditingOffer &&
                      setEditingOffer({ ...editingOffer, show_in_overlay: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                  <span>Overlay Popup</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Offer...</span>
                  </>
                ) : (
                  <span>Update Offer in Supabase</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
