'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Headset, Loader2, User, CheckCircle2, RefreshCw, MessageSquare, Trash2 } from 'lucide-react';
import { AIChatMessage } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useUserStore } from '@/store/useUserStore';
import { formatPrice } from '@/lib/utils';
import { playAdminSound } from '@/lib/utils/sound';

import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  useSupportTickets,
  useSupportMessages,
  useCreateTicketMutation,
  useSendMessageMutation,
  useDeleteTicketMutation,
} from '@/hooks/useSupport';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'ai' | 'support'>('ai');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addItem } = useCartStore();
  const { profile } = useUserStore();

  const queryClient = useQueryClient();

  // AI Chat State
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Welcome to AURA Support! Need product advice or specs? How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // State for user ticket selection
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showTicketSelector, setShowTicketSelector] = useState<boolean>(false);

  // Derive User Identity
  const userIdentity = profile?.email || (typeof window !== 'undefined' ? localStorage.getItem('aura_visitor_id') || 'Guest Customer' : 'Guest Customer');

  // React Query Hooks
  const queryParams = useMemo(() => ({ userIdentity }), [userIdentity]);
  const { data: userTickets = [] } = useSupportTickets(queryParams, { enabled: isOpen });

  // Active ticket selection logic: preferred selectedTicketId -> open/in_progress ticket -> latest ticket -> null
  const activeTicket = useMemo(() => {
    if (selectedTicketId) {
      const found = userTickets.find((t) => t.id === selectedTicketId);
      if (found) return found;
    }
    const activeNonSolved = userTickets.find((t) => t.status !== 'solved');
    return activeNonSolved || userTickets[0] || null;
  }, [userTickets, selectedTicketId]);

  const { data: supportMessages = [] } = useSupportMessages(activeTicket?.id || '');

  const createTicketMutation = useCreateTicketMutation();
  const sendMessageMutation = useSendMessageMutation();
  const deleteTicketMutation = useDeleteTicketMutation();

  // Clear AI Chat
  const handleClearAIChat = () => {
    setMessages([
      {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: 'Welcome to AURA Support! Need product advice or specs? How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Delete Active Support Ticket
  const handleDeleteActiveTicket = async () => {
    if (!activeTicket?.id) return;
    try {
      setLoading(true);
      await deleteTicketMutation.mutateAsync(activeTicket.id);
      setSelectedTicketId(null);
      setShowTicketSelector(false);
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userChatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef<boolean>(false);

  const handleUserScroll = () => {
    if (!userChatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = userChatContainerRef.current;
    isUserScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 100;
  };

  useEffect(() => {
    if (!isUserScrolledUpRef.current && userChatContainerRef.current) {
      userChatContainerRef.current.scrollTop = userChatContainerRef.current.scrollHeight;
    }
  }, [messages, supportMessages, loading, mode]);

  // Reset unread count when opening modal or switching to support mode
  useEffect(() => {
    if (isOpen && mode === 'support') {
      setUnreadCount(0);
      isUserScrolledUpRef.current = false;
    }
  }, [isOpen, mode]);

  // SUPABASE REALTIME CACHE INVALIDATION FOR USER CHAT & TICKETS
  useEffect(() => {
    const supabase = createClient();

    // 1. Subscribe to Ticket updates
    const ticketChannel = supabase
      .channel(`user_ticket_cache_${userIdentity}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
          queryClient.refetchQueries({ queryKey: ['support_tickets'] });
        }
      )
      .subscribe();

    // 2. Subscribe to Messages updates (instant push <50ms)
    const messagesChannel = supabase
      .channel(`user_messages_cache_${userIdentity}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          const newMsg = payload.new;
          if (activeTicket?.id && newMsg.ticket_id === activeTicket.id) {
            queryClient.invalidateQueries({ queryKey: ['support_messages', activeTicket.id] });
            queryClient.refetchQueries({ queryKey: ['support_messages', activeTicket.id] });

            if (newMsg.sender_type === 'admin') {
              if (!isOpen || mode !== 'support') {
                setUnreadCount((prev) => prev + 1);
                try { playAdminSound('cart'); } catch {}
              }
            }
          } else {
            queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
            queryClient.refetchQueries({ queryKey: ['support_tickets'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [userIdentity, activeTicket?.id, isOpen, mode, queryClient]);

  // Create a new support ticket explicitly
  const handleCreateNewTicket = async () => {
    try {
      setLoading(true);
      const newTicket = await createTicketMutation.mutateAsync({
        userIdentity,
        userEmail: profile?.email || undefined,
        subject: 'Live Agent Support Request',
        initialMessage: 'Customer requested live customer service agent.',
      });
      if (newTicket?.id) {
        setSelectedTicketId(newTicket.id);
      }
      setShowTicketSelector(false);
    } catch (err) {
      console.error('Failed to create new ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Support Ticket or Switch to Support Mode
  const handleStartLiveSupport = async () => {
    setMode('support');
    setUnreadCount(0);

    // If an active open/in_progress ticket exists, keep it
    if (activeTicket && activeTicket.status !== 'solved') {
      return;
    }

    // If no active ticket exists, create a new one
    await handleCreateNewTicket();
  };

  // Send AI Message
  const handleSendAIMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      const assistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I'm happy to help! Let me know if you need more details.",
        recommendedProducts: data.recommendedProducts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send Live Support Message
  const handleSendSupportMessage = async () => {
    if (!inputMessage.trim() || !activeTicket?.id) return;

    const text = inputMessage;
    setInputMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        ticketId: activeTicket.id,
        senderType: 'user',
        senderName: profile?.full_name || profile?.email || 'Customer',
        message: text,
      });
    } catch (err) {
      console.error('Failed to send support message:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans">
      
      {/* FLOATING TOGGLE BUTTON WITH REAL-TIME UNREAD NOTIFICATION BADGE */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 text-white border border-slate-800 font-black hover:bg-black transition-all shadow-2xl rounded-full cursor-pointer group hover:scale-105"
          title="AURA Support & Live Agent"
        >
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-12 transition-transform" />

          {/* REAL-TIME USER NOTIFICATION BADGE */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-emerald-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[80vh] max-h-[520px] bg-white border border-slate-300 text-slate-900 flex flex-col shadow-2xl rounded-lg overflow-hidden"
          >
            {/* Widget Header */}
            <div className="px-4 py-3 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 bg-white/10 text-white flex items-center justify-center font-bold border border-white/20">
                  {mode === 'ai' ? <Bot className="w-4 h-4 text-emerald-400" /> : <Headset className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    {mode === 'ai' ? 'AURA AI Assistant' : 'Customer Service Agent'}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-300 block">
                    {mode === 'ai'
                      ? 'Automated Specs & Support'
                      : activeTicket?.status === 'in_progress'
                      ? `Connected to ${activeTicket.assigned_admin_name || 'Support Representative'}`
                      : 'Waiting for Available Representative...'}
                  </span>
                </div>
              </div>

              {/* Mode switch & Close */}
              <div className="flex items-center space-x-1">
                {mode === 'support' ? (
                  <button
                    onClick={() => setMode('ai')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer border border-slate-700"
                    title="Switch to AI Assistant"
                  >
                    AI Mode
                  </button>
                ) : (
                  <button
                    onClick={handleStartLiveSupport}
                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-mono font-black uppercase transition-colors cursor-pointer relative"
                    title="Connect to Live Customer Service Agent"
                  >
                    Live Support
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI CHAT BODY */}
            {mode === 'ai' ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 border ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 text-white border-slate-800 font-semibold'
                            : 'bg-white text-slate-900 border-slate-200 shadow-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Recommended Products */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="mt-3 w-full space-y-2">
                          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                            Recommended Products:
                          </span>
                          <div className="space-y-2">
                            {msg.recommendedProducts.map((prod) => (
                              <div
                                key={prod.id}
                                className="p-2 bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-sm"
                              >
                                <div className="flex items-center space-x-2 overflow-hidden">
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.name}
                                    className="w-10 h-10 object-cover flex-shrink-0 border border-slate-200"
                                  />
                                  <div className="truncate">
                                    <h4 className="text-[11px] font-bold text-slate-900 uppercase truncate">
                                      {prod.name}
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-500">
                                      {formatPrice(prod.price)}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => addItem(prod)}
                                  className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase border border-slate-800 hover:bg-black transition-colors cursor-pointer"
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts & Actions */}
                <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleStartLiveSupport}
                      className="text-[10px] font-mono font-black px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Headset className="w-3 h-3" />
                      Human Support Agent
                    </button>
                    <button
                      onClick={() => handleSendAIMessage('Best ANC Headphones?')}
                      className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 whitespace-nowrap"
                    >
                      Headphones
                    </button>
                  </div>

                  <button
                    onClick={handleClearAIChat}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                    title="Clear AI Chat History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* AI Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAIMessage();
                  }}
                  className="p-3 bg-white border-t border-slate-300 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Ask AURA Support..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="p-2 bg-slate-900 text-white border border-slate-800 hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              </>
            ) : (
              /* LIVE CUSTOMER SERVICE MODE WITH REAL-TIME WAITING STATE & STREAM */
              <>
                {/* TICKET BAR: ACTIVE TICKET SELECTOR & NEW TICKET BUTTON */}
                <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Ticket:</span>
                    {activeTicket ? (
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-[11px] font-mono font-bold text-amber-400 truncate">
                          {activeTicket.ticket_code}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 uppercase border ${
                          activeTicket.status === 'in_progress'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : activeTicket.status === 'solved'
                            ? 'bg-slate-700 text-slate-300 border-slate-600'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {activeTicket.status.replace('_', ' ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No Active Ticket</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {userTickets.length > 1 && (
                      <button
                        onClick={() => setShowTicketSelector(!showTicketSelector)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-bold uppercase transition-colors border border-slate-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Tickets ({userTickets.length})</span>
                      </button>
                    )}

                    <button
                      onClick={handleCreateNewTicket}
                      disabled={loading}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase transition-colors border border-emerald-500 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    >
                      <span>+ New Ticket</span>
                    </button>

                    {activeTicket && (
                      <button
                        onClick={handleDeleteActiveTicket}
                        disabled={loading || deleteTicketMutation.isPending}
                        className="p-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[10px] border border-rose-800/80 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete current ticket chat"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* DROPDOWN / SELECTOR POPUP IF USER HAS MULTIPLE TICKETS */}
                {showTicketSelector && (
                  <div className="p-3 bg-slate-800 border-b border-slate-700 space-y-2 shrink-0 max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
                      <span>Your Support Tickets</span>
                      <button
                        onClick={() => setShowTicketSelector(false)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {userTickets.map((t) => {
                        const isSelected = activeTicket?.id === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedTicketId(t.id);
                              setShowTicketSelector(false);
                            }}
                            className={`p-2 border transition-colors cursor-pointer flex items-center justify-between text-xs ${
                              isSelected
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-white font-bold'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="font-mono text-amber-400 shrink-0">{t.ticket_code}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                                {t.subject}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <span
                                className={`text-[9px] font-mono font-bold px-1 py-0.2 uppercase border ${
                                  t.status === 'in_progress'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : t.status === 'solved'
                                    ? 'bg-slate-700 text-slate-300 border-slate-600'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                }`}
                              >
                                {t.status.replace('_', ' ')}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTicketMutation.mutate(t.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  ref={userChatContainerRef}
                  onScroll={handleUserScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50"
                >
                  {/* TICKET CREATION / WAITING AGENT BANNER */}
                  {activeTicket?.status === 'open' && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                        <span className="font-mono font-bold text-xs uppercase tracking-wider">
                          Searching for Available Representative...
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Ticket <span className="font-mono font-bold">{activeTicket.ticket_code}</span> generated. Please wait while a customer service agent joins your chat.
                      </p>
                    </div>
                  )}

                  {activeTicket?.status === 'in_progress' && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-bold">
                        Representative {activeTicket.assigned_admin_name || 'Agent'} is live on this chat.
                      </span>
                    </div>
                  )}

                  {activeTicket?.status === 'solved' && (
                    <div className="p-3 bg-slate-100 border border-slate-300 text-slate-800 text-center space-y-1">
                      <span className="font-bold block">Ticket Marked Solved</span>
                      <p className="text-[11px] text-slate-600">Your issue was resolved by representative.</p>
                    </div>
                  )}

                  {/* MESSAGES FEED */}
                  {supportMessages.map((msg) => {
                    const isUser = msg.sender_type === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[9px] font-mono text-slate-400 mb-0.5 px-1">
                          {msg.sender_name}
                        </span>
                        <div
                          className={`max-w-[85%] p-3 border ${
                            isUser
                              ? 'bg-slate-900 text-white border-slate-800 font-medium'
                              : 'bg-emerald-600 text-white border-emerald-700 font-medium shadow-sm'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* SUPPORT INPUT BAR */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendSupportMessage();
                  }}
                  className="p-3 bg-white border-t border-slate-300 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder={
                      activeTicket?.status === 'open'
                        ? 'Waiting for agent to join...'
                        : 'Type message to support agent...'
                    }
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={activeTicket?.status === 'solved'}
                    className="flex-1 bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim() || activeTicket?.status === 'solved'}
                    className="p-2 bg-slate-900 text-white border border-slate-800 hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
