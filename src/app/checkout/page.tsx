'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useUserStore } from '@/store/useUserStore';
import { formatPrice } from '@/lib/utils';
import { ShieldCheck, Truck, CreditCard, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { profile, loyaltyPoints, addLoyaltyPoints } = useUserStore();

  const [usePoints, setUsePoints] = useState(false);
  const [shippingData, setShippingData] = useState({
    fullName: profile?.full_name || 'Alex Vance',
    street: '742 Evergreen Terrace',
    city: 'Cairo',
    state: 'Cairo',
    zipCode: '11511',
    country: 'Egypt',
    phone: '+20 100 000 0000',
  });

  const subtotal = getSubtotal();
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 15;
  const pointsDiscount = usePoints ? Math.min(subtotal, (loyaltyPoints / 10)) : 0; // 10 points = $1
  const finalTotal = Math.max(0, subtotal + shipping - pointsDiscount);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Award 10% loyalty points on purchase amount
      const earned = Math.round(finalTotal * 0.1);
      addLoyaltyPoints(earned);

      clearCart();
      setIsSubmitting(false);
      setOrderComplete(true);
    }, 1200);
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 font-sans text-black bg-white">
        <div className="w-16 h-16 bg-black text-white border border-black flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-black uppercase tracking-widest font-bold">
            Order Confirmed!
          </span>
          <h1 className="text-2xl font-black text-black uppercase">Thank You For Your Order</h1>
          <p className="text-xs text-neutral-600">
            Order ID: <span className="font-mono text-black font-bold">ORD-849204</span>
          </p>
        </div>

        <div className="p-6 bg-white border border-black text-xs text-black space-y-3 text-left">
          <div className="flex justify-between border-b border-black pb-2">
            <span className="text-neutral-600">Total Paid:</span>
            <span className="font-mono font-bold text-black">{formatPrice(finalTotal)}</span>
          </div>
          <div className="flex justify-between border-b border-black pb-2">
            <span className="text-neutral-600">VIP Points Earned:</span>
            <span className="font-mono font-bold text-black">+{Math.round(finalTotal * 0.1)} Points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Estimated Delivery:</span>
            <span className="font-mono font-bold text-black">Within 2-3 Days</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={() => router.push('/order-tracking')}
            className="flex-1 py-3 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 border border-black uppercase cursor-pointer"
          >
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => router.push('/products')}
            className="py-3 px-6 bg-white border border-black text-black text-xs font-bold hover:bg-neutral-100 uppercase cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-black bg-white">
      <div className="border-b border-black pb-6">
        <h1 className="text-2xl font-black text-black uppercase">Express Checkout</h1>
        <p className="text-xs text-neutral-600 mt-1">Provide your shipping details to complete your order.</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white border border-black space-y-4">
            <h3 className="text-sm font-black text-black uppercase flex items-center gap-2">
              <Truck className="w-4 h-4 text-black" /> Shipping Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-black block mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingData.fullName}
                  onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                  className="w-full bg-white border border-black p-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black block mb-1 uppercase">Phone Number</label>
                <input
                  type="text"
                  required
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  className="w-full bg-white border border-black p-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-black block mb-1 uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingData.street}
                  onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                  className="w-full bg-white border border-black p-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black block mb-1 uppercase">City</label>
                <input
                  type="text"
                  required
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  className="w-full bg-white border border-black p-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black block mb-1 uppercase">Zip / Postal Code</label>
                <input
                  type="text"
                  required
                  value={shippingData.zipCode}
                  onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                  className="w-full bg-white border border-black p-2.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-black space-y-4">
            <h3 className="text-sm font-black text-black uppercase flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-black" /> Payment Method
            </h3>
            <div className="p-4 bg-white border border-black flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black uppercase">Standard Order Checkout</h4>
                  <p className="text-[10px] text-neutral-600">Cash on Delivery / Card processing.</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-black uppercase">Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Loyalty */}
        <div className="p-6 bg-white border border-black space-y-6 h-fit">
          <h3 className="text-sm font-black text-black uppercase tracking-wider">Checkout Summary</h3>

          {/* Loyalty Points Redemption */}
          {loyaltyPoints > 0 && (
            <div className="p-4 bg-white border border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-black" /> VIP Points
                </span>
                <span className="text-xs font-mono text-black font-bold">{loyaltyPoints} pts</span>
              </div>
              <label className="flex items-center space-x-2 text-xs text-black cursor-pointer pt-1 uppercase font-semibold">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="accent-black w-4 h-4 cursor-pointer"
                />
                <span>Redeem points for discount (${(loyaltyPoints / 10).toFixed(2)})</span>
              </label>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-mono text-black font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Shipping</span>
              <span className="font-mono text-black font-bold">
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
            {usePoints && (
              <div className="flex justify-between text-black font-bold">
                <span>VIP Points Discount</span>
                <span className="font-mono">-{formatPrice(pointsDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-black pt-3 border-t border-black">
              <span>Total Payment</span>
              <span className="font-mono text-black font-black">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center space-x-2 border border-black uppercase cursor-pointer transition-colors disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Processing Order...' : 'Confirm & Place Order'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
