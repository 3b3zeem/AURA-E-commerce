"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Edit, Trash2, Zap, Send, Check, Star, Sparkles, Package } from "lucide-react";
import { Offer, Product } from "@/types";
import { setOverlayFeaturedOffer, broadcastOfferEmailAlert } from "@/lib/services/db";
import toast from "react-hot-toast";

interface AdminOffersTabProps {
  offersList: Offer[];
  productsList: Product[];
  actionLoadingId: string | null;
  onOpenAddModal: () => void;
  onEditOffer: (offer: Offer) => void;
  onDeleteOffer: (id: string) => void;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

export function AdminOffersTab({
  offersList,
  productsList,
  actionLoadingId,
  onOpenAddModal,
  onEditOffer,
  onDeleteOffer,
  onRefresh,
  onNotify,
}: AdminOffersTabProps) {
  const [broadcastingOffer, setBroadcastingOffer] = useState<Offer | null>(null);
  const [customMsg, setCustomMsg] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (broadcastingOffer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [broadcastingOffer]);

  const handleSetOverlay = async (offerId: string) => {
    const success = await setOverlayFeaturedOffer(offerId);
    if (success) {
      onNotify("Offer set as site-wide entrance popup overlay!");
      await onRefresh();
    } else {
      toast.error("Failed to update overlay offer");
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastingOffer) return;

    try {
      setIsBroadcasting(true);
      const res = await broadcastOfferEmailAlert({
        offerTitle: broadcastingOffer.title,
        offerSubtitle: broadcastingOffer.subtitle || "",
        offerPrice: broadcastingOffer.offer_price,
        originalPrice: broadcastingOffer.original_price,
        offerImage: broadcastingOffer.image_url,
        customMessage: customMsg,
        products: (broadcastingOffer.products || []).map((p) => ({
          name: p.name,
          price: p.price,
          image: p.images && p.images[0] ? p.images[0] : undefined,
        })),
      });

      if (res.success) {
        onNotify(`Broadcast email sent to ${res.count || 2} subscribers!`);
        setBroadcastingOffer(null);
        setCustomMsg("");
      } else {
        toast.error(res.message || "Failed to broadcast email");
      }
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base font-black text-slate-900 uppercase font-mono tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-900" />
            Offers & Bundles Management ({offersList.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create custom offer bundles, set which offer pops up in the website overlay modal, and broadcast email notifications to subscribers.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase transition-colors flex items-center space-x-2 border border-slate-800 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Create New Offer Bundle</span>
        </button>
      </div>

      {/* Offers Cards Grid */}
      {offersList.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center text-xs font-bold uppercase text-slate-500 font-mono">
          No offer bundles created yet. Click "Create New Offer Bundle" to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offersList.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white border-2 transition-all p-6 flex flex-col justify-between space-y-4 shadow-sm relative ${
                offer.show_in_overlay ? "border-amber-400 bg-amber-50/20" : "border-slate-200 hover:border-slate-900"
              }`}
            >
              {/* Top Row: Badges & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-mono font-bold uppercase">
                    {offer.badge || `SAVE ${offer.discount_percentage}%`}
                  </span>

                  {offer.show_in_overlay && (
                    <span className="px-2.5 py-1 bg-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase flex items-center gap-1 border border-amber-500">
                      <Star className="w-3 h-3 fill-slate-950" />
                      Active Overlay Popup
                    </span>
                  )}
                </div>

                {(() => {
                  const now = new Date().toISOString();
                  let statusLabel = "Active";
                  let statusClass = "bg-emerald-100 text-emerald-800";

                  if (!offer.is_active) {
                    statusLabel = "Inactive";
                    statusClass = "bg-slate-100 text-slate-600";
                  } else if (offer.starts_at && offer.starts_at > now) {
                    statusLabel = "Scheduled";
                    statusClass = "bg-blue-100 text-blue-800";
                  } else if (offer.ends_at && offer.ends_at < now) {
                    statusLabel = "Expired";
                    statusClass = "bg-rose-100 text-rose-800";
                  }

                  return (
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${statusClass}`}>
                      {statusLabel}
                    </span>
                  );
                })()}
              </div>

              {/* Offer Image & Info */}
              <div className="flex items-start space-x-4">
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-20 h-20 object-cover border border-slate-300 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {offer.title}
                  </h4>
                  {offer.subtitle && (
                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                      {offer.subtitle}
                    </p>
                  )}
                  <div className="flex items-baseline space-x-2 font-mono pt-1">
                    <span className="text-base font-black text-slate-900">
                      ${offer.offer_price}
                    </span>
                    {offer.original_price > offer.offer_price && (
                      <span className="text-xs font-bold text-slate-400 line-through">
                        ${offer.original_price}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">
                      ({offer.discount_percentage}% OFF)
                    </span>
                  </div>

                  {(offer.starts_at || offer.ends_at) && (
                    <div className="text-[11px] font-mono text-slate-500 pt-1 space-y-0.5 border-t border-slate-100 mt-1">
                      {offer.starts_at && (
                        <div>Starts: <span className="font-bold text-slate-800">{new Date(offer.starts_at).toLocaleString()}</span></div>
                      )}
                      {offer.ends_at && (
                        <div>Ends: <span className="font-bold text-amber-700">{new Date(offer.ends_at).toLocaleString()}</span></div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Included Products Visual Breakdown */}
              {offer.products && offer.products.length > 0 && (
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      Included Items in Bundle ({offer.products.length}):
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {offer.products.map((p) => {
                      const imgUrl = p.images && p.images[0] ? p.images[0] : null;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center space-x-2.5 p-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="w-9 h-9 object-cover rounded border border-slate-200 flex-shrink-0 bg-white"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-slate-200 rounded flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                              <Package className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[12px] font-bold text-slate-900 truncate leading-tight">
                              {p.name}
                            </h5>
                            <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-500">
                              <span>Reg Price:</span>
                              <span className="font-bold text-slate-800">${p.price}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {!offer.show_in_overlay ? (
                    <button
                      onClick={() => handleSetOverlay(offer.id)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-mono font-bold uppercase transition-colors border border-amber-500 cursor-pointer flex items-center space-x-1"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Set as Overlay Popup</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-amber-700 uppercase flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Currently Featured Popup
                    </span>
                  )}

                  <button
                    onClick={() => setBroadcastingOffer(offer)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-mono font-bold uppercase transition-colors border border-slate-800 cursor-pointer flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>Send Email Alert</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditOffer(offer)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Offer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteOffer(offer.id)}
                    className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Offer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BROADCAST EMAIL ALERT MODAL */}
      {broadcastingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 w-full max-w-lg p-6 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2 text-slate-900">
                <Send className="w-5 h-5" />
                <h4 className="text-base font-black font-mono uppercase">
                  Broadcast Offer to Subscribers
                </h4>
              </div>
              <button
                onClick={() => setBroadcastingOffer(null)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">
                  Target Offer Preview:
                </span>
                <p className="font-black text-slate-900 text-sm">{broadcastingOffer.title}</p>
                <p className="text-slate-600 font-mono text-[11px]">
                  Offer Price: <strong className="text-slate-900">${broadcastingOffer.offer_price}</strong> (Regular: ${broadcastingOffer.original_price})
                </p>
                {broadcastingOffer.products && broadcastingOffer.products.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-700 text-[10px] uppercase block mb-1">
                      Included Items ({broadcastingOffer.products.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {broadcastingOffer.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center space-x-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-800"
                        >
                          {p.images && p.images[0] && (
                            <img src={p.images[0]} alt={p.name} className="w-4 h-4 rounded object-cover" />
                          )}
                          <span className="truncate max-w-[140px]">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-800">
                  Custom Broadcast Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Exclusive flash deal for our early subscribers! Available for 48 hours only..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Clicking send will dispatch a styled HTML email notification regarding this deal to all emails registered in the Newsletter subscribers list.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setBroadcastingOffer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isBroadcasting}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>{isBroadcasting ? "Broadcasting..." : "Broadcast Email Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
