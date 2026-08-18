"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  X,
  CheckCircle2,
  MapPin,
  Banknote,
  Truck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { getUserAddresses, createOrderInDb, createUserAddress } from "@/lib/services/db";
import { Product, UserAddress } from "@/types";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface ExpressBuyModalProps {
  product: Product;
  quantity?: number;
  selectedVariants?: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpressBuyModal({
  product,
  quantity = 1,
  selectedVariants = {},
  isOpen,
  onClose,
}: ExpressBuyModalProps) {
  const router = useRouter();
  const { profile, addLoyaltyPoints } = useUserStore();

  const [loadingAddress, setLoadingAddress] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  

  // New Quick Address Form State if no address exists
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: profile?.full_name || "",
    phone_number: profile?.phone || "",
    street_address: "",
    building_no: "",
    city: "Cairo",
    state_region: "Cairo",
    zip_code: "11511",
  });

  useEffect(() => {
    if (!isOpen) {
      setOrderConfirmed(null);
      setSubmitting(false);
      return;
    }

    async function loadAddress() {
      if (!profile) return;
      setLoadingAddress(true);
      try {
        const addresses = await getUserAddresses();
        if (Array.isArray(addresses) && addresses.length > 0) {
          const def = addresses.find((a: UserAddress) => a.is_default) || addresses[0];
          setDefaultAddress(def);
          setShowAddressForm(false);
        } else {
          setDefaultAddress(null);
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error("Failed to load user address for Express Buy:", err);
      } finally {
        setLoadingAddress(false);
      }
    }

    loadAddress();
  }, [isOpen, profile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate prices
  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;
  const earnedPoints = Math.round(totalPrice * 0.1);

  const handleSaveQuickAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street_address || !newAddress.phone_number) {
      toast.error("Please enter your street address and phone number");
      return;
    }

    try {
      const created = await createUserAddress({
        ...newAddress,
        user_id: profile?.id,
        is_default: true,
      });

      if (created) {
        setDefaultAddress(created);
        setShowAddressForm(false);
        toast.success("Default delivery address saved!");
      }
    } catch (err) {
      console.error("Failed to save quick address:", err);
      toast.error("Could not save address. Please try again.");
    }
  };

  const handleConfirmExpressOrder = async () => {
    if (!profile) {
      toast.error("Please sign in to place an order");
      router.push("/login");
      return;
    }

    if (!defaultAddress) {
      toast.error("Please provide a shipping address first");
      setShowAddressForm(true);
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        user_id: profile.id,
        total_amount: totalPrice,
        points_earned: earnedPoints,
        points_redeemed: 0,
        discount_amount: 0,
        shipping_address: {
          fullName: defaultAddress.full_name || profile.full_name,
          phone: defaultAddress.phone_number || profile.phone,
          email: profile.email,
          street: defaultAddress.street_address,
          buildingNo: defaultAddress.building_no || "",
          city: defaultAddress.city,
          state: defaultAddress.state_region || defaultAddress.city,
          zipCode: defaultAddress.zip_code || "11511",
          country: defaultAddress.country || "Egypt",
        },
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            name: product.name,
            quantity: quantity,
            price: unitPrice,
            unit_price: unitPrice,
            product_image: product.images?.[0] || null,
            image_url: product.images?.[0] || null,
            variant: Object.keys(selectedVariants).length > 0 ? selectedVariants : {},
            selected_variant: Object.keys(selectedVariants).length > 0 ? selectedVariants : {},
          },
        ],
      };

      const result = await createOrderInDb(orderPayload);

      const rawId = result?.id || "";
      const displayFormattedId = typeof rawId === "string" && rawId.length > 8
        ? `ORD-${rawId.slice(0, 6).toUpperCase()}`
        : rawId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      if (earnedPoints > 0) {
        addLoyaltyPoints(earnedPoints);
      }

      setOrderConfirmed({
        id: displayFormattedId,
        rawId: rawId || displayFormattedId,
        total: totalPrice,
        points: earnedPoints,
        address: defaultAddress,
      });

      toast.success("1-Click Express Order Confirmed!", {
        duration: 5000,
        style: {
          background: "#0f172a",
          color: "#ffffff",
          borderRadius: "0px",
          fontSize: "12px",
          fontWeight: "bold",
          border: "1px solid #1e293b",
        },
      });
    } catch (err) {
      console.error("Express order error:", err);
      toast.error("Failed to confirm express order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-900 w-full max-w-lg shadow-2xl font-sans text-slate-900 overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-amber-400 text-slate-950 font-bold border border-amber-300">
              <Zap className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                1-Click Express Buy Now
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">
                Instant Order Confirmation • Cash on Delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          
          {orderConfirmed ? (
            /* Order Confirmed View */
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 bg-emerald-600 text-white border border-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-widest block">
                  Express Order Placed
                </span>
                <h2 className="text-xl font-black uppercase text-slate-900">
                  Thank You For Your Order!
                </h2>
                <p className="text-xs font-mono font-bold text-slate-700">
                  Order ID: <span className="text-slate-950">{orderConfirmed.id}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-mono">
                  <span className="text-slate-500">Deliver To:</span>
                  <span className="font-bold text-slate-900">
                    {orderConfirmed.address?.full_name} ({orderConfirmed.address?.city})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-mono">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Cash on Delivery
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-mono">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-bold text-slate-900">{formatPrice(orderConfirmed.total)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">VIP Points Earned:</span>
                  <span className="font-bold text-amber-600">+{orderConfirmed.points} PTS</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href={`/order-tracking?id=${orderConfirmed.rawId || orderConfirmed.id}`}
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider border border-slate-800 transition-colors flex items-center justify-center space-x-1"
                >
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Track Order</span>
                </Link>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase border border-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : showAddressForm ? (
            /* Address Entry Form if no saved address */
            <form onSubmit={handleSaveQuickAddress} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold uppercase flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Enter Shipping Address For Express Buy</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddress.full_name}
                    onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone_number}
                      onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                      className="w-full p-2 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none"
                      placeholder="01000000000"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full p-2 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress.street_address}
                    onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                    className="w-full p-2 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none"
                    placeholder="Building 12, Street Name, Area"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider border border-slate-800 transition-colors cursor-pointer"
              >
                Save Address & Proceed Express Buy
              </button>
            </form>
          ) : (
            /* Express Order Confirmation Preview */
            <div className="space-y-5">
              
              {/* Product Card Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-14 h-14 object-cover border border-slate-200 bg-white"
                />
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase text-slate-900 line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-800 mt-0.5">
                    <span>Qty: {quantity}</span>
                    {Object.keys(selectedVariants).length > 0 && (
                      <span className="text-slate-500 font-normal">
                        ({Object.values(selectedVariants).join(", ")})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-slate-900 block">
                    {formatPrice(totalPrice)}
                  </span>
                  <span className="text-[10px] text-amber-600 font-mono font-bold block">
                    +{earnedPoints} PTS
                  </span>
                </div>
              </div>

              {/* Delivery & Payment Details */}
              <div className="space-y-3 text-xs">
                
                {/* Address Box */}
                <div className="p-3 border border-slate-200 bg-white flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-slate-900 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">
                        Deliver To (Default Address):
                      </span>
                      <p className="font-bold text-slate-900">
                        {defaultAddress?.full_name} ({defaultAddress?.phone_number})
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        {defaultAddress?.street_address}, {defaultAddress?.city}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/addresses"
                    onClick={onClose}
                    className="text-[10px] text-amber-700 font-bold uppercase underline"
                  >
                    Change
                  </Link>
                </div>

                {/* Payment Method Box */}
                <div className="p-3 border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">
                        Express Payment Method:
                      </span>
                      <p className="font-bold text-slate-900">
                        Cash on Delivery (COD)
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold uppercase">
                    No Card Needed
                  </span>
                </div>
              </div>

              {/* Confirm Express Buy CTA Button */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleConfirmExpressOrder}
                  disabled={submitting}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg border border-amber-300 cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {submitting
                      ? "Placing Order..."
                      : `CONFIRM & PLACE ORDER NOW (${formatPrice(totalPrice)})`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>

                <p className="text-[10px] text-slate-400 font-mono text-center">
                  By clicking, your order is placed instantly. You pay upon delivery.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
