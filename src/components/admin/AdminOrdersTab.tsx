"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Loader2,
  Eye,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  PackageCheck,
  CreditCard,
  Calendar,
  Sparkles,
  Tag,
  Building,
  CheckCircle2,
  Truck,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/CustomSelect";

import toast from "react-hot-toast";

interface AdminOrdersTabProps {
  ordersList: any[];
  actionLoadingId: string | null;
  onOrderStatusChange: (id: string, status: string) => void;
  onDeleteOrder: (id: string) => void;
}

export function AdminOrdersTab({
  ordersList,
  actionLoadingId,
  onOrderStatusChange,
  onDeleteOrder,
}: AdminOrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedOrders = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/admin/seed-orders", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      } else {
        toast.error("Failed to seed demo delivery orders.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-300";
      default:
        return "bg-amber-50 text-amber-700 border-amber-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            Orders & Fulfillment ({ordersList.length})
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Real-time customer orders, shipping status, and line items stored in Supabase.
          </p>
        </div>

        <button
          onClick={handleSeedOrders}
          disabled={isSeeding}
          className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase flex items-center gap-2 border border-amber-600 cursor-pointer transition-all disabled:opacity-50"
        >
          {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
          <span>Generate Demo Delivery Orders</span>
        </button>
      </div>

      {/* Orders Grid / Cards */}
      {ordersList.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-300 bg-white text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-700 uppercase">
              No delivery orders registered in database yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Orders created via customer checkout will automatically appear here live. Click below to generate realistic sample Egyptian delivery orders for testing.
            </p>
          </div>
          <button
            onClick={handleSeedOrders}
            disabled={isSeeding}
            className="py-2.5 px-5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase inline-flex items-center gap-2 border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
            <span>Create 5 Demo Delivery Orders</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordersList.map((ord) => {
            const shortId = `ORD-${ord.id?.slice(0, 6).toUpperCase()}`;
            const address = ord.shipping_address || {};
            const itemsCount = ord.order_items?.length || 0;

            return (
              <div
                key={ord.id}
                className="p-5 border border-slate-200 bg-white space-y-4 flex flex-col justify-between hover:border-slate-900 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Card Top: Order ID & Date */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="font-mono font-black text-xs text-slate-900 group-hover:text-black">
                      #{shortId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(ord.created_at || Date.now()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">
                        {address.fullName || "Guest Customer"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {address.phone || "No Phone"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>
                        {address.city ? `${address.city}, ${address.state || "Egypt"}` : "Address specified"}
                      </span>
                    </p>
                  </div>

                  {/* Order Metrics: Items count & Total Amount */}
                  <div className="p-2.5 bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium">{itemsCount} {itemsCount === 1 ? "Item" : "Items"}</span>
                    </div>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {formatPrice(ord.total_amount || 0)}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] uppercase border ${getStatusBadgeStyle(
                        ord.status
                      )}`}
                    >
                      {ord.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Order Details</span>
                  </button>

                  <div className="flex items-center justify-between gap-2">
                    <CustomSelect
                      value={ord.status || "pending"}
                      onChange={(val) => {
                        onOrderStatusChange(ord.id, val);
                        if (selectedOrder?.id === ord.id) {
                          setSelectedOrder((prev: any) => (prev ? { ...prev, status: val } : null));
                        }
                      }}
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "processing", label: "Processing" },
                        { value: "shipped", label: "Shipped" },
                        { value: "delivered", label: "Delivered" },
                      ]}
                      className="flex-1 text-xs"
                      triggerClassName="w-full justify-between text-xs py-1.5"
                    />
                    <button
                      disabled={actionLoadingId === ord.id}
                      onClick={() => onDeleteOrder(ord.id)}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Order"
                    >
                      {actionLoadingId === ord.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OVERLAY MODAL: Full Order Details */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl z-10 overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-black tracking-wider text-amber-400">
                      #ORD-{selectedOrder.id?.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] uppercase border ${getStatusBadgeStyle(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status || "pending"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Placed on: {new Date(selectedOrder.created_at || Date.now()).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-none transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 2-Column Grid for Address & Order Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Box: Customer & Shipping Details */}
                  <div className="p-5 bg-slate-50 border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-200 pb-2">
                      <Truck className="w-4 h-4 text-slate-900" />
                      Shipping & Customer Details
                    </h3>

                    <div className="space-y-2.5 text-xs text-slate-800">
                      <div className="flex items-start space-x-2">
                        <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Recipient Name</span>
                          <span className="font-bold text-slate-900">
                            {selectedOrder.shipping_address?.fullName || "Guest Customer"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Number</span>
                          <a
                            href={`tel:${selectedOrder.shipping_address?.phone}`}
                            className="font-mono font-bold text-slate-900 hover:underline"
                          >
                            {selectedOrder.shipping_address?.phone || "Not Provided"}
                          </a>
                        </div>
                      </div>

                      {selectedOrder.shipping_address?.email && (
                        <div className="flex items-start space-x-2">
                          <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Address</span>
                            <span className="font-mono font-medium text-slate-900">
                              {selectedOrder.shipping_address.email}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-2 pt-1 border-t border-slate-200/60">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Full Address</span>
                          <p className="text-slate-900 leading-snug font-medium">
                            {selectedOrder.shipping_address?.street || "Street address specified"}
                            {selectedOrder.shipping_address?.buildingNo
                              ? `, Bldg/Apt ${selectedOrder.shipping_address.buildingNo}`
                              : ""}
                          </p>
                          <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                            {selectedOrder.shipping_address?.city || "Cairo"}
                            {selectedOrder.shipping_address?.state ? `, ${selectedOrder.shipping_address.state}` : ""}
                            {selectedOrder.shipping_address?.zipCode ? ` (${selectedOrder.shipping_address.zipCode})` : ""}
                            , {selectedOrder.shipping_address?.country || "Egypt"}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.shipping_address?.deliveryInstructions && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 mt-2">
                          <span className="font-bold uppercase block text-[9px] text-amber-700">Delivery Instructions:</span>
                          <p className="italic">{selectedOrder.shipping_address.deliveryInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Box: Order Summary & Financials */}
                  <div className="p-5 bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-200 pb-2">
                        <CreditCard className="w-4 h-4 text-slate-900" />
                        Financial Summary
                      </h3>

                      <div className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Payment Method</span>
                          <span className="font-bold text-slate-900 uppercase bg-slate-200 px-2 py-0.5 text-[10px]">
                            Cash on Delivery (COD)
                          </span>
                        </div>

                        {selectedOrder.discount_amount > 0 && (
                          <div className="flex items-center justify-between text-emerald-700 font-bold">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" /> Applied Discount
                            </span>
                            <span className="font-mono">-{formatPrice(selectedOrder.discount_amount)}</span>
                          </div>
                        )}

                        {selectedOrder.points_earned > 0 && (
                          <div className="flex items-center justify-between text-indigo-700 font-bold">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> VIP Points Earned
                            </span>
                            <span className="font-mono">+{selectedOrder.points_earned} Points</span>
                          </div>
                        )}

                        {selectedOrder.points_redeemed > 0 && (
                          <div className="flex items-center justify-between text-amber-700 font-bold">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> VIP Points Redeemed
                            </span>
                            <span className="font-mono">-{selectedOrder.points_redeemed} Points</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
                          <span>Total Amount Due</span>
                          <span className="font-mono text-base text-slate-900 font-black">
                            {formatPrice(selectedOrder.total_amount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Status Change Inside Modal */}
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Update Order Status:</label>
                      <CustomSelect
                        value={selectedOrder.status || "pending"}
                        onChange={(val) => {
                          onOrderStatusChange(selectedOrder.id, val);
                          setSelectedOrder((prev: any) => (prev ? { ...prev, status: val } : null));
                        }}
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "processing", label: "Processing" },
                          { value: "shipped", label: "Shipped" },
                          { value: "delivered", label: "Delivered" },
                        ]}
                        className="w-full text-xs"
                        triggerClassName="w-full justify-between text-xs py-2 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Order Items Table */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-200 pb-2">
                    <PackageCheck className="w-4 h-4 text-slate-900" />
                    Ordered Items ({selectedOrder.order_items?.length || 0})
                  </h3>

                  {!selectedOrder.order_items || selectedOrder.order_items.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 bg-slate-50 border border-slate-200 text-center">
                      No item details recorded for this order.
                    </p>
                  ) : (
                    <div className="border border-slate-200 divide-y divide-slate-100 overflow-x-auto bg-white">
                      <div className="grid grid-cols-12 bg-slate-100 p-2.5 text-[10px] font-black uppercase text-slate-700 min-w-[500px]">
                        <div className="col-span-6">Item Description</div>
                        <div className="col-span-2 text-center">Unit Price</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                      </div>

                      {selectedOrder.order_items.map((item: any, idx: number) => {
                        const unitPrice = Number(item.price || 0);
                        const qty = Number(item.quantity || 1);
                        const total = unitPrice * qty;

                        return (
                          <div
                            key={item.id || idx}
                            className="grid grid-cols-12 p-3 items-center text-xs text-slate-800 min-w-[500px] hover:bg-slate-50/80 transition-colors"
                          >
                            {/* Product Info */}
                            <div className="col-span-6 flex items-center space-x-3 pr-2">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name || "Product"}
                                  className="w-10 h-10 object-cover border border-slate-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                              <div className="space-y-0.5 truncate">
                                <p className="font-bold text-slate-900 truncate">
                                  {item.product_name || "AURA Item"}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 truncate">
                                  ID: {item.product_id?.slice(0, 12)}...
                                </p>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="col-span-2 text-center font-mono font-medium">
                              {formatPrice(unitPrice)}
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2 text-center font-mono font-bold">
                              x{qty}
                            </div>

                            {/* Subtotal */}
                            <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                              {formatPrice(total)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                <a
                  href={`/order-tracking?id=${selectedOrder.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 underline flex items-center gap-1"
                >
                  <span>Customer Live Tracking View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 sm:flex-initial py-2 px-5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 cursor-pointer transition-colors"
                  >
                    Close Overlay
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
