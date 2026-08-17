'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-slate-900 bg-[#f8fafc]">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Shopping Bag</h1>
          <p className="text-xs text-slate-600 mt-1">Review your selections before checkout.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 font-bold underline hover:text-rose-700 uppercase cursor-pointer"
          >
            Clear Bag
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your Bag is Empty"
          description="Looks like you haven't added any products to your shopping bag yet."
          actionText="Explore Hardware Catalog"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Item List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 border border-slate-200 object-cover bg-slate-50 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase line-clamp-1">{item.product.name}</h3>
                    {item.selected_variant && Object.keys(item.selected_variant).length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {Object.entries(item.selected_variant).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </p>
                    )}
                    <span className="text-xs font-mono font-bold text-slate-900 block mt-1">
                      {formatPrice(item.product.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto">
                  <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 border border-slate-300">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold w-4 text-center text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-slate-900 font-mono min-w-[70px] text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className="p-6 bg-white border border-slate-200 space-y-6 h-fit">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Order Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900 font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-mono text-emerald-600 font-bold">
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="font-mono text-slate-900 font-black">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 border border-slate-800 uppercase cursor-pointer transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <div className="p-3 bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-slate-900 flex-shrink-0" />
              <span>Earn +{Math.round(total * 0.1)} VIP Points on this purchase</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
