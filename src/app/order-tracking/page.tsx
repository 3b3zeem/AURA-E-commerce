'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  AlertCircle,
  Banknote,
  ArrowLeft,
  Loader2,
  PhoneCall,
  ShieldCheck,
  Calendar,
  ChevronRight,
  ListOrdered,
  Edit3,
  X,
  Trash2
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useUserOrders } from '@/hooks/useStoreData';
import { updateUserOrderInDb } from '@/lib/services/ordersService';
import toast from 'react-hot-toast';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || searchParams.get('orderId') || '';

  const [searchQuery, setSearchQuery] = useState(queryId);
  const { profile } = useUserStore();
  const { data: fetchedOrders = [], isLoading: loading } = useUserOrders(profile?.id);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Address edit modal state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState({
    street: '',
    city: '',
    phone: '',
  });

  useEffect(() => {
    if (fetchedOrders.length > 0) {
      setUserOrders(fetchedOrders);
      if (queryId) {
        const cleanTarget = queryId.trim().toLowerCase();
        const found = fetchedOrders.find((o: any) => {
          const idStr = String(o.id || '').toLowerCase();
          const formatted = idStr.length > 8 ? `ord-${idStr.slice(0, 6)}` : idStr;
          const phone = String(o.shipping_address?.phone || '').toLowerCase();
          return idStr.includes(cleanTarget) || formatted.includes(cleanTarget) || phone.includes(cleanTarget);
        });
        if (found) setActiveOrder(found);
        else setActiveOrder(fetchedOrders[0]);
      } else {
        setActiveOrder(fetchedOrders[0]);
      }
    }
  }, [fetchedOrders, queryId]);

  const executeCancelOrder = async () => {
    if (!activeOrder) return;

    setUpdating(true);
    try {
      const ok = await updateUserOrderInDb(activeOrder.id, { status: 'cancelled' });

      if (ok) {
        toast.success('Order has been cancelled successfully.');
        setActiveOrder({ ...activeOrder, status: 'cancelled' });
        setUserOrders(
          userOrders.map((o) =>
            o.id === activeOrder.id ? { ...o, status: 'cancelled' } : o
          )
        );
        setShowCancelConfirm(false);
      } else {
        toast.error('Failed to cancel order.');
      }
    } catch {
      toast.error('Could not process cancellation.');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenEditAddress = () => {
    if (!activeOrder?.shipping_address) return;
    const addr = activeOrder.shipping_address;
    setEditAddressForm({
      street: addr.street || addr.street_address || '',
      city: addr.city || 'Cairo',
      phone: addr.phone || addr.phone_number || '',
    });
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setUpdating(true);
    try {
      const updatedAddress = {
        ...activeOrder.shipping_address,
        street: editAddressForm.street,
        street_address: editAddressForm.street,
        city: editAddressForm.city,
        phone: editAddressForm.phone,
        phone_number: editAddressForm.phone,
      };

      const ok = await updateUserOrderInDb(activeOrder.id, { shipping_address: updatedAddress });

      if (ok) {
        toast.success('Shipping address updated successfully!');
        setActiveOrder({ ...activeOrder, shipping_address: updatedAddress });
        setUserOrders(userOrders.map(o => o.id === activeOrder.id ? { ...o, shipping_address: updatedAddress } : o));
        setIsEditingAddress(false);
      } else {
        toast.error('Failed to update shipping address.');
      }
    } catch {
      toast.error('Error saving address changes.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectOrder = (ord: any) => {
    setActiveOrder(ord);
    const shortId = ord.id ? (ord.id.length > 8 ? `ORD-${ord.id.slice(0, 6).toUpperCase()}` : ord.id) : '';
    setSearchQuery(shortId);
    setErrorMsg('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const cleanTarget = searchQuery.trim().toLowerCase();
    const found = userOrders.find((o: any) => {
      const idStr = String(o.id || '').toLowerCase();
      const formatted = idStr.length > 8 ? `ord-${idStr.slice(0, 6)}` : idStr;
      const phone = String(o.shipping_address?.phone || '').toLowerCase();
      return idStr.includes(cleanTarget) || formatted.includes(cleanTarget) || phone.includes(cleanTarget);
    });

    if (found) {
      setActiveOrder(found);
      setErrorMsg('');
    } else {
      setErrorMsg(`No order found matching "${searchQuery}".`);
    }
  };

  // Map order status string to step index (0-3)
  const getStepIndex = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      case 'pending':
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Order Confirmed', description: 'Order received & queued for packing', icon: Clock },
    { title: 'Processing & Quality Check', description: 'Inspected, packed & prepared for dispatch', icon: Package },
    { title: 'Out for Delivery / In Transit', description: 'Package picked up by courier service', icon: Truck },
    { title: 'Delivered', description: 'Handed over to recipient successfully', icon: CheckCircle2 },
  ];

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const displayId = activeOrder?.id ? (activeOrder.id.length > 8 ? `ORD-${activeOrder.id.slice(0, 6).toUpperCase()}` : activeOrder.id) : '';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans text-slate-900 bg-white">
      
      {/* Header & Search */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <Link href="/" className="inline-flex items-center text-xs font-bold uppercase text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Return to Store
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-900 px-2.5 py-1 border border-slate-200 inline-block mb-2">
              AURA Logistics & Real-Time Tracking
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">
              Your Orders & Live Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select an order from your history below or search by Order ID / Phone number.
            </p>
          </div>
        </div>
      </div>

      {/* ORDERS LIST SELECTOR (All Registered Orders) */}
      {userOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-slate-900" />
              Select Order to Track ({userOrders.length})
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              Click any order to view live progress
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userOrders.map((ord) => {
              const shortId = ord.id ? (ord.id.length > 8 ? `ORD-${ord.id.slice(0, 6).toUpperCase()}` : ord.id) : '';
              const isSelected = activeOrder?.id === ord.id;
              const itemsCount = ord.order_items?.length || 0;

              return (
                <div
                  key={ord.id}
                  onClick={() => handleSelectOrder(ord)}
                  className={`p-4 border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900 shadow-md'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-black text-xs ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                        #{shortId}
                      </span>
                      <span
                        className={`px-2 py-0.5 font-bold text-[9px] uppercase border ${
                          isSelected
                            ? 'bg-white/20 text-white border-white/30'
                            : ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : ord.status === 'shipped'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {ord.status || 'pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                        {formatDate(ord.created_at || new Date().toISOString())}
                      </span>
                      <span className="font-mono font-bold">
                        {formatPrice(ord.total_amount || 0)}
                      </span>
                    </div>
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-bold uppercase ${
                    isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                  }`}>
                    <span>{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}</span>
                    <span className="flex items-center gap-0.5 text-xs">
                      {isSelected ? 'Currently Tracking' : 'Track Package'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500 uppercase font-bold">Loading Your Orders...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && errorMsg && (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          <div>
            <p className="font-bold uppercase">Order Not Found</p>
            <p className="text-rose-700 font-mono mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Empty State: No Orders in Database */}
      {!loading && userOrders.length === 0 && !errorMsg && (
        <div className="py-16 text-center space-y-4 border border-dashed border-slate-300 p-8 bg-slate-50">
          <Package className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase text-slate-900">No Orders Registered Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You don&apos;t have any orders saved in your account. Place an order to track delivery.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block py-2.5 px-5 bg-slate-900 text-white text-xs font-bold uppercase border border-slate-800 hover:bg-black transition-colors"
          >
            Explore Products
          </Link>
        </div>
      )}

      {/* ACTIVE ORDER LIVE TRACKING STEPPER & DETAILS */}
      {!loading && activeOrder && (
        <div className="space-y-8 pt-4">
          
          {/* Order Header Summary */}
          <div className="p-6 bg-slate-900 text-white space-y-4 flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase bg-amber-400 text-slate-900 px-2.5 py-0.5">
                  Live Tracking
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {formatDate(activeOrder.created_at || new Date().toISOString())}
                </span>
              </div>
              <h2 className="text-xl font-black font-mono tracking-wide uppercase">
                {displayId}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-mono uppercase">Total Amount Due</p>
                <p className="text-lg font-black font-mono text-white">
                  {formatPrice(activeOrder.total_amount || 0)}
                </p>
              </div>
              <div className="p-2.5 bg-white/10 border border-white/20">
                <Banknote className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Cancelled Banner */}
          {activeOrder.status === 'cancelled' && (
            <div className="p-4 bg-rose-600 text-white text-xs font-bold uppercase flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>This order has been cancelled. Please contact customer support for details.</span>
            </div>
          )}

          {/* Stepper Progress Card */}
          {activeOrder.status !== 'cancelled' && (
            <div className="p-8 bg-white border border-slate-200 space-y-8">
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center justify-between">
                <span>Live Delivery Progress</span>
                <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                  STATUS: {activeOrder.status?.toUpperCase() || 'PENDING'}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center space-y-3 relative z-10">
                      <div
                        className={`w-14 h-14 flex items-center justify-center border transition-all ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-lg ring-4 ring-slate-100'
                            : isDone
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h4 className={`text-xs font-black uppercase ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-slate-900" />
                  <div>
                    <p className="font-black text-slate-900 uppercase">Estimated Delivery Window</p>
                    <p className="text-slate-600 font-mono text-[11px]">
                      {activeOrder.estimated_delivery || 'Within 2-3 Business Days'} (Cash on Delivery)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid: Items & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Items Card */}
            <div className="md:col-span-2 p-6 bg-white border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-3">
                <span>Order Items ({activeOrder.order_items?.length || 0})</span>
                <span className="text-[10px] font-mono text-slate-500">Cash on Delivery</span>
              </h3>

              <div className="space-y-3">
                {activeOrder.order_items && activeOrder.order_items.length > 0 ? (
                  activeOrder.order_items.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        {item.product_image || item.image_url ? (
                          <img
                            src={item.product_image || item.image_url}
                            alt={item.product_name || item.name || "Product"}
                            className="w-12 h-12 border border-slate-300 object-cover bg-white"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 border border-slate-300 flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase">
                            {item.product_name || item.name || item.title || "AURA Product"}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">Qty: {item.quantity || 1}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatPrice(
                          (item.price || item.unit_price || (activeOrder.total_amount || 0)) * (item.quantity || 1)
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-mono">No items detail available for this order.</p>
                )}
              </div>
            </div>

            {/* Address & Courier Details */}
            <div className="p-6 bg-white border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-900" /> Shipping Destination
                  </h3>
                  {activeOrder.status !== 'cancelled' && activeOrder.status !== 'delivered' && activeOrder.status !== 'shipped' && (
                    <button
                      onClick={handleOpenEditAddress}
                      className="text-[10px] text-slate-700 hover:text-slate-950 font-bold uppercase flex items-center gap-1 underline cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                {activeOrder.shipping_address ? (
                  <div className="text-xs text-slate-700 space-y-1.5 font-sans">
                    <p className="font-black text-slate-900 uppercase text-sm">
                      {activeOrder.shipping_address.fullName || activeOrder.shipping_address.full_name}
                    </p>
                    <p className="text-slate-600">
                      {activeOrder.shipping_address.street || activeOrder.shipping_address.street_address}
                    </p>
                    <p className="text-slate-600">
                      {activeOrder.shipping_address.city}, {activeOrder.shipping_address.state || activeOrder.shipping_address.state_region}
                    </p>
                    <div className="pt-2 flex items-center space-x-1 text-slate-900 font-mono text-[11px]">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activeOrder.shipping_address.phone || activeOrder.shipping_address.phone_number}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-mono">Address information unavailable.</p>
                )}
              </div>

              {/* Order Actions (Cancel Order) */}
              <div className="space-y-3 pt-2">
                {activeOrder.status !== 'cancelled' && activeOrder.status !== 'delivered' && (
                  showCancelConfirm ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 space-y-2.5 text-xs font-sans">
                      <p className="font-bold text-rose-900 uppercase text-[11px] tracking-tight">
                        Are you sure you want to cancel this order?
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={executeCancelOrder}
                          disabled={updating}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] uppercase tracking-wider border border-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {updating ? 'Processing...' : 'Yes, Cancel Order'}
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] uppercase tracking-wider border border-slate-300 transition-colors cursor-pointer"
                        >
                          Keep Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={updating}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase tracking-wider border border-rose-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cancel Order</span>
                    </button>
                  )
                )}

                <div className="p-3 bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1 text-slate-900 font-bold uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>AURA Delivery Guarantee</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Inspect your package upon delivery before paying Cash on Delivery.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Edit Address Modal Overlay */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 w-full max-w-md p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-slate-900" /> Modify Delivery Details
              </h3>
              <button
                onClick={() => setIsEditingAddress(false)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editAddressForm.phone}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 font-mono text-slate-900 focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={editAddressForm.city}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, city: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Street Address</label>
                <textarea
                  required
                  rows={3}
                  value={editAddressForm.street}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, street: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase border border-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto" />
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
