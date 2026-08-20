"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2 } from "lucide-react";
import { Story } from "@/types";

interface EditStoryModalProps {
  editingStory: Story | null;
  setEditingStory: (story: Story | null) => void;
  isSubmitting: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditStoryModal({
  editingStory,
  setEditingStory,
  isSubmitting,
  onFileUpload,
  onSubmit,
}: EditStoryModalProps) {
  return (
    <AnimatePresence>
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-6 text-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black uppercase text-slate-900">Edit Story</h3>
              <button
                onClick={() => setEditingStory(null)}
                className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={onSubmit}
              className="space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block text-slate-600 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={editingStory.title}
                  onChange={(e) =>
                    setEditingStory({
                      ...editingStory,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editingStory.subtitle || ""}
                  onChange={(e) =>
                    setEditingStory({
                      ...editingStory,
                      subtitle: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Image (Upload from Folder or URL)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-2 bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer flex items-center space-x-1 whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 text-slate-900" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          onFileUpload(e, (url) =>
                            setEditingStory({
                              ...editingStory,
                              image_url: url,
                            }),
                          )
                        }
                      />
                    </label>
                    <input
                      type="text"
                      value={editingStory.image_url || ""}
                      onChange={(e) =>
                        setEditingStory({
                          ...editingStory,
                          image_url: e.target.value,
                        })
                      }
                      className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                      placeholder="Paste image URL..."
                    />
                  </div>
                  {editingStory.image_url && (
                    <div className="relative w-16 h-16 border border-slate-200">
                      <img
                        src={editingStory.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Story...</span>
                  </>
                ) : (
                  <span>Update Story in Supabase</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
