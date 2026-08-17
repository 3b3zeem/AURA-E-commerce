"use client";

import React, { useState } from "react";
import { Plus, Flame, Search, Edit, Trash2, Loader2, X } from "lucide-react";
import { addAdminTrendingSearch, updateAdminTrendingSearch, deleteTrendingSearch } from "@/lib/services/db";

interface AdminTrendingTabProps {
  trendingList: any[];
  actionLoadingId: string | null;
  onOpenAddModal?: () => void;
  onDeleteTrending?: (id: string) => void;
  onRefresh?: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminTrendingTab({
  trendingList,
  actionLoadingId,
  onRefresh,
  onNotify,
}: AdminTrendingTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; query: string; search_count?: number } | null>(null);

  // Form State
  const [queryInput, setQueryInput] = useState("");
  const [countInput, setCountInput] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredList = trendingList.filter((tr) => {
    const q = typeof tr === "string" ? tr : tr.query || "";
    return q.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openAddModal = () => {
    setEditingItem(null);
    setQueryInput("");
    setCountInput("1");
    setIsModalOpen(true);
  };

  const openEditModal = (tr: any) => {
    const trId = typeof tr === "object" ? tr.id : null;
    const trQuery = typeof tr === "string" ? tr : tr.query;
    const trCount = typeof tr === "object" ? tr.search_count || 1 : 1;

    setEditingItem({ id: trId, query: trQuery, search_count: trCount });
    setQueryInput(trQuery);
    setCountInput(String(trCount));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setSubmitting(true);
    const countVal = parseInt(countInput) || 1;

    if (editingItem && editingItem.id) {
      const ok = await updateAdminTrendingSearch(editingItem.id, queryInput.trim(), countVal);
      if (ok) {
        onNotify?.(`Keyword "${queryInput}" updated.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    } else {
      const ok = await addAdminTrendingSearch(queryInput.trim());
      if (ok) {
        onNotify?.(`Keyword "${queryInput}" added to trending searches.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (tr: any) => {
    const trId = typeof tr === "object" && tr?.id ? tr.id : null;
    const trQuery = typeof tr === "string" ? tr : tr.query;

    if (!trId) {
      onNotify?.("Cannot delete static fallback keyword.");
      return;
    }

    setDeletingId(trId);
    const ok = await deleteTrendingSearch(trId);
    if (ok) {
      onNotify?.(`Keyword "${trQuery}" deleted.`);
      onRefresh?.();
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-slate-900 fill-slate-900" />
            Trending Search Keywords
          </h2>
          <p className="text-xs text-slate-600">
            Manage terms suggested to users in search dropdown ({filteredList.length} items).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Keyword</span>
        </button>
      </div>

      {/* Search Input Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredList.map((tr, idx) => {
          const trId = typeof tr === "object" && tr?.id ? tr.id : null;
          const trQuery = typeof tr === "string" ? tr : tr.query;
          const trCount = typeof tr === "object" ? tr.search_count || 1 : 1;
          const isDeleting = !!(trId && (deletingId === trId || actionLoadingId === trId));

          return (
            <div
              key={idx}
              className="p-3 bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold flex items-center justify-between hover:border-slate-900 transition-all"
            >
              <div className="flex items-center space-x-2 truncate pr-2">
                <Flame className="w-4 h-4 text-slate-900 fill-slate-900 flex-shrink-0" />
                <div className="truncate">
                  <span className="block truncate">{trQuery}</span>
                  <span className="text-[10px] text-slate-500 block font-normal">
                    Searched {trCount}x
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={() => openEditModal(tr)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit keyword"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  disabled={isDeleting}
                  onClick={() => handleDelete(tr)}
                  className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete keyword"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900">
                {editingItem ? "Edit Keyword" : "Add Trending Keyword"}
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
                <label className="block text-slate-700 mb-1">Search Keyword Query</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Audio"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              {editingItem && (
                <div>
                  <label className="block text-slate-700 mb-1">Search Count Volume</label>
                  <input
                    type="number"
                    min="1"
                    value={countInput}
                    onChange={(e) => setCountInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

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
                  {submitting ? "Saving..." : editingItem ? "Save Changes" : "Add Keyword"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
