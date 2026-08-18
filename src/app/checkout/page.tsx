'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useUserStore } from '@/store/useUserStore';
import { getUserAddresses, createUserAddress, verifyPromoCode, createOrderInDb } from '@/lib/services/db';
import { UserAddress } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  Truck,
  CreditCard,
  Banknote,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Plus,
  User,
  Mail,
  Phone,
  Check,
  Building,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { profile, loyaltyPoints, addLoyaltyPoints } = useUserStore();

  const [usePoints, setUsePoints] = useState(false);

  // Address States
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  // Form Data State
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    buildingNo: '',
    city: 'Cairo',
    state: 'Cairo',
    zipCode: '11511',
    country: 'Egypt',
    deliveryInstructions: '',
  });

  // Load user saved addresses if logged in
  useEffect(() => {
    async function loadAddresses() {
      if (profile) {
        setLoadingAddresses(true);
        const addrs = await getUserAddresses();
        if (Array.isArray(addrs) && addrs.length > 0) {
          setSavedAddresses(addrs);
          const def = addrs.find((a: UserAddress) => a.is_default) || addrs[0];
          setSelectedAddressId(def.id);
          applyAddressToForm(def);
        } else {
          setSelectedAddressId('new');
          setShippingData((prev) => ({
            ...prev,
            fullName: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
          }));
        }
        setLoadingAddresses(false);
      } else {
        setSelectedAddressId('new');
      }
    }
    loadAddresses();
  }, [profile]);

  const applyAddressToForm = (addr: UserAddress) => {
    setShippingData({
      fullName: addr.full_name || profile?.full_name || '',
      email: profile?.email || '',
      phone: addr.phone_number || (addr as any).phone || profile?.phone || '',
      street: addr.street_address || '',
      buildingNo: addr.building_no || '',
      city: addr.city || 'Cairo',
      state: addr.state_region || 'Cairo',
      zipCode: addr.zip_code || '11511',
      country: addr.country || 'Egypt',
      deliveryInstructions: addr.delivery_instructions || '',
    });
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setShippingData({
        fullName: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        street: '',
        buildingNo: '',
        city: 'Cairo',
        state: 'Cairo',
        zipCode: '11511',
        country: 'Egypt',
        deliveryInstructions: '',
      });
    } else {
      const found = savedAddresses.find((a) => a.id === id);
      if (found) applyAddressToForm(found);
    }
  };

  // Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number; name: string } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [verifyingPromo, setVerifyingPromo] = useState(false);

  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError('');
    const cleanCode = promoCodeInput.trim().toUpperCase();

    if (!cleanCode) return;

    setVerifyingPromo(true);
    const res = await verifyPromoCode(cleanCode);
    setVerifyingPromo(false);

    if (res.success && res.promo) {
      setAppliedPromo({
        code: res.promo.code,
        discountPercent: res.promo.discount_percent,
        name: `${res.promo.discount_percent}% Discount`,
      });
      setPromoError('');
    } else {
      setPromoError(res.message || 'Invalid or expired promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  const subtotal = getSubtotal();
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 15;
  const pointsDiscount = usePoints ? Math.min(subtotal, loyaltyPoints / 10) : 0; // 10 points = $1
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const finalTotal = Math.max(0, subtotal + shipping - pointsDiscount - promoDiscount);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [orderError, setOrderError] = useState<string>('');

  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('=== HANDLE PLACE ORDER CLICKED ===', { itemsCount: items?.length, shippingData });
    setOrderError('');

    if (!items || items.length === 0) {
      console.warn('Cannot place order: Cart is empty.');
      setOrderError('Your cart is empty. Please add items to checkout.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalFullName = shippingData.fullName.trim() || profile?.full_name || 'Customer Name';
      const finalPhone = shippingData.phone.trim() || profile?.phone || '+20 100 000 0000';
      const finalStreet = shippingData.street.trim() || 'Main Street';
      const finalEmail = shippingData.email.trim() || profile?.email || 'customer@aura.com';

      // Save new address to account if logged in
      if (profile && selectedAddressId === 'new' && saveAddressToAccount && finalStreet) {
        try {
          await createUserAddress({
            full_name: finalFullName,
            phone_number: finalPhone,
            street_address: finalStreet,
            building_no: shippingData.buildingNo,
            city: shippingData.city || 'Cairo',
            state_region: shippingData.state || 'Cairo',
            zip_code: shippingData.zipCode || '11511',
            country: shippingData.country || 'Egypt',
            delivery_instructions: shippingData.deliveryInstructions,
            is_default: savedAddresses.length === 0,
          });
        } catch (err) {
          console.error('Failed to save address:', err);
        }
      }

      const pointsDeducted = (usePoints && pointsDiscount > 0) ? Math.round(pointsDiscount * 10) : 0;
      
      // Automatic High-Value Order Loyalty Points Bonus System
      const baseEarned = Math.round(finalTotal * 0.1);
      let highValueBonus = 0;
      if (finalTotal >= 5000) {
        highValueBonus = 1200; // Platinum Tier Bonus
      } else if (finalTotal >= 3000) {
        highValueBonus = 600;  // Gold Tier Bonus
      } else if (finalTotal >= 1500) {
        highValueBonus = 250;  // Silver Tier Bonus
      }

      const earnedPoints = profile ? (baseEarned + highValueBonus) : 0;

      const mappedItems = items.map((item: any) => ({
        product_id: item.product?.id || item.product_id || 'prod-id',
        product_name: item.product?.name || item.name || item.title || 'AURA Product',
        product_image: item.product?.images?.[0] || item.product?.image_url || item.image || null,
        price: Number(item.product?.price || item.price || 0),
        quantity: Number(item.quantity || 1),
        variant: item.selected_variant || {},
      }));

      console.log('Sending order payload to createOrderInDb...');

      // Create order in Supabase DB
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
        },
        items: mappedItems,
      });

      console.log('=== DB ORDER CREATED RESPONSE ===', newDbOrder);

      const realId = newDbOrder?.id
        ? (typeof newDbOrder.id === 'string' && newDbOrder.id.length > 8 ? `ORD-${newDbOrder.id.slice(0, 6).toUpperCase()}` : newDbOrder.id)
        : `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      console.log('=== REAL GENERATED ORDER ID ===', realId);

      setPlacedOrderId(realId);

      if (pointsDeducted > 0) {
        addLoyaltyPoints(-pointsDeducted);
      }
      if (earnedPoints > 0) {
        addLoyaltyPoints(earnedPoints);
      }

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
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 font-sans text-slate-900 bg-white">
        <div className="w-16 h-16 bg-slate-900 text-white border border-slate-900 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
            Order Confirmed!
          </span>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Thank You For Your Order</h1>
          <p className="text-xs text-slate-600">
            Order ID: <span className="font-mono text-slate-900 font-bold">{placedOrderId || 'ORD-323898'}</span>
          </p>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 text-xs text-slate-900 space-y-3 text-left">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600">Deliver To:</span>
            <span className="font-bold text-slate-900">{shippingData.fullName} ({shippingData.city})</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600">Total Paid:</span>
            <span className="font-mono font-bold text-slate-900">{formatPrice(finalTotal)}</span>
          </div>
          {profile && (
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600">VIP Points Earned:</span>
              <span className="font-mono font-bold text-slate-900">+{Math.round(finalTotal * 0.1)} Points</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Estimated Delivery:</span>
            <span className="font-mono font-bold text-slate-900">Within 2-3 Days</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={() => router.push(`/order-tracking?id=${placedOrderId}`)}
            className="flex-1 py-3 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-800 uppercase cursor-pointer transition-all"
          >
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => router.push('/products')}
            className="py-3 px-6 bg-white border border-slate-300 text-slate-900 text-xs font-bold hover:bg-slate-50 uppercase cursor-pointer transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-slate-900 bg-white">
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Express Checkout</h1>
          <p className="text-xs text-slate-600 mt-1">Review your shipping details and payment method.</p>
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
        {/* Left Column: Delivery Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-900" /> 
                Shipping & Delivery Address
              </h3>

              {profile && savedAddresses.length > 0 && (
                <Link
                  href="/addresses"
                  className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline"
                >
                  Manage Addresses
                </Link>
              )}
            </div>

            {/* IF LOGGED IN & HAS SAVED ADDRESSES */}
            {profile && savedAddresses.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">Select a saved shipping address for instant checkout:</p>

                {loadingAddresses ? (
                  <div className="p-4 flex items-center space-x-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Loading saved addresses...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr.id)}
                          className={`p-3.5 border cursor-pointer transition-all flex flex-col justify-between space-y-2 text-xs ${
                            isSelected
                              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                              : 'border-slate-200 bg-white hover:border-slate-400'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                              <span className="truncate pr-1">{addr.full_name}</span>
                              {addr.is_default && (
                                <span className="bg-slate-900 text-white px-1.5 py-0.5 text-[8px] font-black uppercase">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p className="text-slate-800 text-[11px] leading-snug">
                              {addr.street_address}{addr.building_no ? `, Apt/Bldg ${addr.building_no}` : ''}
                            </p>
                            <p className="text-slate-500 font-mono text-[10px]">
                              {addr.city}, {addr.state_region}
                            </p>
                            <p className="text-slate-700 font-mono text-[10px]">
                              📞 {addr.phone_number || (addr as any).phone}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 text-[10px] font-bold uppercase text-slate-900 pt-1 border-t border-slate-200/60">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span>{isSelected ? 'Selected' : 'Deliver Here'}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Option to add new address */}
                    <div
                      onClick={() => handleSelectAddress('new')}
                      className={`p-3.5 border border-dashed cursor-pointer transition-all flex items-center justify-center space-x-2 text-xs font-bold uppercase ${
                        selectedAddressId === 'new'
                          ? 'border-slate-900 bg-slate-50 text-slate-900'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-900'
                      }`}
                    >
                      <Plus className="w-4 h-4 text-slate-900" />
                      <span>Use New Address</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* INPUT FORM FIELDS (Shown if Guest, or Logged In with no addresses, or selected 'new') */}
            {(!profile || savedAddresses.length === 0 || selectedAddressId === 'new') && (
              <div className="space-y-4 pt-2">
                {profile && savedAddresses.length > 0 && (
                  <h4 className="text-xs font-bold uppercase text-slate-900 border-t border-slate-100 pt-3">
                    Enter Custom Address Details:
                  </h4>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Vance"
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  {!profile && (
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={shippingData.email}
                        onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">Phone Number (Egyptian)</label>
                    <input
                      type="tel"
                      maxLength={11}
                      placeholder="01012345678"
                      value={shippingData.phone}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                    />
                    <p className="text-[9px] text-slate-500 mt-0.5 font-mono normal-case">11 digits starting with 010, 011, 012, or 015</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 742 Evergreen Terrace, Nasr City"
                      value={shippingData.street}
                      onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">Apt / Bldg No.</label>
                    <input
                      type="text"
                      placeholder="Apt 4B, Building 12"
                      value={shippingData.buildingNo}
                      onChange={(e) => setShippingData({ ...shippingData, buildingNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">City</label>
                    <input
                      type="text"
                      placeholder="Cairo"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">State / Region</label>
                    <input
                      type="text"
                      placeholder="Cairo / Giza"
                      value={shippingData.state}
                      onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">Postal Code</label>
                    <input
                      type="text"
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">Delivery Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Leave with doorman or call on arrival"
                      value={shippingData.deliveryInstructions}
                      onChange={(e) => setShippingData({ ...shippingData, deliveryInstructions: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {profile && (
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="saveAddressCheck"
                      checked={saveAddressToAccount}
                      onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                      className="w-4 h-4 accent-slate-900 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="saveAddressCheck" className="text-xs font-bold text-slate-800 uppercase cursor-pointer">
                      Save this address to my account for future orders
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <Banknote className="w-4 h-4 text-slate-900" /> Payment Method
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-slate-600">Pay in cash right when your order arrives at your doorstep.</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-300 uppercase">
                SELECTED
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Loyalty */}
        <div className="p-6 bg-white border border-slate-200 space-y-6 h-fit">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="font-mono text-xs text-slate-500 font-bold">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </h3>

          {/* Cart Items Breakdown List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 border-b border-slate-100 pb-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-3 text-xs">
                <img
                  src={item.product.images?.[0] || '/placeholder.png'}
                  alt={item.product.name}
                  className="w-11 h-11 object-cover border border-slate-200 flex-shrink-0 bg-slate-50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate uppercase text-[11px]">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Qty: <span className="font-bold text-slate-900">{item.quantity}</span> × {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-slate-900 text-xs">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Loyalty Points Redemption */}
          {profile && loyaltyPoints > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" /> VIP Loyalty Points
                </span>
                <span className="text-xs font-mono text-slate-900 font-bold">{loyaltyPoints} pts</span>
              </div>
              <label className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer pt-1 uppercase font-semibold">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="accent-slate-900 w-4 h-4 cursor-pointer"
                />
                <span>Redeem points for discount (${(loyaltyPoints / 10).toFixed(2)})</span>
              </label>
            </div>
          )}

          {/* Promo Code Input Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-900">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-900" /> Promo Code
              </span>
            </div>

            {appliedPromo ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs font-bold text-emerald-900">
                <div className="flex items-center space-x-1.5 truncate">
                  <Tag className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span className="font-mono">{appliedPromo.code}</span>
                  <span className="text-[10px] text-emerald-700 font-normal">({appliedPromo.discountPercent}% OFF)</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-[10px] text-rose-600 hover:text-rose-800 underline uppercase cursor-pointer ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. AURA10"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value);
                      if (promoError) setPromoError('');
                    }}
                    className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-[10px] font-bold text-rose-600 uppercase">{promoError}</p>
                )}
                <p className="text-[10px] text-slate-500 font-mono">
                  Active codes: <span className="font-bold text-slate-900">AURA10</span> (10%) • <span className="font-bold text-slate-900">CYBER20</span> (20%)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-mono text-slate-900 font-bold">
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
            {usePoints && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>VIP Points Discount</span>
                <span className="font-mono">-{formatPrice(pointsDiscount)}</span>
              </div>
            )}
            {appliedPromo && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promo Discount ({appliedPromo.code} - {appliedPromo.discountPercent}%)</span>
                <span className="font-mono">-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Payment</span>
              <span className="font-mono text-slate-900 font-black">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Automatic High-Value Points Reward Banner */}
          {profile && (
            <div className="p-3 bg-slate-900 text-white space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Points Earned On Order
                </span>
                <span className="font-mono text-amber-400 font-black">
                  +{(Math.round(finalTotal * 0.1) + (finalTotal >= 5000 ? 1200 : finalTotal >= 3000 ? 600 : finalTotal >= 1500 ? 250 : 0))} PTS
                </span>
              </div>
              {finalTotal >= 1500 ? (
                <p className="text-[10px] text-amber-300 font-mono font-bold">
                  Includes +{finalTotal >= 5000 ? '1,200 (Platinum)' : finalTotal >= 3000 ? '600 (Gold)' : '250 (Silver)'} Automatic High-Value Bonus!
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 font-mono">
                  Spend {formatPrice(1500 - finalTotal)} more to unlock +250 Automatic Bonus Points!
                </p>
              )}
            </div>
          )}

          {orderError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handlePlaceOrder()}
            disabled={isSubmitting || items.length === 0}
            className="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 border border-slate-800 uppercase cursor-pointer transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing Order...</span>
              </div>
            ) : (
              <span>Confirm & Place Order</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
