"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import {
  createUserAddress,
  verifyPromoCode,
  createOrderInDb,
} from "@/lib/services/db";
import { useUserAddresses } from "@/hooks/useStoreData";
import { UserAddress } from "@/types";
import { trackPurchaseCompleted } from "@/lib/analytics/tracker";
import { getShippingFee } from "@/lib/shipping";
import { User } from "lucide-react";

import { CheckoutSuccessView } from "@/components/checkout/CheckoutSuccessView";
import { CheckoutAddressSection } from "@/components/checkout/CheckoutAddressSection";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { profile, loyaltyPoints, addLoyaltyPoints } = useUserStore();

  const [usePoints, setUsePoints] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  // React Query cached hook for addresses
  const { data: savedAddresses = [], isLoading: loadingAddresses } = useUserAddresses(profile?.id);

  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    buildingNo: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    deliveryInstructions: "",
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized || loadingAddresses) return;

    if (profile && Array.isArray(savedAddresses) && savedAddresses.length > 0) {
      const def = savedAddresses.find((a: UserAddress) => a.is_default) || savedAddresses[0];
      setSelectedAddressId(def.id);
      applyAddressToForm(def);
      setIsInitialized(true);
    } else if (profile) {
      setSelectedAddressId("new");
      setShippingData((prev) => ({
        ...prev,
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      }));
      setIsInitialized(true);
    } else {
      setSelectedAddressId("new");
    }
  }, [profile, savedAddresses, loadingAddresses, isInitialized]);

  const applyAddressToForm = (addr: UserAddress) => {
    setShippingData({
      fullName: addr.full_name || profile?.full_name || "",
      email: profile?.email || "",
      phone: addr.phone_number || (addr as any).phone || profile?.phone || "",
      street: addr.street_address || "",
      buildingNo: addr.building_no || "",
      city: addr.city || "",
      state: addr.state_region || "",
      zipCode: addr.zip_code || "",
      country: addr.country || "",
      deliveryInstructions: addr.delivery_instructions || "",
    });
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setShippingData({
        fullName: profile?.full_name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        street: "",
        buildingNo: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        deliveryInstructions: "",
      });
    } else {
      const found = savedAddresses.find((a) => a.id === id);
      if (found) applyAddressToForm(found);
    }
  };

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    name: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [, setVerifyingPromo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeCoupon = localStorage.getItem("aura_active_coupon");
      if (activeCoupon && !appliedPromo) {
        const cleanCode = activeCoupon.trim().toUpperCase();
        setPromoCodeInput(cleanCode);
        verifyPromoCode(cleanCode, profile?.id).then((res) => {
          if (res.success && res.promo) {
            setAppliedPromo({
              code: res.promo.code,
              discountPercent: res.promo.discount_percent,
              name: `${res.promo.discount_percent}% Discount`,
            });
            localStorage.removeItem("aura_active_coupon");
          }
        });
      }
    }
  }, [profile]);

  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError("");
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    setVerifyingPromo(true);
    const res = await verifyPromoCode(cleanCode, profile?.id);
    setVerifyingPromo(false);

    if (res.success && res.promo) {
      setAppliedPromo({
        code: res.promo.code,
        discountPercent: res.promo.discount_percent,
        name: `${res.promo.discount_percent}% Discount`,
      });
      setPromoError("");
      if (typeof window !== "undefined") {
        localStorage.removeItem("aura_active_coupon");
      }
    } else {
      setPromoError(res.message || "Invalid or expired coupon code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoError("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("aura_active_coupon");
    }
  };

  const subtotal = getSubtotal();
  const shippingInfo = getShippingFee(
    shippingData.state || shippingData.city || "Cairo",
    subtotal
  );
  const shipping = shippingInfo.fee;
  const pointsDiscount = usePoints ? Math.min(subtotal, loyaltyPoints / 10) : 0;
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const finalTotal = Math.max(0, subtotal + shipping - pointsDiscount - promoDiscount);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>("");
  const [orderError, setOrderError] = useState<string>("");

  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOrderError("");

    if (!items || items.length === 0) {
      setOrderError("Your cart is empty. Please add items to checkout.");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalFullName =
        shippingData.fullName.trim() || profile?.full_name || "Customer Name";
      const finalPhone =
        shippingData.phone.trim() || profile?.phone || "+20 100 000 0000";
      const finalStreet = shippingData.street.trim() || "Main Street";
      const finalEmail =
        shippingData.email.trim() || profile?.email || "customer@aura.com";

      if (profile && selectedAddressId === "new" && saveAddressToAccount && finalStreet) {
        try {
          await createUserAddress({
            full_name: finalFullName,
            phone_number: finalPhone,
            street_address: finalStreet,
            building_no: shippingData.buildingNo,
            city: shippingData.city,
            state_region: shippingData.state,
            zip_code: shippingData.zipCode,
            country: shippingData.country,
            delivery_instructions: shippingData.deliveryInstructions,
            is_default: savedAddresses.length === 0,
          });
        } catch (err) {
          console.error("Failed to save address:", err);
        }
      }

      const pointsDeducted =
        usePoints && pointsDiscount > 0 ? Math.round(pointsDiscount * 10) : 0;

      const baseEarned = Math.round(finalTotal * 0.1);
      let highValueBonus = 0;
      if (finalTotal >= 5000) highValueBonus = 1200;
      else if (finalTotal >= 3000) highValueBonus = 600;
      else if (finalTotal >= 1500) highValueBonus = 250;

      const earnedPoints = profile ? baseEarned + highValueBonus : 0;

      const mappedItems = items.map((item: any) => ({
        product_id: item.product?.id || item.product_id || "prod-id",
        product_name:
          item.product?.name || item.name || item.title || "AURA Product",
        product_image:
          item.product?.images?.[0] || item.product?.image_url || item.image || null,
        price: Number(item.product?.price || item.price || 0),
        quantity: Number(item.quantity || 1),
        variant: item.selected_variant || {},
      }));

      const newDbOrder = await createOrderInDb({
        user_id: profile?.id || null,
        total_amount: finalTotal,
        points_earned: earnedPoints,
        points_redeemed: pointsDeducted,
        discount_amount: pointsDiscount + promoDiscount,
        shipping_address: {
          fullName: finalFullName,
          phone: finalPhone,
          email: finalEmail,
          street: finalStreet,
          buildingNo: shippingData.buildingNo,
          city: shippingData.city,
          state: shippingData.state,
          zipCode: shippingData.zipCode,
          country: shippingData.country,
          deliveryInstructions: shippingData.deliveryInstructions,
          coupon_code: appliedPromo?.code || null,
        },
        items: mappedItems,
      });

      const realId = newDbOrder?.id
        ? typeof newDbOrder.id === "string" && newDbOrder.id.length > 8
          ? `ORD-${newDbOrder.id.slice(0, 6).toUpperCase()}`
          : newDbOrder.id
        : `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      setPlacedOrderId(realId);

      try {
        trackPurchaseCompleted(realId, finalTotal, items.length);
      } catch {}

      if (pointsDeducted > 0) addLoyaltyPoints(-pointsDeducted);
      if (earnedPoints > 0) addLoyaltyPoints(earnedPoints);

      clearCart();
      setIsSubmitting(false);
      setOrderComplete(true);
    } catch (error) {
      console.error("Error submitting order:", error);
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <CheckoutSuccessView
        placedOrderId={placedOrderId}
        fullName={shippingData.fullName}
        city={shippingData.city}
        finalTotal={finalTotal}
        isLoggedIn={Boolean(profile)}
      />
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-slate-900 bg-white">
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">
            Express Checkout
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Review your shipping details and payment method.
          </p>
        </div>

        {!profile && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 text-xs flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-700" />
            <span className="text-slate-600">Checking out as Guest.</span>
            <Link href="/login" className="font-bold text-slate-900 underline hover:text-black">
              Sign In
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <CheckoutAddressSection
          profile={profile}
          savedAddresses={savedAddresses}
          selectedAddressId={selectedAddressId}
          loadingAddresses={loadingAddresses}
          shippingData={shippingData}
          setShippingData={setShippingData}
          handleSelectAddress={handleSelectAddress}
          saveAddressToAccount={saveAddressToAccount}
          setSaveAddressToAccount={setSaveAddressToAccount}
          subtotal={subtotal}
        />

        <CheckoutOrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          pointsDiscount={pointsDiscount}
          promoDiscount={promoDiscount}
          finalTotal={finalTotal}
          usePoints={usePoints}
          setUsePoints={setUsePoints}
          loyaltyPoints={loyaltyPoints}
          profile={profile}
          appliedPromo={appliedPromo}
          promoCodeInput={promoCodeInput}
          setPromoCodeInput={setPromoCodeInput}
          promoError={promoError}
          setPromoError={setPromoError}
          handleApplyPromo={handleApplyPromo}
          handleRemovePromo={handleRemovePromo}
          orderError={orderError}
          isSubmitting={isSubmitting}
          handlePlaceOrder={handlePlaceOrder}
        />
      </form>
    </div>
  );
}
