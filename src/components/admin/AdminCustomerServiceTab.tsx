"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Headset,
  CheckCircle2,
  Clock,
  User,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Sliders,
  XCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  useSupportTickets,
  useSupportMessages,
  useAdminStatus,
  useSendMessageMutation,
  useUpdateTicketMutation,
  useUpdateAdminStatusMutation,
} from "@/hooks/useSupport";

export function AdminCustomerServiceTab() {
  const [adminEmail, setAdminEmail] = useState("support.admin@aura.com");
  const [adminName, setAdminName] = useState("Admin Agent");

  const [activeFilter, setActiveFilter] = useState<
    "all" | "open" | "in_progress" | "solved"
  >("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [alertError, setAlertError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // React Query Hooks
  const { data: tickets = [], isLoading: ticketsLoading } = useSupportTickets({
    status: activeFilter,
  });
  const selectedTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;
  const { data: messages = [] } = useSupportMessages(selectedTicket?.id || "");
  const { data: adminStatusObj } = useAdminStatus(adminEmail);

  const adminStatus = adminStatusObj?.status || "available";

  const sendMessageMutation = useSendMessageMutation();
  const updateTicketMutation = useUpdateTicketMutation();
  const updateAdminStatusMutation = useUpdateAdminStatusMutation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef<boolean>(false);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isUserScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 100;
  };

  // Auto-scroll messages inside container ONLY if user has not scrolled up
  useEffect(() => {
    if (!isUserScrolledUpRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Always scroll container to bottom when selecting a new ticket
  useEffect(() => {
    isUserScrolledUpRef.current = false;
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [selectedTicket?.id]);

  // SUPABASE REALTIME CACHE INVALIDATION FOR TICKETS (ZERO POLLING, INSTANT UI CACHE UPDATE)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin_tickets_realtime_cache")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
          queryClient.refetchQueries({ queryKey: ["support_tickets"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // SUPABASE REALTIME CACHE INVALIDATION FOR MESSAGES (INSTANT WEBSOCKET PUSH)
  useEffect(() => {
    if (!selectedTicket?.id) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`admin_chat_realtime_${selectedTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${selectedTicket.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["support_messages", selectedTicket.id],
          });
          queryClient.refetchQueries({
            queryKey: ["support_messages", selectedTicket.id],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket?.id, queryClient]);

  // Toggle Admin Status
  const handleUpdateAdminStatus = async (
    newStatus: "available" | "busy" | "offline",
  ) => {
    setAlertError(null);
    updateAdminStatusMutation.mutate({ email: adminEmail, status: newStatus });
  };

  // Select ticket and auto-set Agent Status to BUSY if ticket is active
  const handleSelectTicket = async (t: any) => {
    setSelectedTicketId(t.id);
    setAlertError(null);

    if (t.status === "open") {
      updateTicketMutation.mutate({
        ticketId: t.id,
        status: "in_progress",
        assignedAdmin: adminEmail,
      });
      updateAdminStatusMutation.mutate({ email: adminEmail, status: "busy" });
    } else if (t.status === "in_progress") {
      updateAdminStatusMutation.mutate({ email: adminEmail, status: "busy" });
    }
  };

  // Claim Ticket: Auto set status to IN_PROGRESS and Agent Status to BUSY
  const handleClaimTicket = async (ticket: any) => {
    try {
      setAlertError(null);
      await updateTicketMutation.mutateAsync({
        ticketId: ticket.id,
        status: "in_progress",
        assignedAdmin: adminEmail,
      });
      setSelectedTicketId(ticket.id);
      updateAdminStatusMutation.mutate({ email: adminEmail, status: "busy" });
    } catch (err) {
      console.error("Failed to claim ticket:", err);
    }
  };

  // Mark Ticket as Solved (AUTO-RESETS ADMIN STATUS TO AVAILABLE 🟢)
  const handleSolveTicket = async () => {
    if (!selectedTicket?.id) return;

    try {
      setAlertError(null);
      await updateTicketMutation.mutateAsync({
        ticketId: selectedTicket.id,
        status: "solved",
        assignedAdmin: adminEmail,
      });
      updateAdminStatusMutation.mutate({
        email: adminEmail,
        status: "available",
      });
    } catch (err) {
      console.error("Failed to solve ticket:", err);
    }
  };

  // Send Admin Response Message with React Query
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedTicket?.id) return;

    const text = inputMessage;
    setInputMessage("");

    try {
      if (selectedTicket.status === "open") {
        updateTicketMutation.mutate({
          ticketId: selectedTicket.id,
          status: "in_progress",
          assignedAdmin: adminEmail,
        });
      }
      updateAdminStatusMutation.mutate({ email: adminEmail, status: "busy" });

      await sendMessageMutation.mutateAsync({
        ticketId: selectedTicket.id,
        senderType: "admin",
        senderName: adminName,
        message: text,
      });
    } catch (err) {
      console.error("Failed to send admin message:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* HEADER & ADMIN STATUS CONTROLLER */}
      <div className="bg-white p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-900 text-white">
            <Headset className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              Customer Support Workspace
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700">
                Multi-Agent Queue
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Live ticketing, agent dispatch & customer chat interface
            </p>
          </div>
        </div>

        {/* AUTOMATIC READ-ONLY STATUS BADGE */}
        <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 border border-slate-200">
          <span className="text-xs font-mono font-bold text-slate-700 uppercase">
            Agent Status:
          </span>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 text-xs font-mono font-black uppercase border flex items-center gap-1.5 ${
                adminStatus === "available"
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                  : adminStatus === "busy"
                    ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                    : "bg-rose-600 text-white border-rose-700 shadow-sm"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${adminStatus === "available" ? "bg-emerald-200 animate-pulse" : adminStatus === "busy" ? "bg-amber-950 animate-pulse" : "bg-rose-200"}`}
              />
              {adminStatus === "available"
                ? "AVAILABLE"
                : adminStatus === "busy"
                  ? "BUSY"
                  : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* ERROR ALERT BANNER */}
      {alertError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{alertError}</span>
          </div>
          <button
            onClick={() => setAlertError(null)}
            className="text-rose-600 hover:text-rose-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN LAYOUT: QUEUE SIDEBAR + CHAT CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* TICKET QUEUE SIDEBAR (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 flex flex-col shadow-sm">
          {/* QUEUE FILTER TABS */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {(["all", "open", "in_progress", "solved"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                      activeFilter === filter
                        ? "bg-slate-900 text-white font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              {tickets.length} tickets
            </span>
          </div>

          {/* TICKETS LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {tickets.length > 0 ? (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`p-3.5 transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-emerald-50/60 border-l-4 border-emerald-600"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-900">
                        {t.ticket_code}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase border ${
                          t.status === "open"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : t.status === "in_progress"
                              ? "bg-sky-100 text-sky-800 border-sky-300"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {t.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span className="truncate max-w-[140px] font-bold text-slate-700">
                        {t.user_identity}
                      </span>
                      <span>
                        {new Date(t.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-6 h-6 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs font-mono font-bold text-slate-500">
                  No support tickets found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT CONSOLE & WORKSPACE (8 COLS) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 flex flex-col shadow-sm">
          {selectedTicket ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-black text-slate-900 bg-slate-200 px-2 py-0.5">
                      {selectedTicket.ticket_code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedTicket.subject}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                    Customer:{" "}
                    <strong className="text-slate-800">
                      {selectedTicket.user_identity}
                    </strong>
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center space-x-2">
                  {selectedTicket.status === "open" && (
                    <button
                      onClick={() => handleClaimTicket(selectedTicket)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Claim Ticket</span>
                    </button>
                  )}

                  {selectedTicket.status === "in_progress" && (
                    <button
                      onClick={handleSolveTicket}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center space-x-1.5"
                      title="Solve ticket and reset your status to Available 🟢"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Solved & Reset Available</span>
                    </button>
                  )}
                </div>
              </div>

              {/* MESSAGES FEED */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs min-h-[380px]"
              >
                {messages.map((msg) => {
                  const isAdmin = msg.sender_type === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[9px] font-mono text-slate-400 mb-0.5 px-1">
                        {msg.sender_name} ({msg.sender_type})
                      </span>
                      <div
                        className={`max-w-[80%] p-3 border ${
                          isAdmin
                            ? "bg-slate-900 text-white border-slate-800 font-medium"
                            : "bg-white text-slate-900 border-slate-300 shadow-sm font-medium"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder={
                    selectedTicket.status === "open"
                      ? "Claim ticket first to respond..."
                      : selectedTicket.status === "solved"
                        ? "Ticket solved."
                        : "Type response to customer..."
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={selectedTicket.status !== "in_progress"}
                  className="flex-1 bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={
                    sendMessageMutation.isPending ||
                    !inputMessage.trim() ||
                    selectedTicket.status !== "in_progress"
                  }
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase border border-slate-800 hover:bg-black transition-colors disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
              <Headset className="w-12 h-12 text-slate-300 stroke-1" />
              <div className="text-center">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  No Ticket Selected
                </h4>
                <p className="text-xs font-mono text-slate-500">
                  Select a ticket from the left queue to start real-time agent
                  chat.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
