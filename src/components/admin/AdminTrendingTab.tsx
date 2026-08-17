"use client";

import React from "react";
import { Plus, Flame, Loader2 } from "lucide-react";

interface AdminTrendingTabProps {
  trendingList: any[];
  actionLoadingId: string | null;
  onOpenAddModal: () => void;
  onDeleteTrending: (id: string) => void;
}

export function AdminTrendingTab({
  trendingList,
  actionLoadingId,
  onOpenAddModal,
  onDeleteTrending,
}: AdminTrendingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900">
            Trending Search Keywords
          </h2>
          <p className="text-xs text-slate-600">
            Keywords displayed in the header search dropdown.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Keyword</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {trendingList.map((tr, idx) => {
          const trId = typeof tr === "object" && tr?.id ? tr.id : null;
          const trQuery = typeof tr === "string" ? tr : tr.query;
          return (
            <div
              key={idx}
              className="p-3 bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold flex items-center justify-between hover:border-slate-900 transition-all"
            >
              <div className="flex items-center space-x-2 truncate">
                <Flame className="w-4 h-4 text-slate-900 fill-slate-900 flex-shrink-0" />
                <span className="truncate">{trQuery}</span>
              </div>
              {trId && (
                <button
                  disabled={actionLoadingId === trId}
                  onClick={() => onDeleteTrending(trId)}
                  className="ml-1 p-1 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
                  title="Delete keyword"
                >
                  {actionLoadingId === trId ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "×"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
