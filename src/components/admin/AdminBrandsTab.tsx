"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Tag, X, Check } from "lucide-react";
import { Brand } from "@/types";
import { createBrandInDb, updateBrandInDb, deleteBrandInDb } from "@/lib/services/db";

interface AdminBrandsTabProps {
  brandsList: Brand[];
  onRefresh?: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminBrandsTab({
  brandsList,
  onRefresh,
  onNotify,
}: AdminBrandsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredBrands = brandsList.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingBrand(null);
    setBrandName("");
    setLogoUrl("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setBrandName(b.name);
    setLogoUrl(b.logo_url || "");
    setDescription(b.description || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName) return;

    setSubmitting(true);
    if (editingBrand) {
      const updated = await updateBrandInDb(editingBrand.id, {
        name: brandName,
        logo_url: logoUrl || null,
        description: description || null,
      });
      if (updated) {
        onNotify?.(`Brand "${brandName}" updated successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    } else {
      const created = await createBrandInDb({
        name: brandName,
        logo_url: logoUrl || undefined,
        description: description || undefined,
      });
      if (created) {
        onNotify?.(`New brand "${brandName}" added.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    setActionLoadingId(id);
    const ok = await deleteBrandInDb(id);
    if (ok) {
      onNotify?.(`Brand "${name}" deleted.`);
      onRefresh?.();
    }
    setActionLoadingId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-900" />
            Product Brands ({filteredBrands.length})
          </h2>
          <p className="text-xs text-slate-600">
            Manage product manufacturer brands synced with Supabase.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBrands.map((b) => (
          <div
            key={b.id}
            className="p-4 border border-slate-200 bg-white flex flex-col justify-between space-y-3 hover:border-slate-900 transition-all text-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-black text-slate-900 text-sm">{b.name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 font-mono uppercase font-bold border border-slate-200">
                  Active
                </span>
              </div>
              {b.description && (
                <p className="text-slate-600 text-xs line-clamp-2">{b.description}</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => openEditModal(b)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold uppercase text-[11px] border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                disabled={actionLoadingId === b.id}
                onClick={() => handleDelete(b.id, b.name)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-bold uppercase text-[11px] border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors disabled:opacity-50"
              >
                {actionLoadingId === b.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BRAND MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900">
                {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add New Brand"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold uppercase">
              <div>
                <label className="block text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony, Anker, Bose"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brand info or taglines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold uppercase border border-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase border border-slate-800 hover:bg-black cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingBrand ? "Save Changes" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
