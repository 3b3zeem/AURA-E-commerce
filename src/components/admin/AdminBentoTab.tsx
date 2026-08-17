'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Edit2, Check, Loader2, Sparkles, Zap, ShieldCheck, Grid, Plus, Trash2, X, Upload, RefreshCw } from 'lucide-react';
import { BentoItem, BentoBoxType } from '@/types';
import { createBentoItemInDb, updateBentoItemInDb, deleteBentoItemInDb } from '@/lib/services/db';


interface AdminBentoTabProps {
  bentoList?: BentoItem[];
  onRefresh?: () => void;
  onNotify?: (msg: string) => void;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
}

export function AdminBentoTab({ bentoList, onRefresh, onNotify, onFileUpload }: AdminBentoTabProps) {
  const toast = onNotify || ((msg: string) => console.log(msg));
  const [items, setItems] = useState<BentoItem[]>(bentoList || []);

  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<BentoItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/bento', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bento items:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRefresh = () => {
    fetchItems();
    if (onRefresh) onRefresh();
  };

  // New item form state
  const [newItem, setNewItem] = useState<Partial<BentoItem>>({
    box_type: 'spotlight',
    title: '',
    subtitle: '',
    description: '',
    badge_text: '',
    image_url: '',
    cta_text: 'SHOP NOW',
    cta_link: '/products',
    display_order: items.length + 1,
    is_active: true,
  });

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    if (onFileUpload) {
      onFileUpload(e, setter);
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent, itemToSave: Partial<BentoItem>) => {
    e.preventDefault();
    if (!itemToSave.title || !itemToSave.box_type) return;

    try {
      setIsSaving(true);
      const result = itemToSave.id
        ? await updateBentoItemInDb(itemToSave.id, itemToSave)
        : await createBentoItemInDb(itemToSave);

      if (result) {
        setEditingItem(null);
        setIsAddOpen(false);
        setNewItem({
          box_type: 'spotlight',
          title: '',
          subtitle: '',
          description: '',
          badge_text: '',
          image_url: '',
          cta_text: 'SHOP NOW',
          cta_link: '/products',
          display_order: items.length + 1,
          is_active: true,
        });
        toast('Bento Card saved successfully!');
        handleRefresh();
      } else {
        toast('Failed to save Bento Card');
      }
    } catch (err) {
      console.error(err);
      toast('Error saving Bento Card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Bento Card?')) return;

    try {
      setDeletingId(id);
      const success = await deleteBentoItemInDb(id);
      if (success) {
        toast('Bento Card deleted.');
        handleRefresh();
      } else {
        toast('Failed to delete Bento Card');
      }
    } catch (err) {
      console.error(err);
      toast('Error deleting Bento Card');
    } finally {
      setDeletingId(null);
    }
  };

  const getBoxIcon = (type: string) => {
    switch (type) {
      case 'spotlight':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'flash_deals':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'guarantee':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Grid className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5 text-slate-900" />
            <span>Apple-Style Bento Grid CMS</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </h2>
          <p className="text-xs text-slate-600">
            Manage the spotlight cards on your homepage hero section.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-300 disabled:opacity-50"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Bento Card</span>
          </button>
        </div>
      </div>

      {/* Grid of Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-slate-300 p-5 bg-white space-y-4 hover:border-slate-900 transition-all shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  {getBoxIcon(item.box_type)}
                  <span className="font-black text-xs uppercase tracking-wider text-slate-900 font-mono">
                    BOX TYPE: [{item.box_type}]
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Bento Card"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {item.image_url && (
                <div className="h-36 w-full overflow-hidden border border-slate-200">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase font-mono">
                  {item.subtitle || item.badge_text}
                </span>
                <h3 className="font-black text-lg text-slate-900 uppercase">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-slate-700">
              <span>CTA: {item.cta_text || 'SHOP NOW'}</span>
              <span className="text-slate-400 truncate max-w-[150px]">LINK: {item.cta_link}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: ADD NEW BENTO CARD */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-slate-900" />
                <span>Add New Bento Card</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSave(e, newItem)} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Card Box Type *</label>
                <select
                  value={newItem.box_type}
                  onChange={(e) => setNewItem({ ...newItem, box_type: e.target.value as BentoBoxType })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="spotlight">Spotlight (Large 2 Columns × 2 Rows)</option>
                  <option value="flash_deals">Flash Deals (1 Column × 1 Row)</option>
                  <option value="guarantee">Guarantee & Trust (1 Column × 1 Row)</option>
                  <option value="categories">Curated Categories (2 Columns × 1 Row)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AURA CYBERHEADSET PRO '26"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Subtitle / Category Tag</label>
                <input
                  type="text"
                  placeholder="e.g. FLAGSHIP AUDIOPHILE COLLECTION"
                  value={newItem.subtitle || ''}
                  onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  placeholder="e.g. STAR SPOTLIGHT"
                  value={newItem.badge_text || ''}
                  onChange={(e) => setNewItem({ ...newItem, badge_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Card short description..."
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Image (Upload from Device or Paste URL)</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-2 bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer flex items-center space-x-1 whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 text-slate-900" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLocalFileUpload(e, (url) => setNewItem({ ...newItem, image_url: url }))}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Paste image URL..."
                      value={newItem.image_url || ''}
                      onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-300 p-2 font-mono text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  {newItem.image_url && (
                    <div className="relative w-20 h-20 border border-slate-200">
                      <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={newItem.cta_text || 'SHOP NOW'}
                    onChange={(e) => setNewItem({ ...newItem, cta_text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">CTA Link URL</label>
                  <input
                    type="text"
                    value={newItem.cta_link || '/products'}
                    onChange={(e) => setNewItem({ ...newItem, cta_link: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding Bento Card...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Create & Publish Bento Card</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT BENTO CARD */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900">
                Edit Bento Box [{editingItem.box_type}]
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSave(e, editingItem)} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Subtitle / Category Tag</label>
                <input
                  type="text"
                  value={editingItem.subtitle || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={editingItem.badge_text || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, badge_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Image (Upload from Device or Paste URL)</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-2 bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer flex items-center space-x-1 whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 text-slate-900" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLocalFileUpload(e, (url) => setEditingItem({ ...editingItem, image_url: url }))}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingItem.image_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-300 p-2 font-mono text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  {editingItem.image_url && (
                    <div className="relative w-20 h-20 border border-slate-200">
                      <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingItem.cta_text || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, cta_text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">CTA Link URL</label>
                  <input
                    type="text"
                    value={editingItem.cta_link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, cta_link: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Card...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Save Bento Card Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
