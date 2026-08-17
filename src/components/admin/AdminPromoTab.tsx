"use client";

import React, { useState } from "react";
import { Tag, Plus, Search, Trash2, Edit, Loader2, Check, X, Power } from "lucide-react";
import {
  createAdminPromoCode,
  updateAdminPromoCode,
  deleteAdminPromoCode,
} from "@/lib/services/db";

interface AdminPromoTabProps {
  promosList: any[];
  actionLoadingId?: string | null;
  onRefresh?: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminPromoTab({
  promosList,
  actionLoadingId,
  onRefresh,
  onNotify,
}: AdminPromoTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("15");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPromos = promosList.filter((p) => {
    const term = searchTerm.toLowerCase();
    const c = typeof p === "object" ? p.code || "" : p;
    return c.toLowerCase().includes(term);
  });

  const openAddModal = () => {
    setEditingPromo(null);
    setCode("");
    setDiscountPercent("15");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: any) => {
    setEditingPromo(promo);
    setCode(promo.code || "");
    setDiscountPercent(String(promo.discount_percent || 10));
    setIsActive(promo.is_active !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    const cleanCode = code.trim().toUpperCase();
    const percent = Math.min(100, Math.max(1, parseInt(discountPercent) || 10));

    if (editingPromo) {
      const updated = await updateAdminPromoCode({
        id: editingPromo.id,
        code: cleanCode,
        discount_percent: percent,
        is_active: isActive,
      });
      if (updated) {
        onNotify?.(`Promo Code "${cleanCode}" updated successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    } else {
      const created = await createAdminPromoCode({
        code: cleanCode,
        discount_percent: percent,
        is_active: isActive,
      });
      if (created) {
        onNotify?.(`Promo Code "${cleanCode}" created successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (promo: any) => {
    const updated = await updateAdminPromoCode({
      id: promo.id,
      is_active: !promo.is_active,
    });
    if (updated) {
      onNotify?.(`Promo Code "${promo.code}" is now ${!promo.is_active ? 'Active' : 'Inactive'}.`);
      onRefresh?.();
    }
  };

  const handleDelete = async (id: string, codeStr: string) => {
    setDeletingId(id);
    const success = await deleteAdminPromoCode(id);
    setDeletingId(null);
    if (success) {
      onNotify?.(`Promo Code "${codeStr}" deleted successfully.`);
      onRefresh?.();
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-900" />
            Promo & Discount Codes
          </h2>
          <p className="text-xs text-slate-600">
            Create, edit, and control discount coupons applied at checkout ({filteredPromos.length} active).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Promo Code</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by promo code name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono uppercase"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPromos.map((promo, idx) => {
          const id = promo.id || `promo-${idx}`;
          const codeStr = typeof promo === "string" ? promo : promo.code;
          const discount = typeof promo === "object" ? promo.discount_percent || 10 : 10;
          const active = typeof promo === "object" ? promo.is_active !== false : true;
          const isDeleting = deletingId === id;

          return (
            <div
              key={id}
              className={`p-4 border bg-white space-y-3 flex flex-col justify-between transition-all text-xs ${
                active ? "border-slate-200 hover:border-slate-900" : "border-slate-200 bg-slate-50 opacity-75"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-base tracking-wider uppercase">
                    {codeStr}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black uppercase border ${
                      active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 flex items-center justify-between font-mono">
                  <span className="text-slate-600 text-[11px]">Discount Value:</span>
                  <span className="font-black text-slate-900 text-sm">{discount}% OFF</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(promo)}
                  className={`px-2.5 py-1.5 border text-[11px] font-bold uppercase transition-colors cursor-pointer flex-1 inline-flex items-center justify-center space-x-1 ${
                    active
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                  }`}
                  title="Toggle Promo Code Status"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{active ? "Deactivate" : "Activate"}</span>
                </button>

                <button
                  onClick={() => openEditModal(promo)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer inline-flex items-center"
                  title="Edit Code & Discount"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  disabled={isDeleting}
                  onClick={() => handleDelete(id, codeStr)}
                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-slate-200 transition-colors cursor-pointer inline-flex items-center disabled:opacity-50"
                  title="Delete Promo Code"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900">
                {editingPromo ? "Edit Promo Code" : "Create Promo Code"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase">
              <div>
                <label className="block text-slate-700 mb-1">Promo Code Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="e.g. 20"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="promoActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
                <label htmlFor="promoActiveCheck" className="text-slate-900 cursor-pointer">
                  Code is Active for Checkout
                </label>
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
                  {submitting ? "Saving..." : editingPromo ? "Save Changes" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
