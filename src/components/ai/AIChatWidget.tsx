'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, ShoppingBag } from 'lucide-react';
import { AIChatMessage } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addItem } = useCartStore();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "👋 Welcome to AURA! Need product advice or tech specifications? How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
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

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-slate-900 text-white border border-slate-800 font-black hover:bg-black transition-colors shadow-none cursor-pointer"
        >
          <Bot className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-[90vw] sm:w-96 h-[540px] bg-white border border-slate-300 text-slate-900 flex flex-col"
          >
            {/* Widget Header */}
            <div className="px-5 py-4 bg-slate-100 text-slate-900 border-b border-slate-300 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-bold border border-slate-800">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    AURA Support
                  </h3>
                  <span className="text-[10px] text-slate-900 block">
                    ● AI Product Specialist
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 border border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
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
                        : 'bg-white text-slate-900 border-slate-200'
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
                            className="p-2 bg-white border border-slate-200 flex items-center justify-between gap-2"
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

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-slate-100 border-t border-slate-300 flex items-center space-x-2 overflow-x-auto">
              <button
                onClick={() => handleSendMessage('Best ANC Headphones?')}
                className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-900 whitespace-nowrap transition-colors cursor-pointer"
              >
                Headphones
              </button>
              <button
                onClick={() => handleSendMessage('Recommend gaming keyboard')}
                className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-900 whitespace-nowrap transition-colors cursor-pointer"
              >
                Keyboards
              </button>
              <button
                onClick={() => handleSendMessage('Gaming monitors 165Hz')}
                className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-900 whitespace-nowrap transition-colors cursor-pointer"
              >
                Monitors
              </button>
              <button
                onClick={() => handleSendMessage('أرخص سماعة gaming')}
                className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-900 whitespace-nowrap transition-colors cursor-pointer"
              >
                أرخص سماعة
              </button>
              <button
                onClick={() => handleSendMessage('Best Skincare Routine & Serums')}
                className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-900 whitespace-nowrap transition-colors cursor-pointer"
              >
                Skincare
              </button>
              <button
                onClick={() => handleSendMessage('Men Grooming & Beard Trimmers')}
                className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-900 whitespace-nowrap transition-colors cursor-pointer"
              >
                Grooming
              </button>
              <button
                onClick={() => handleSendMessage('What are the Flash Deals today?')}
                className="text-[10px] font-bold px-2.5 py-1 bg-amber-200 border border-amber-400 text-amber-900 hover:bg-amber-300 whitespace-nowrap transition-colors cursor-pointer"
              >
                Flash Deals
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
