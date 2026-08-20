"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

interface AddTrendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  newTrendingQuery: string;
  setNewTrendingQuery: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddTrendingModal({
  isOpen,
  onClose,
  isSubmitting,
  newTrendingQuery,
  setNewTrendingQuery,
  onSubmit,
}: AddTrendingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-6 text-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black uppercase text-slate-900">
                Add Trending Keyword
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">
                  Keyword / Query
                </label>
                <input
                  type="text"
                  required
                  value={newTrendingQuery}
                  onChange={(e) => setNewTrendingQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  placeholder="e.g. Wireless Audio"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Keyword...</span>
                  </>
                ) : (
                  <span>Add Keyword to Supabase</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
