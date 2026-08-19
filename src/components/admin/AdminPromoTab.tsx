"use client";

import React, { useState } from "react";
import { Tag, Plus, Search, Trash2, Edit, Loader2, Check, X, Power, Calendar, Users, Hash } from "lucide-react";
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
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
    setDiscountPercent("");
    setMaxUses("");
    setMaxUsesPerUser("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: any) => {
    setEditingPromo(promo);
    setCode(promo.code || "");
    setDiscountPercent(String(promo.discount_percent || 10));
    setMaxUses(promo.max_uses !== null && promo.max_uses !== undefined ? String(promo.max_uses) : "");
    setMaxUsesPerUser(promo.max_uses_per_user !== null && promo.max_uses_per_user !== undefined ? String(promo.max_uses_per_user) : "");
    
    // Format date string for datetime-local input (YYYY-MM-DDTHH:mm)
    if (promo.start_date) {
      try {
        const d = new Date(promo.start_date);
        setStartDate(d.toISOString().slice(0, 16));
      } catch {
        setStartDate("");
      }
    } else {
      setStartDate("");
    }

    if (promo.end_date) {
      try {
        const d = new Date(promo.end_date);
        setEndDate(d.toISOString().slice(0, 16));
      } catch {
        setEndDate("");
      }
    } else {
      setEndDate("");
    }

    setIsActive(promo.is_active !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    const cleanCode = code.trim().toUpperCase();
    const percent = Math.min(100, Math.max(1, parseInt(discountPercent) || 10));
    const parsedMaxUses = maxUses.trim() ? parseInt(maxUses) : null;
    const parsedMaxUsesPerUser = maxUsesPerUser.trim() ? parseInt(maxUsesPerUser) : null;
    const parsedStartDate = startDate ? new Date(startDate).toISOString() : null;
    const parsedEndDate = endDate ? new Date(endDate).toISOString() : null;

    if (editingPromo) {
      const updated = await updateAdminPromoCode({
        id: editingPromo.id,
        code: cleanCode,
        discount_percent: percent,
        max_uses: parsedMaxUses,
        max_uses_per_user: parsedMaxUsesPerUser,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        is_active: isActive,
      });
      if (updated) {
        onNotify?.(`Coupon "${cleanCode}" updated successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    } else {
      const created = await createAdminPromoCode({
        code: cleanCode,
        discount_percent: percent,
        max_uses: parsedMaxUses,
        max_uses_per_user: parsedMaxUsesPerUser,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        is_active: isActive,
      });
      if (created) {
        onNotify?.(`Coupon "${cleanCode}" created successfully.`);
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
      onNotify?.(`Coupon "${promo.code}" is now ${!promo.is_active ? 'Active' : 'Inactive'}.`);
      onRefresh?.();
    }
  };

  const handleDelete = async (id: string, codeStr: string) => {
    setDeletingId(id);
    const success = await deleteAdminPromoCode(id);
    setDeletingId(null);
    if (success) {
      onNotify?.(`Coupon "${codeStr}" deleted successfully.`);
      onRefresh?.();
    }
  };

  const getCouponStatusBadge = (promo: any) => {
    const now = new Date();
    const active = typeof promo === "object" ? promo.is_active !== false : true;
    if (!active) {
      return <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">INACTIVE</span>;
    }

    if (promo.start_date && new Date(promo.start_date) > now) {
      return <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-300">SCHEDULED</span>;
    }

    if (promo.end_date && new Date(promo.end_date) < now) {
      return <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-300">EXPIRED</span>;
    }

    if (promo.max_uses && (promo.current_uses || 0) >= promo.max_uses) {
      return <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-300">DEPLETED</span>;
    }

    return <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-300">ACTIVE</span>;
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-900" />
            Coupon & Discount Management
          </h2>
          <p className="text-xs text-slate-600">
            Create coupons, set discount %, total & per-user usage limits, and validity timeframe ({filteredPromos.length} total).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Coupon</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by coupon code name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono uppercase"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPromos.map((promo, idx) => {
          const id = promo.id || `promo-${idx}`;
          const codeStr = typeof promo === "string" ? promo : promo.code;
          const discount = typeof promo === "object" ? promo.discount_percent || 10 : 10;
          const active = typeof promo === "object" ? promo.is_active !== false : true;
          const isDeleting = deletingId === id;

          const currentUses = promo.current_uses || 0;
          const totalLimitStr = promo.max_uses ? `${currentUses} / ${promo.max_uses}` : `${currentUses} (Unlimited)`;
          const userLimitStr = promo.max_uses_per_user ? `${promo.max_uses_per_user} per user` : "Unlimited";

          return (
            <div
              key={id}
              className={`p-4 border bg-white space-y-3 flex flex-col justify-between transition-all text-xs ${
                active ? "border-slate-200 hover:border-slate-900 shadow-sm" : "border-slate-200 bg-slate-50 opacity-75"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-base tracking-wider uppercase">
                    {codeStr}
                  </span>
                  {getCouponStatusBadge(promo)}
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 flex items-center justify-between font-mono">
                  <span className="text-slate-600 text-[11px]">Discount Value:</span>
                  <span className="font-black text-slate-900 text-sm">{discount}% OFF</span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Hash className="w-3 h-3 text-slate-400" /> Usage Limit:
                    </span>
                    <span className="font-bold text-slate-900">{totalLimitStr}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3 h-3 text-slate-400" /> User Limit:
                    </span>
                    <span className="font-bold text-slate-900">{userLimitStr}</span>
                  </div>

                  {(promo.start_date || promo.end_date) && (
                    <div className="pt-1 text-[10px] space-y-0.5 border-t border-slate-100 mt-1">
                      {promo.start_date && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Starts:</span>
                          <span className="font-bold text-slate-800">
                            {new Date(promo.start_date).toLocaleDateString()} {new Date(promo.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      {promo.end_date && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Expires:</span>
                          <span className="font-bold text-slate-800">
                            {new Date(promo.end_date).toLocaleDateString()} {new Date(promo.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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
                  title="Toggle Coupon Status"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{active ? "Deactivate" : "Activate"}</span>
                </button>

                <button
                  onClick={() => openEditModal(promo)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer inline-flex items-center"
                  title="Edit Coupon Details & Limits"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  disabled={isDeleting}
                  onClick={() => handleDelete(id, codeStr)}
                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-slate-200 transition-colors cursor-pointer inline-flex items-center disabled:opacity-50"
                  title="Delete Coupon"
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
          <div className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-4 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-900" />
                {editingPromo ? "Edit Coupon Settings" : "Create New Coupon"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase">
              {/* Code & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Coupon Code Name *</label>
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
                  <label className="block text-slate-700 mb-1">Discount Percentage (%) *</label>
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
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" /> Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                  <span className="text-[9px] text-slate-400 normal-case font-normal">Max total uses across all users</span>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" /> Limit Per Single User
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={maxUsesPerUser}
                    onChange={(e) => setMaxUsesPerUser(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                  <span className="text-[9px] text-slate-400 normal-case font-normal">Max times 1 user can redeem this code</span>
                </div>
              </div>

              {/* Timeframe Range */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="block text-slate-900 font-black tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-900" /> Validity Timeframe Range (Optional)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 text-[10px]">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 text-[10px]">Expiry Date & Time</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Status Checkbox */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="couponActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
                <label htmlFor="couponActiveCheck" className="text-slate-900 cursor-pointer">
                  Coupon is Active for Checkout
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
                  {submitting ? "Saving..." : editingPromo ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
