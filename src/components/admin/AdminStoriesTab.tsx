"use client";

import React from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Story } from "@/types";

interface AdminStoriesTabProps {
  storiesList: Story[];
  actionLoadingId: string | null;
  onOpenAddModal: () => void;
  onEditStory: (story: Story) => void;
  onDeleteStory: (id: string) => void;
}

export function AdminStoriesTab({
  storiesList,
  actionLoadingId,
  onOpenAddModal,
  onEditStory,
  onDeleteStory,
}: AdminStoriesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900">
            Homepage Stories & Drops
          </h2>
          <p className="text-xs text-slate-600">
            Campaign hero banners displayed on the main page.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Campaign Story</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storiesList.map((st) => (
          <div
            key={st.id}
            className="border border-slate-200 p-4 flex justify-between items-start bg-white hover:border-slate-900 transition-all"
          >
            <div className="flex gap-4">
              <img
                src={st.image_url}
                alt={st.title}
                className="w-20 h-20 rounded-full aspect-square flex-shrink-0 object-cover border-2 border-slate-900 shadow-xs"
              />
              <div className="space-y-1">
                <h3 className="font-black text-base uppercase text-slate-900">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600">{st.subtitle}</p>
                <div className="pt-1">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                    {st.products?.length || 0} Attached Product(s)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEditStory(st)}
                className="p-1 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-900 transition-colors cursor-pointer mr-1"
                title="Edit Story"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={actionLoadingId === st.id}
                onClick={() => onDeleteStory(st.id)}
                className="p-1 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                title="Delete Story"
              >
                {actionLoadingId === st.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
