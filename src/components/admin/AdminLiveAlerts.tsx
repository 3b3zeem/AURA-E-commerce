"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Bell, BellOff, ShoppingBag, ShoppingCart, CheckCircle2, Sparkles, X } from "lucide-react";
import { playAdminSound, sendNativeNotification } from "@/lib/utils/sound";
import { formatPrice } from "@/lib/utils";

export interface LiveAlertItem {
  id: string;
  type: "purchase" | "cart" | "checkout";
  title: string;
  subtitle: string;
  user: string;
  amount?: number;
  timestamp: Date;
}

export function AdminLiveAlerts() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [alerts, setAlerts] = useState<LiveAlertItem[]>([]);

  // Check current notification permission state
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsGranted(Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const res = await Notification.requestPermission();
      if (res === "granted") {
        setNotificationsGranted(true);
        sendNativeNotification("AURA Admin Alerts Activated! 🔔", {
          body: "You will now receive live alerts even when working in another tab.",
        });
      }
    } catch {}
  };

  // Listen to live events dispatched across the app
  useEffect(() => {
    const handleLiveEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const payload = customEvent.detail;
      if (!payload) return;

      const eventType = payload.event_type;
      const meta = payload.meta || {};
      const userName = meta.user_name || (payload.visitor_id ? `Guest #${payload.visitor_id.replace(/^v_/, '').slice(-4).toUpperCase()}` : "Guest");

      if (eventType === "purchase") {
        const amount = meta.total_amount || 0;
        const newAlert: LiveAlertItem = {
          id: "alt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          type: "purchase",
          title: "New Order Placed",
          subtitle: `${userName} completed an order worth ${formatPrice(amount)}`,
          user: userName,
          amount,
          timestamp: new Date(),
        };

        setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);

        if (soundEnabled) playAdminSound("purchase");
        if (notificationsGranted) {
          sendNativeNotification("New Order Received", {
            body: `${userName} placed an order worth ${formatPrice(amount)}`,
          });
        }
      } else if (eventType === "add_to_cart") {
        const prodName = meta.product_name || "a product";
        const price = meta.price || 0;

        const newAlert: LiveAlertItem = {
          id: "alt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          type: "cart",
          title: "Product Added to Cart",
          subtitle: `${userName} added "${prodName}" to cart`,
          user: userName,
          amount: price,
          timestamp: new Date(),
        };

        setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);

        if (soundEnabled) playAdminSound("cart");
        if (notificationsGranted && price >= 100) {
          sendNativeNotification("High-Value Item Added to Cart", {
            body: `${userName} added "${prodName}" (${formatPrice(price)})`,
          });
        }
      } else if (eventType === "checkout_start") {
        const amount = meta.total_amount || 0;
        const newAlert: LiveAlertItem = {
          id: "alt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          type: "checkout",
          title: "Checkout Process Started",
          subtitle: `${userName} entered checkout with cart worth ${formatPrice(amount)}`,
          user: userName,
          amount,
          timestamp: new Date(),
        };

        setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);

        if (soundEnabled) playAdminSound("alert");
      }
    };

    window.addEventListener("aura_track_analytics", handleLiveEvent);
    return () => window.removeEventListener("aura_track_analytics", handleLiveEvent);
  }, [soundEnabled, notificationsGranted]);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      {/* TOOLBAR NOTIFICATION & SOUND CONTROLS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-colors cursor-pointer ${
            soundEnabled
              ? "bg-slate-900 text-white border-slate-800 hover:bg-black"
              : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
          }`}
          title="Toggle Sound Alerts for New Orders & Cart Additions"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          <span>Sound {soundEnabled ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={requestNotificationPermission}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-colors cursor-pointer ${
            notificationsGranted
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
          }`}
          title={notificationsGranted ? "Browser Push Notifications Active" : "Enable Desktop Browser Notifications"}
        >
          {notificationsGranted ? <Bell className="w-3.5 h-3.5 text-emerald-600" /> : <BellOff className="w-3.5 h-3.5 text-amber-600" />}
          <span>Push Alerts {notificationsGranted ? "Active" : "Enable"}</span>
        </button>
      </div>

      {/* FLOATING TOAST NOTIFICATIONS AT BOTTOM RIGHT */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto p-4 border shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 ${
                alert.type === "purchase"
                  ? "bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20"
                  : alert.type === "cart"
                  ? "bg-white/95 text-slate-900 border-amber-400 shadow-slate-300/50"
                  : "bg-slate-900/95 text-white border-indigo-500/50 shadow-indigo-950/20"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-none flex-shrink-0 ${
                    alert.type === "purchase"
                      ? "bg-emerald-500 text-slate-950"
                      : alert.type === "cart"
                      ? "bg-amber-500 text-slate-950"
                      : "bg-indigo-500 text-white"
                  }`}
                >
                  {alert.type === "purchase" ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : alert.type === "cart" ? (
                    <ShoppingCart className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-xs font-black uppercase tracking-wider">{alert.title}</h5>
                  </div>
                  <p className="text-xs font-medium opacity-90 leading-snug">{alert.subtitle}</p>
                  <span className="text-[9px] font-mono opacity-60 block pt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeAlert(alert.id)}
                className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
