"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  Eye,
  Search,
  User,
  Star,
  Mail,
  Sliders,
  Volume2,
  VolumeX,
  X,
  Clock,
} from "lucide-react";
import { useNotificationStore, AdminNotification } from "@/store/useNotificationStore";
import { playAdminSound, sendNativeNotification } from "@/lib/utils/sound";
import { formatPrice } from "@/lib/utils";

type FilterType = "all" | "order" | "cart" | "product" | "search" | "user" | "review" | "newsletter" | "system";

export function AdminNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, fetchNotifications, addNotification, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();

  const prevUnreadRef = useRef<number | null>(null);

  // Initial fetch and 3s polling from API / Supabase
  useEffect(() => {
    const checkNewNotifications = async () => {
      await fetchNotifications();
      const currentUnread = useNotificationStore.getState().unreadCount;

      if (prevUnreadRef.current !== null && currentUnread > prevUnreadRef.current) {
        if (soundEnabled) playAdminSound("cart");
        if (pushEnabled) {
          const latestNotif = useNotificationStore.getState().notifications[0];
          if (latestNotif) {
            sendNativeNotification(latestNotif.title, { body: latestNotif.message });
          }
        }
      }
      prevUnreadRef.current = currentUnread;
    };

    checkNewNotifications();
    const interval = setInterval(checkNewNotifications, 3000);
    return () => clearInterval(interval);
  }, [fetchNotifications, soundEnabled, pushEnabled]);

  // Check push permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const res = await Notification.requestPermission();
      if (res === "granted") {
        setPushEnabled(true);
        sendNativeNotification("Notifications Active", {
          body: "You will receive desktop alerts for new store orders, cart events, and user activities.",
        });
      }
    } catch {}
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to live events dispatched across the site
  useEffect(() => {
    const handleLiveEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const payload = customEvent.detail;
      if (!payload) return;

      const eventType = payload.event_type;
      const meta = payload.meta || {};
      const userEmail =
        meta.user_name ||
        (payload.visitor_id ? `Guest #${payload.visitor_id.replace(/^v_/, "").slice(-4).toUpperCase()}` : "Guest User");

      if (eventType === "purchase") {
        const amount = meta.total_amount || 0;
        addNotification({
          type: "order",
          title: "New Order Placed",
          message: `${userEmail} completed an order worth ${formatPrice(amount)}`,
          userEmail,
          amount,
        });

        if (soundEnabled) playAdminSound("purchase");
        if (pushEnabled) {
          sendNativeNotification("New Order Received", {
            body: `${userEmail} placed an order worth ${formatPrice(amount)}`,
          });
        }
      } else if (eventType === "add_to_cart") {
        const prodName = meta.product_name || "a product";
        const price = meta.price || 0;

        addNotification({
          type: "cart",
          title: "Product Added to Cart",
          message: `${userEmail} added "${prodName}" to cart`,
          userEmail,
          amount: price,
        });

        if (soundEnabled) playAdminSound("cart");
      } else if (eventType === "checkout_start") {
        const amount = meta.total_amount || 0;
        addNotification({
          type: "cart",
          title: "Checkout Process Started",
          message: `${userEmail} started checkout with cart value ${formatPrice(amount)}`,
          userEmail,
          amount,
        });

        if (soundEnabled) playAdminSound("alert");
      } else if (eventType === "product_view" && meta.product_name) {
        addNotification({
          type: "product",
          title: "Product Page Viewed",
          message: `${userEmail} viewed "${meta.product_name}"`,
          userEmail,
        });
      } else if (eventType === "search_query" && meta.query) {
        addNotification({
          type: "search",
          title: "Store Search Performed",
          message: `${userEmail} searched for "${meta.query}"`,
          userEmail,
        });
      }
    };

    window.addEventListener("aura_track_analytics", handleLiveEvent);
    return () => window.removeEventListener("aura_track_analytics", handleLiveEvent);
  }, [soundEnabled, pushEnabled, addNotification]);

  // Filtered list
  const filteredNotifications = notifications.filter(
    (n) => activeFilter === "all" || n.type === activeFilter
  );

  const renderIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-4 h-4" />;
      case "cart":
        return <ShoppingCart className="w-4 h-4" />;
      case "product":
        return <Eye className="w-4 h-4" />;
      case "search":
        return <Search className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      case "review":
        return <Star className="w-4 h-4" />;
      case "newsletter":
        return <Mail className="w-4 h-4" />;
      default:
        return <Sliders className="w-4 h-4" />;
    }
  };

  const renderBadgeStyle = (type: string) => {
    switch (type) {
      case "order":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "cart":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "product":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "search":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "user":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "review":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "newsletter":
        return "bg-teal-100 text-teal-800 border-teal-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* NOTIFICATION BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-900 text-white hover:bg-black border border-slate-800 transition-all cursor-pointer flex items-center justify-center group"
        title="Admin Notifications Center"
      >
        <Bell className={`w-4 h-4 transition-transform group-hover:scale-110 ${unreadCount > 0 ? "text-emerald-400" : "text-slate-300"}`} />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-emerald-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN NOTIFICATION CENTER POPUP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 border border-slate-200 shadow-2xl z-50 overflow-hidden font-sans"
          >
            {/* POPUP HEADER */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Notification Center
                </h4>
                {unreadCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 border border-emerald-300">
                    {unreadCount} UNREAD
                  </span>
                )}
              </div>

              {/* Sound & Settings controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title={soundEnabled ? "Mute Sound Alerts" : "Unmute Sound Alerts"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* FILTER TABS & BULK ACTIONS */}
            <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200 space-y-2 text-xs">
              <div className="flex flex-wrap items-center gap-1">
                {(["all", "order", "cart", "product", "search", "user", "newsletter", "system"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                      activeFilter === filter
                        ? "bg-slate-900 text-white font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-bold">{filteredNotifications.length} items</span>

                <div className="flex items-center space-x-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-slate-700 hover:text-emerald-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span>Read all</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PUSH NOTIFICATION PROMPT IF NOT GRANTED */}
            {!pushEnabled && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-[11px]">
                <span className="text-amber-900 font-medium">Enable Desktop Push Notifications</span>
                <button
                  onClick={requestPushPermission}
                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase text-[9px] font-mono transition-colors cursor-pointer"
                >
                  Enable
                </button>
              </div>
            )}

            {/* NOTIFICATION ITEMS LIST */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => {
                  const dateObj = new Date(notif.createdAt);
                  const timeAgo = Math.max(
                    1,
                    Math.floor((Date.now() - dateObj.getTime()) / 60000)
                  );

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer ${
                        !notif.read ? "bg-emerald-50/40 hover:bg-emerald-50/70" : "bg-white hover:bg-slate-50 opacity-80"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`p-2 shrink-0 border ${renderBadgeStyle(notif.type)}`}>
                        {renderIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                            )}
                            {notif.title}
                          </h5>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo < 60 ? `${timeAgo}m` : `${Math.floor(timeAgo / 60)}h`}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        {notif.userEmail && (
                          <span className="inline-block text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                            {notif.userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-6 h-6 mx-auto opacity-30 text-slate-400" />
                  <p className="text-xs font-mono font-bold text-slate-500">No notifications in this filter.</p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                Live Admin Stream Active • {notifications.length} Total Logs
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
