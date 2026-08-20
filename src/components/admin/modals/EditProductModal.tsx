"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Image as ImageIcon, ArrowRight, Trash2, Edit2, Plus, Star, Check } from "lucide-react";
import { Product, Category, Brand } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PRODUCT_BADGE_OPTIONS, TARGET_GENDER_OPTIONS, DEFAULT_PRODUCT_BRANDS } from "./modalConstants";

interface EditProductModalProps {
  editingProduct: Product | null;
  setEditingProduct: (prod: Product | null) => void;
  isSubmitting: boolean;
  categoriesList: Category[];
  brandsList?: Brand[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditProductModal({
  editingProduct,
  setEditingProduct,
  isSubmitting,
  categoriesList,
  brandsList,
  onFileUpload,
  onSubmit,
}: EditProductModalProps) {
  const [editTab, setEditTab] = useState<'basic' | 'gallery' | 'specs' | 'shipping'>('basic');
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const brandSelectOptions = [
    ...(brandsList && brandsList.length > 0
      ? brandsList.map((b) => ({ value: b.name, label: b.name }))
      : DEFAULT_PRODUCT_BRANDS),
  ];

  return (
    <AnimatePresence>
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 my-auto"
          >
            {/* Executive Dark Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 border border-slate-700 text-amber-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    Edit Product: {editingProduct.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {editingProduct.id} • SKU: {editingProduct.sku || "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modern Tab Bar Header */}
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditTab('basic')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  editTab === 'basic'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>BASIC & PRICING</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab('gallery')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  editTab === 'gallery'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>MEDIA GALLERY</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab('specs')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  editTab === 'specs'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>UNIVERSAL SPECS</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTab('shipping')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  editTab === 'shipping'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>SHIPPING & USAGE</span>
              </button>
            </div>

            {/* Main Form Content */}
            <form onSubmit={onSubmit} className="flex flex-col">
              <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-xs font-semibold">
                {/* TAB 1: BASIC & PRICING */}
                {editTab === 'basic' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-300 p-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">URL Slug</label>
                        <input
                          type="text"
                          value={editingProduct.slug || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              slug: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Category</label>
                        <CustomSelect
                          value={editingProduct.category_id || ""}
                          onChange={(val) =>
                            setEditingProduct({
                              ...editingProduct,
                              category_id: val || null,
                            })
                          }
                          placeholder="No Category"
                          options={[
                            { value: "", label: "No Category" },
                            ...categoriesList.map((c) => ({ value: c.id, label: c.name })),
                          ]}
                          triggerClassName="w-full justify-between py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Brand</label>
                        <div className="space-y-1.5">
                          {brandSelectOptions.length > 1 && (
                            <CustomSelect
                              value={
                                brandSelectOptions.some(b => b.value === editingProduct.brand)
                                  ? editingProduct.brand || ''
                                  : 'Other'
                              }
                              onChange={(val) => {
                                if (val !== 'Other') {
                                  setEditingProduct({ ...editingProduct, brand: val });
                                }
                              }}
                              options={brandSelectOptions}
                              triggerClassName="w-full justify-between py-2 font-bold"
                            />
                          )}
                          <input
                            type="text"
                            value={editingProduct.brand || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                brand: e.target.value,
                              })
                            }
                            placeholder="Type brand name freely..."
                            className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Badge Tag</label>
                        <CustomSelect
                          value={editingProduct.badge || ""}
                          onChange={(val) =>
                            setEditingProduct({
                              ...editingProduct,
                              badge: val,
                            })
                          }
                          options={PRODUCT_BADGE_OPTIONS}
                          triggerClassName="w-full justify-between py-2.5 font-bold"
                        />
                      </div>
                    </div>

                    {/* Pricing & Discount Calculator Section */}
                    <div className="bg-slate-50 p-3 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-900 font-bold uppercase text-[11px]">
                          Product Pricing & Discount Calculator:
                        </label>
                        {editingProduct.original_price && editingProduct.original_price > editingProduct.price && (
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                            SAVING: ${(editingProduct.original_price - editingProduct.price).toFixed(2)} (
                            {Math.round(((editingProduct.original_price - editingProduct.price) / editingProduct.original_price) * 100)}% OFF)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-[11px]">Original Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingProduct.original_price || ""}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                original_price: parseFloat(e.target.value) || undefined,
                              })
                            }
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                            placeholder="e.g. 100.00"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-[11px]">Discount (%)</label>
                          <input
                            type="number"
                            step="1"
                            max="99"
                            min="0"
                            value={
                              editingProduct.original_price && editingProduct.original_price > editingProduct.price
                                ? Math.round(((editingProduct.original_price - editingProduct.price) / editingProduct.original_price) * 100)
                                : ""
                            }
                            onChange={(e) => {
                              const pct = parseFloat(e.target.value) || 0;
                              if (editingProduct.original_price && editingProduct.original_price > 0) {
                                const calculatedPrice = parseFloat((editingProduct.original_price * (1 - pct / 100)).toFixed(2));
                                setEditingProduct({
                                  ...editingProduct,
                                  price: calculatedPrice,
                                });
                              }
                            }}
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-slate-900"
                            placeholder="e.g. 20%"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-900 font-bold mb-1 text-[11px]">Final Price ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-[11px]">Stock Quantity *</label>
                          <input
                            type="number"
                            value={editingProduct.stock ?? 10}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                stock: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-bold text-xs focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      {/* Quick Discount Percent Bar */}
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Apply Discount:</span>
                        <div className="flex flex-wrap gap-1">
                          {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                const origNum = editingProduct.original_price || editingProduct.price;
                                if (origNum > 0) {
                                  const calculatedPrice = parseFloat((origNum * (1 - pct / 100)).toFixed(2));
                                  setEditingProduct({
                                    ...editingProduct,
                                    original_price: origNum,
                                    price: calculatedPrice,
                                    badge: editingProduct.badge || "SALE",
                                  });
                                }
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 text-slate-800 font-mono font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              {pct}% OFF
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Product Discount Window */}
                    <div className="grid grid-cols-2 gap-4 bg-emerald-50/60 p-3 border border-emerald-200">
                      <div>
                        <label className="block text-emerald-900 font-bold mb-1 uppercase text-[10px]">
                          Discount Start Date & Time (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={editingProduct.discount_starts_at ? new Date(editingProduct.discount_starts_at).toISOString().slice(0, 16) : ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              discount_starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                            })
                          }
                          className="w-full bg-white border border-emerald-300 p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-emerald-900 font-bold mb-1 uppercase text-[10px]">
                          Discount End Date & Time (Expiry)
                        </label>
                        <input
                          type="datetime-local"
                          value={editingProduct.discount_ends_at ? new Date(editingProduct.discount_ends_at).toISOString().slice(0, 16) : ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              discount_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                            })
                          }
                          className="w-full bg-white border border-emerald-300 p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Description</label>
                      <textarea
                        rows={4}
                        value={editingProduct.description || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-300 p-3 text-slate-900 leading-relaxed focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="flex flex-wrap gap-6 p-3.5 bg-slate-50 border border-slate-200">
                      <label className="flex items-center space-x-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={editingProduct.is_featured || false}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              is_featured: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-slate-900 cursor-pointer"
                        />
                        <span>Featured Product</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={editingProduct.is_flash_deal || false}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              is_flash_deal: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-slate-900 cursor-pointer"
                        />
                        <span>Flash Deal Item</span>
                      </label>

                      {editingProduct.is_flash_deal && (
                        <div className="col-span-2 bg-amber-50 p-2.5 border border-amber-200 space-y-1">
                          <label className="block text-amber-900 font-bold uppercase text-[10px]">
                            Flash Deal Expiry Date & Time:
                          </label>
                          <input
                            type="datetime-local"
                            value={editingProduct.flash_deal_ends_at ? new Date(editingProduct.flash_deal_ends_at).toISOString().slice(0, 16) : ""}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                flash_deal_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                              })
                            }
                            className="w-full bg-white border border-amber-300 p-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      )}

                      <label className="flex items-center space-x-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={editingProduct.in_stock ?? true}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              in_stock: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-slate-900 cursor-pointer"
                        />
                        <span>In Stock Status</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: COVER & MEDIA GALLERY */}
                {editTab === 'gallery' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Main Cover Image */}
                    <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-900 font-black text-xs uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-slate-900" />
                          <span>Main Cover Image *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsPickerOpen(true)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] uppercase flex items-center gap-1 border border-amber-500 shadow-xs cursor-pointer transition-all"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Select Main Cover from Gallery</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="px-4 py-2.5 bg-white border border-slate-300 text-slate-900 font-bold text-xs hover:border-slate-900 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shadow-xs">
                          <Upload className="w-4 h-4 text-slate-900" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              onFileUpload(e, (url) => {
                                const curr = [...(editingProduct.images || [])];
                                curr[0] = url;
                                setEditingProduct({ ...editingProduct, images: curr });
                              })
                            }
                          />
                        </label>
                        <input
                          type="text"
                          value={editingProduct.images?.[0] || ""}
                          onChange={(e) => {
                            const curr = [...(editingProduct.images || [])];
                            curr[0] = e.target.value;
                            setEditingProduct({ ...editingProduct, images: curr });
                          }}
                          className="flex-1 bg-white border border-slate-300 p-2.5 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                          placeholder="Paste Main Cover Image URL..."
                        />
                      </div>
                      {editingProduct.images?.[0] && (
                        <div className="relative w-28 h-28 border-2 border-slate-900 bg-white p-1 shadow-sm">
                          <img src={editingProduct.images[0]} alt="Cover Preview" className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-slate-950 text-white text-[9px] font-black px-1.5 py-0.5 uppercase flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>MAIN COVER</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Secondary Thumbnails Gallery */}
                    <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <label className="block text-slate-900 font-black text-xs uppercase">
                          Thumbnails Gallery
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const curr = [...(editingProduct.images || [])];
                            curr.push("");
                            setEditingProduct({ ...editingProduct, images: curr });
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-white" />
                          <span>Add Thumbnail</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(editingProduct.images || []).map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center space-x-2 p-2.5 border shadow-xs ${
                              idx === 0 ? "bg-amber-50/50 border-amber-300" : "bg-white border-slate-200"
                            }`}
                          >
                            <span
                              className={`text-[10px] font-mono font-bold w-20 text-center py-1 border uppercase flex items-center justify-center gap-1 ${
                                idx === 0
                                  ? "bg-amber-400 text-slate-950 border-amber-500 font-black"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {idx === 0 ? (
                                <>
                                  <Star className="w-3 h-3 fill-slate-950" />
                                  <span>MAIN</span>
                                </>
                              ) : (
                                `#${idx}`
                              )}
                            </span>

                            <div className="w-12 h-12 border border-slate-300 flex-shrink-0 overflow-hidden bg-slate-100 relative">
                              {imgUrl ? (
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                                  Empty
                                </div>
                              )}
                            </div>

                            <input
                              type="text"
                              value={imgUrl}
                              onChange={(e) => {
                                const curr = [...(editingProduct.images || [])];
                                curr[idx] = e.target.value;
                                setEditingProduct({ ...editingProduct, images: curr });
                              }}
                              className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                              placeholder={idx === 0 ? "Main image URL..." : `Thumbnail #${idx} URL...`}
                            />

                            {idx > 0 && imgUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  // Swap image at idx with image at index 0 (main cover)
                                  const curr = [...(editingProduct.images || [])];
                                  const targetImg = curr[idx];
                                  const oldMain = curr[0];
                                  curr[0] = targetImg;
                                  curr[idx] = oldMain;
                                  setEditingProduct({ ...editingProduct, images: curr });
                                }}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                title="Set as Main Cover Image"
                              >
                                <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                                <span>Set as Main</span>
                              </button>
                            ) : null}

                            <label className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer">
                              <Upload className="w-3.5 h-3.5 text-slate-800" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  onFileUpload(e, (url) => {
                                    const curr = [...(editingProduct.images || [])];
                                    curr[idx] = url;
                                    setEditingProduct({ ...editingProduct, images: curr });
                                  })
                                }
                              />
                            </label>

                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const curr = editingProduct.images.filter((_, i) => i !== idx);
                                  setEditingProduct({ ...editingProduct, images: curr });
                                }}
                                className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                                title="Delete Thumbnail"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pop-up Visual Main Cover Selector Modal */}
                    {isPickerOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                        <div className="bg-white border border-slate-300 shadow-2xl max-w-2xl w-full p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                              <span>Select Main Cover Image</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => setIsPickerOpen(false)}
                              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-600">
                            Click on any image below to make it the <strong>Primary Cover Photo</strong> for this product:
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                            {(editingProduct.images || []).filter(Boolean).map((imgUrl, i) => {
                              const isMain = i === 0;
                              return (
                                <div
                                  key={i}
                                  onClick={() => {
                                    if (!isMain) {
                                      const curr = [...(editingProduct.images || [])];
                                      const targetImg = curr[i];
                                      const oldMain = curr[0];
                                      curr[0] = targetImg;
                                      curr[i] = oldMain;
                                      setEditingProduct({ ...editingProduct, images: curr });
                                    }
                                    setIsPickerOpen(false);
                                  }}
                                  className={`relative h-32 border-2 cursor-pointer transition-all overflow-hidden group ${
                                    isMain
                                      ? "border-amber-500 ring-2 ring-amber-400/50 shadow-md"
                                      : "border-slate-200 hover:border-slate-900"
                                  }`}
                                >
                                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                  {isMain ? (
                                    <div className="absolute top-2 left-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase flex items-center gap-1 shadow-sm">
                                      <Check className="w-3 h-3" />
                                      <span>MAIN COVER</span>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="bg-white text-slate-950 font-black text-[10px] uppercase px-3 py-1 shadow-md flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                        Make Main Cover
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex justify-end pt-3 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => setIsPickerOpen(false)}
                              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: UNIVERSAL SPECS & HOOK */}
                {editTab === 'specs' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">SKU Code</label>
                        <input
                          type="text"
                          value={editingProduct.sku || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              sku: e.target.value,
                            })
                          }
                          placeholder="e.g. AUR-PRO-001"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Target Audience / Gender</label>
                        <CustomSelect
                          value={editingProduct.target_gender || 'unisex'}
                          onChange={(val) =>
                            setEditingProduct({
                              ...editingProduct,
                              target_gender: val,
                            })
                          }
                          options={TARGET_GENDER_OPTIONS}
                          triggerClassName="w-full justify-between py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Country of Origin</label>
                        <input
                          type="text"
                          value={editingProduct.origin_country || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              origin_country: e.target.value,
                            })
                          }
                          placeholder="e.g. Germany, Japan"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Shelf Life / Warranty</label>
                        <input
                          type="text"
                          value={editingProduct.shelf_life || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              shelf_life: e.target.value,
                            })
                          }
                          placeholder="e.g. 24 Months Warranty"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Bought Past Month (Sales)</label>
                        <input
                          type="number"
                          value={editingProduct.bought_past_month ?? 50}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              bought_past_month: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="e.g. 50"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Key Benefit Hook</label>
                      <input
                        type="text"
                        value={editingProduct.key_benefits || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            key_benefits: e.target.value,
                          })
                        }
                        placeholder="e.g. Ultra-fast 45W charging with active surge protection"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Product Highlights (Comma Separated)</label>
                      <input
                        type="text"
                        value={
                          Array.isArray(editingProduct.highlights)
                            ? editingProduct.highlights.join(', ')
                            : editingProduct.highlights || ''
                        }
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            highlights: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="e.g. Fast Charging, Dual USB-C Ports, 2-Year Warranty"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: SHIPPING & INSTRUCTIONS */}
                {editTab === 'shipping' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Usage & Operation Instructions</label>
                        <textarea
                          rows={3}
                          value={editingProduct.usage_instructions || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              usage_instructions: e.target.value,
                            })
                          }
                          placeholder="Operating procedure and usage notes..."
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Care & Maintenance</label>
                        <textarea
                          rows={3}
                          value={editingProduct.care_instructions || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              care_instructions: e.target.value,
                            })
                          }
                          placeholder="Storage guidelines and care tips..."
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Package Includes (Comma Separated)</label>
                      <input
                        type="text"
                        value={
                          Array.isArray(editingProduct.package_includes)
                            ? editingProduct.package_includes.join(', ')
                            : editingProduct.package_includes || ''
                        }
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            package_includes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="e.g. 1x Main Charger Unit, 1x Type-C Cable, 1x User Manual"
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Delivery & Shipping Info</label>
                        <input
                          type="text"
                          value={editingProduct.delivery_info || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              delivery_info: e.target.value,
                            })
                          }
                          placeholder="e.g. Express delivery within 24-48 hours"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Return & Inspection Policy</label>
                        <input
                          type="text"
                          value={editingProduct.return_policy || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              return_policy: e.target.value,
                            })
                          }
                          placeholder="e.g. Inspection upon delivery + 14-day hassle-free return"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Executive Sticky Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold text-xs uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Product...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Product in Supabase</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
