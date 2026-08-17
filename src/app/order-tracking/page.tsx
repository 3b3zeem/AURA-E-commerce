'use client';

import React, { useState, useEffect } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, Truck, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function OrderTrackingPage() {
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [order, setOrder] = useState<any>(null);
  const [searchTracking, setSearchTracking] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useUserStore();

  useEffect(() => {
    async function loadLatestOrder() {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?userId=${profile.id}`);
        if (res.ok) {
          const orders = await res.json();
          if (Array.isArray(orders) && orders.length > 0) {
            setOrder(orders[0]);
          }
        }
      } catch {}
      setLoading(false);
    }
    loadLatestOrder();
  }, [profile?.id]);

  const sampleOrder = order || {
    tracking_number: 'AURA-TRK-99248102',
    estimated_delivery: new Date(Date.now() + 86400000 * 2).toISOString(),
    shipping_address: {
      fullName: profile?.full_name || 'Customer Name',
      street: '742 Evergreen Terrace',
      city: 'Cairo',
      state: 'EG',
      zipCode: '11511',
      phone: profile?.phone || '+20 100 000 0000',
    },
    order_items: [],
  };

  const steps = [
    { title: 'Order Confirmed', description: 'Payment verified & queued', icon: Clock },
    { title: 'Processing & Quality Check', description: 'Assembly & quality check passed', icon: Package },
    { title: 'Dispatched / In Transit', description: 'Carrier pickup from warehouse', icon: Truck },
    { title: 'Delivered', description: 'Package handed to recipient', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans text-black bg-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black pb-6 gap-4">
        <div>
          <span className="text-xs font-mono text-black font-bold uppercase tracking-wider bg-white px-3 py-1 border border-black inline-block">
            Real-Time Logistics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black uppercase mt-2">
            Live Order Tracking
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Tracking ID: <span className="font-mono text-black font-bold">{sampleOrder.tracking_number}</span>
          </p>
        </div>

        {/* Demo step toggler */}
        <div className="flex items-center space-x-2 bg-white p-1.5 border border-black">
          <span className="text-[10px] text-black font-bold uppercase px-2">Stage:</span>
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`px-3 py-1 text-xs font-bold transition-colors uppercase border ${
                currentStep === idx
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:bg-neutral-100'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Timeline Card */}
      <div className="p-8 bg-white border border-black space-y-8">
        
        {/* Timeline Visual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx <= currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={idx} className="flex flex-col items-center text-center space-y-3 relative z-10">
                <div
                  className={`w-14 h-14 flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-black text-white border-black scale-105'
                      : isDone
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h4 className={`text-xs font-black uppercase ${isDone ? 'text-black' : 'text-neutral-500'}`}>
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-0.5">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status alert */}
        <div className="p-4 bg-white border border-black flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 text-black" />
            <div>
              <p className="font-black text-black uppercase">Estimated Delivery Window</p>
              <p className="text-neutral-600">{formatDate(sampleOrder.estimated_delivery || '')} (Express Dispatch)</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-black text-white font-mono font-bold uppercase border border-black">
            ON SCHEDULE
          </span>
        </div>
      </div>

      {/* Order Items & Address breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Package Contents */}
        <div className="md:col-span-2 p-6 bg-white border border-black space-y-4">
          <h3 className="text-sm font-black text-black uppercase tracking-wider">Package Contents</h3>
          <div className="space-y-3">
            {sampleOrder.order_items?.map((item: any) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-black flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product_image || ''}
                    alt={item.product_name}
                    className="w-12 h-12 border border-black object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-black uppercase">{item.product_name}</h4>
                    <span className="text-[10px] text-neutral-600 font-mono">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-black">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="p-6 bg-white border border-black space-y-4">
          <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-black" /> Destination
          </h3>

          <div className="text-xs text-neutral-700 space-y-1">
            <p className="font-bold text-black uppercase">{sampleOrder.shipping_address?.fullName}</p>
            <p>{sampleOrder.shipping_address?.street}</p>
            <p>{sampleOrder.shipping_address?.city}, {sampleOrder.shipping_address?.state} {sampleOrder.shipping_address?.zipCode}</p>
            <p className="text-neutral-500 pt-2 font-mono">{sampleOrder.shipping_address?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
