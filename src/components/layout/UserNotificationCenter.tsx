"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Headset, Clock, Check, CheckCheck, X, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

import { createClient } from "@/lib/supabase/client";

import { useQueryClient } from "@tanstack/react-query";
import { useSupportTickets } from "@/hooks/useSupport";
import { fetchMessages } from "@/lib/services/supportApi";

export function UserNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile } = useUserStore();
  const queryClient = useQueryClient();

  const userIdentity =
    profile?.email ||
    (typeof window !== "undefined"
      ? localStorage.getItem("aura_visitor_id") || "Guest Customer"
      : "Guest Customer");

  // React Query for Tickets
  const queryParams = useMemo(() => ({ userIdentity }), [userIdentity]);
  const { data: userTickets = [] } = useSupportTickets(queryParams, { enabled: isOpen });
  const [notifications, setNotifications] = useState<any[]>([]);

  // Unique key representing current tickets state to avoid unnecessary re-runs
  const ticketKey = userTickets.map((t) => `${t.id}_${t.status}`).join(",");

  // Build notifications from tickets and messages
  useEffect(() => {
    let isMounted = true;

    async function loadNotifs() {
      if (userTickets.length === 0) {
        if (isMounted) setNotifications([]);
        return;
      }

      const notifList: any[] = [];
      for (const ticket of userTickets) {
        try {
          const msgs = await fetchMessages(ticket.id);
          const adminMsgs = msgs.filter((m) => m.sender_type === "admin");
          if (adminMsgs.length > 0) {
            const latestAdminMsg = adminMsgs[adminMsgs.length - 1];
            notifList.push({
              id: ticket.id + "_" + latestAdminMsg.id,
              type: "support",
              title: `Support Update (${ticket.ticket_code})`,
              message: `${latestAdminMsg.sender_name}: "${latestAdminMsg.message}"`,
              createdAt: latestAdminMsg.created_at,
              ticket,
            });
          } else if (ticket.status === "open") {
            notifList.push({
              id: ticket.id + "_open",
              type: "support",
              title: `Ticket ${ticket.ticket_code} Created`,
              message: "Waiting for an available customer service representative...",
              createdAt: ticket.created_at,
              ticket,
            });
          }
        } catch {}
      }

      if (isMounted) setNotifications(notifList);
    }

    loadNotifs();

    return () => {
      isMounted = false;
    };
  }, [ticketKey, userTickets]);

  // Load readIds from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aura_user_read_notifs");
      if (saved) setReadIds(JSON.parse(saved));
    } catch {}
  }, []);

  // Save readIds to localStorage
  const saveReadIds = (newReadIds: string[]) => {
    setReadIds(newReadIds);
    try {
      localStorage.setItem("aura_user_read_notifs", JSON.stringify(newReadIds));
    } catch {}
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SUPABASE REALTIME CACHE INVALIDATION FOR NOTIFICATION CENTER
  useEffect(() => {
    const supabase = createClient();
    const channelId = `user_notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIdentity, queryClient]);

  // Compute unread count
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!readIds.includes(id)) {
      saveReadIds([...readIds, id]);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    saveReadIds(Array.from(new Set([...readIds, ...allIds])));
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-900 border border-transparent hover:border-black cursor-pointer flex items-center justify-center group"
        title="User Notifications"
      >
        <Bell className="w-5 h-5 text-slate-900" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-emerald-500 text-slate-950 font-mono text-[9px] font-black flex items-center justify-center rounded-full border border-white shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-900 border border-slate-300 shadow-2xl z-50 overflow-hidden font-sans text-xs"
          >
            {/* HEADER */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Notifications
                </h4>
              </div>

              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Read All</span>
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* NOTIFICATIONS LIST */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 bg-slate-50">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  const isRead = readIds.includes(notif.id);
                  const dateObj = new Date(notif.createdAt);
                  const timeStr = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`p-3 transition-colors flex items-start space-x-2.5 cursor-pointer group ${
                        isRead
                          ? "bg-slate-50/70 text-slate-500"
                          : "bg-white text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`p-1.5 shrink-0 border ${
                          isRead
                            ? "bg-slate-100 text-slate-400 border-slate-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        <Headset className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h5
                            className={`font-bold truncate text-[11px] ${
                              isRead ? "text-slate-500" : "text-slate-900"
                            }`}
                          >
                            {notif.title}
                          </h5>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {timeStr}
                          </span>
                        </div>
                        <p
                          className={`line-clamp-2 leading-tight text-[11px] ${
                            isRead ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {notif.message}
                        </p>
                      </div>

                      {/* MARK INDIVIDUAL READ BUTTON */}
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className={`p-1 transition-colors cursor-pointer shrink-0 ${
                          isRead
                            ? "text-slate-300"
                            : "text-slate-400 hover:text-emerald-600"
                        }`}
                        title={isRead ? "Read" : "Mark as read"}
                      >
                        {isRead ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 space-y-1">
                  <Bell className="w-5 h-5 mx-auto opacity-30 text-slate-400" />
                  <p className="text-[11px] font-mono font-bold text-slate-500">
                    No new notifications.
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-2 bg-slate-100 border-t border-slate-200 text-center flex items-center justify-between px-3">
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                AURA Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[9px] font-mono text-emerald-700 hover:underline font-bold uppercase cursor-pointer"
                >
                  Mark all as read ({unreadCount})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
