'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const subtotal = getSubtotal();
  const freeShippingThreshold = 200;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-5000 overflow-hidden font-sans">
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/60"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: 'linear', duration: 0.2 }}
              className="w-screen max-w-sm sm:max-w-md bg-white border-l border-slate-300 text-slate-900 flex flex-col"
            >
              {/* Drawer Top Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-slate-900" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Shopping Bag</h2>
                    <span className="text-xs px-2 py-0.5 bg-slate-900 text-white font-bold border border-slate-800">
                      {items.length}
                    </span>
                  </div>
                  <button
                    onClick={closeCart}
                    className="p-1 border border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Subtotal & Go to Basket button */}
                <div className="text-center pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-xs uppercase font-bold">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-base font-black font-mono text-slate-900">{formatPrice(subtotal)}</span>
                  </div>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-900 hover:text-white text-slate-900 font-black text-xs uppercase tracking-wider border border-slate-300 hover:border-slate-900 inline-block transition-colors cursor-pointer text-center"
                  >
                    Go to basket
                  </Link>
                </div>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-bold mb-1 uppercase">
                  <span className="text-slate-700">
                    {subtotal >= freeShippingThreshold
                      ? '✓ Free Shipping Unlocked'
                      : `Add ${formatPrice(freeShippingThreshold - subtotal)} for Free Shipping`}
                  </span>
                  <span className="text-slate-900 font-mono">{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 border border-slate-300 overflow-hidden">
                  <div
                    className="h-full bg-slate-900 transition-all duration-300"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {items.length === 0 ? (
                  <EmptyState
                    icon={ShoppingBag}
                    title="Your Bag is Empty"
                    description="No items have been added to your shopping bag."
                    actionText="Start Shopping"
                    onAction={closeCart}
                  />
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-slate-200 flex flex-col items-center text-center space-y-3 relative"
                    >
                      {/* Product Image */}
                      <div className="w-36 h-36 border border-slate-200 p-2 bg-slate-50 flex items-center justify-center">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Title & Badge */}
                      <div className="space-y-1 w-full">
                        {item.product.is_flash_deal && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-300 mb-1">
                            <Zap className="w-3 h-3 text-amber-600 fill-current" />
                            <span>Limited time</span>
                          </span>
                        )}
                        <h3 className="text-xs font-black uppercase text-slate-900 line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm font-black font-mono text-slate-900">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      {/* Quantity Control Bar */}
                      <div className="w-full max-w-[180px] flex items-center justify-between border border-slate-300 px-3 py-1 bg-slate-50">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              removeItem(item.id);
                            } else {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className="text-slate-500 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <span className="text-xs font-black font-mono text-slate-900">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-900 transition-colors p-1 cursor-pointer"
                          title="Add item"
                        >
                          <Plus className="w-4 h-4 font-black" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors border border-slate-800 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
