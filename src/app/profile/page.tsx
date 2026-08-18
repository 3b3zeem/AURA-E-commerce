'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { User, Heart, Package, Sparkles, LogOut, ShieldCheck, Save, ExternalLink, Lock, Gift, Tag, Copy, Check, CreditCard, Banknote, Zap, Plus, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

import { getUserOrders, getUserLoyaltyInfo, getProducts } from '@/lib/services/db';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, wishlistIds, loyaltyPoints, addLoyaltyPoints, setProfile, clearUser } = useUserStore();

  const [activeTab, setActiveTab] = useState<'info' | 'wishlist' | 'orders' | 'payment' | 'loyalty'>('info');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Payment & Express Checkout Preferences State
  const [expressCheckoutEnabled, setExpressCheckoutEnabled] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [savedCards, setSavedCards] = useState([
    {
      id: 'card-1',
      brand: 'Visa',
      last4: '4242',
      expMonth: '12',
      expYear: '28',
      holderName: profile?.full_name || 'AURA MEMBER',
      isDefault: true,
    },
  ]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardForm, setNewCardForm] = useState({
    cardNumber: '',
    holderName: profile?.full_name || '',
    expMonth: '12',
    expYear: '28',
  });

  // Live Data States
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<{ points: number; logs: any[] }>({ points: 0, logs: [] });
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeemedVouchers, setRedeemedVouchers] = useState<
    Array<{ title: string; code: string; date: string; discountAmount: number }>
  >([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const rewardsCatalog = [
    {
      id: "reward-50",
      title: "EGP 50 Shopping Voucher",
      description: "Instant EGP 50 off discount applied to your next purchase.",
      pointsCost: 500,
      discountAmount: 50,
      badge: "INSTANT CREDIT",
    },
    {
      id: "reward-100",
      title: "EGP 100 VIP Cash Coupon",
      description: "EGP 100 coupon code valid across all hardware categories.",
      pointsCost: 1000,
      discountAmount: 100,
      badge: "POPULAR CHOICE",
    },
    {
      id: "reward-250",
      title: "EGP 250 Luxury Gift Voucher",
      description: "EGP 250 big savings voucher for high-end orders.",
      pointsCost: 2500,
      discountAmount: 250,
      badge: "PLATINUM FAVORITE",
    },
    {
      id: "reward-500",
      title: "EGP 500 Super VIP Coupon",
      description: "EGP 500 discount for serious tech collectors & builders.",
      pointsCost: 5000,
      discountAmount: 500,
      badge: "ULTIMATE SAVINGS",
    },
  ];

  const handleRedeemReward = (reward: {
    id: string;
    title: string;
    pointsCost: number;
    discountAmount: number;
  }) => {
    const currentPoints =
      loyaltyData.points ?? profile?.loyalty_points ?? loyaltyPoints ?? 0;
    if (currentPoints < reward.pointsCost) {
      toast.error(
        `Insufficient points. You need ${reward.pointsCost - currentPoints} more PTS.`,
      );
      return;
    }

    const generatedCode = `AURA-VIP-${reward.discountAmount}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Deduct points
    addLoyaltyPoints(-reward.pointsCost);
    setLoyaltyData((prev) => ({
      ...prev,
      points: Math.max(0, prev.points - reward.pointsCost),
    }));

    const newVoucher = {
      title: reward.title,
      code: generatedCode,
      date: new Date().toLocaleDateString(),
      discountAmount: reward.discountAmount,
    };

    setRedeemedVouchers((prev) => [newVoucher, ...prev]);

    toast.success(`Redeemed "${reward.title}"! Code: ${generatedCode}`, {
      duration: 6000,
      style: {
        background: "#0f172a",
        color: "#ffffff",
        borderRadius: "0px",
        fontSize: "12px",
        fontWeight: "bold",
        border: "1px solid #1e293b",
      },
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!profile && mounted) {
      router.push('/login');
    } else if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');

      // Load live orders and loyalty info from API
      const loadLiveData = async () => {
        setLoading(true);
        const [orders, loyalty, prods] = await Promise.all([
          getUserOrders(profile.id),
          getUserLoyaltyInfo(profile.id),
          getProducts(),
        ]);
        setUserOrders(orders);
        setLoyaltyData(loyalty);
        setAllProducts(prods);
        setLoading(false);
      };
      loadLiveData();
    }
  }, [profile, mounted, router]);

  if (!mounted) {
    return null;
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 text-center space-y-4 font-sans text-slate-900">
        <Lock className="w-8 h-8 mx-auto text-slate-900" />
        <h2 className="text-xl font-black uppercase text-slate-900">Authentication Required</h2>
        <p className="text-xs text-slate-600">Please sign in to view your profile and account settings.</p>
        <Link
          href="/login"
          className="inline-block w-full py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black border border-slate-800 transition-colors"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      setProfile({
        ...profile,
        full_name: fullName,
        phone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearUser();
      const { useCartStore } = await import('@/store/useCartStore');
      useCartStore.getState().setItems([]);
      router.push('/login');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-slate-900">
      
      {/* Profile Header Banner */}
      <div className="p-6 bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'User'}
              className="w-16 h-16 object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-black text-xl border border-slate-800 uppercase">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 uppercase">{profile.full_name || 'Member Account'}</h1>
              {profile.role === 'admin' && (
                <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold border border-slate-800">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-mono">{profile.email}</p>
          </div>
        </div>

        {/* Loyalty Points Pill */}
        <button
          type="button"
          onClick={() => setActiveTab('loyalty')}
          className="flex items-center space-x-4 bg-slate-50 text-slate-900 px-5 py-3 border border-slate-200 hover:bg-slate-100 transition-colors text-left cursor-pointer group"
        >
          <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
          <div>
            <span className="text-[10px] text-slate-500 font-bold block font-mono uppercase">VIP Points (Click to Redeem)</span>
            <span className="text-base font-black text-amber-600 font-mono">
              {loyaltyData.points ?? profile?.loyalty_points ?? loyaltyPoints ?? 0} PTS
            </span>
          </div>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border ${
              activeTab === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'info' ? 'text-white' : 'text-slate-900'}`} />
            <span>Account Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full p-3 text-xs font-bold flex items-center justify-between transition-colors uppercase border ${
              activeTab === 'wishlist'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Heart className={`w-4 h-4 ${activeTab === 'wishlist' ? 'text-white' : 'text-slate-900'}`} />
              <span>Saved Wishlist</span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${activeTab === 'wishlist' ? 'bg-white text-slate-900 border-white' : 'bg-slate-100 text-slate-900 border-slate-300'}`}>
              {wishlistIds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-white' : 'text-slate-900'}`} />
            <span>Order History</span>
          </button>

          <Link
            href="/addresses"
            className="w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          >
            <User className={`w-4 h-4 text-slate-900`} />
            <span>Your Addresses</span>
          </Link>

          <button
            onClick={() => setActiveTab('payment')}
            className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border ${
              activeTab === 'payment'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === 'payment' ? 'text-amber-400' : 'text-slate-900'}`} />
            <span>Payment & Express Buy</span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border ${
              activeTab === 'loyalty'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'loyalty' ? 'text-white' : 'text-slate-900'}`} />
            <span>VIP Rewards</span>
          </button>

          {profile.role === 'admin' && (
            <Link
              href="/admin"
              className="block w-full p-3 text-xs font-bold text-center bg-slate-900 text-white border border-slate-800 hover:bg-black transition-colors uppercase"
            >
              <ShieldCheck className="w-4 h-4 inline mr-1" />
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full p-3 text-xs font-bold flex items-center space-x-3 bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors uppercase mt-6"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          
          {/* Tab 1: Account Settings */}
          {activeTab === 'info' && (
            <div className="p-6 bg-white border border-slate-200 space-y-6">
              <h2 className="text-base font-black text-slate-900 uppercase">Personal Settings</h2>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center space-x-2 transition-colors uppercase border border-slate-800 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  {savedSuccess && (
                    <span className="text-xs text-emerald-600 font-bold">
                      ✓ Profile updated successfully!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Saved Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 uppercase">Your Saved Wishlist ({wishlistProducts.length})</h2>
              </div>

              {wishlistProducts.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="Your Wishlist is Empty"
                  description="Explore our catalog and tap Add to List on any product to save items for later."
                  actionText="Browse Hardware Products"
                  actionHref="/products"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Order History */}
          {activeTab === 'orders' && (
            <div className="p-6 bg-white border border-slate-200 space-y-6">
              <h2 className="text-base font-black text-slate-900 uppercase">Recent Orders</h2>

              {userOrders.length === 0 ? (
                <p className="text-xs text-slate-600 font-mono">No order history found for this account.</p>
              ) : (
                userOrders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{ord.id || ord.tracking_number}</span>
                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase border border-slate-800">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-slate-600">Placed on {formatDate(ord.created_at)}</p>
                      <p className="font-mono font-bold text-slate-900 text-sm">{formatPrice(ord.total_amount)}</p>
                    </div>

                    <Link
                      href="/order-tracking"
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-black border border-slate-800 uppercase transition-colors"
                    >
                      <span>Track Order</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Payment Methods & Express Buy */}
          {activeTab === 'payment' && (
            <div className="p-6 bg-white border border-slate-200 space-y-8 font-sans">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-slate-900 uppercase">Payment Methods & Express Buy</h2>
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase border border-amber-300">
                      FAST BUY ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your preferred payment options and 1-Click Express Buy settings for fast purchasing.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 text-slate-900 border border-slate-200 text-right font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Default Payment</span>
                  <span className="text-xs font-black text-slate-900 flex items-center justify-end gap-1">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Cash on Delivery
                  </span>
                </div>
              </div>

              {/* SECTION 1: 1-CLICK EXPRESS CHECKOUT SETTINGS */}
              <div className="p-5 bg-slate-50 text-slate-900 space-y-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-amber-400 text-slate-950 font-bold border border-amber-300">
                      <Zap className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        1-Click Express Buy Now
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Bypass multi-step checkout and confirm orders in 1 second
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setExpressCheckoutEnabled(!expressCheckoutEnabled);
                      toast.success(
                        expressCheckoutEnabled
                          ? "Express Checkout Disabled"
                          : "Express Checkout Enabled!"
                      );
                    }}
                    className={`px-4 py-2 text-xs font-black uppercase transition-all border cursor-pointer ${
                      expressCheckoutEnabled
                        ? "bg-amber-400 text-slate-950 border-amber-300"
                        : "bg-slate-200 text-slate-700 border-slate-300"
                    }`}
                  >
                    {expressCheckoutEnabled ? "ENABLED" : "DISABLED"}
                  </button>
                </div>

                <div className="p-4 bg-white border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed font-mono">
                  <div className="flex items-center justify-between text-slate-900 font-bold pb-2 border-b border-slate-200">
                    <span>How Express Buy Works:</span>
                    <span className="text-amber-600 font-mono text-[11px] font-bold">Instant Order Creation</span>
                  </div>
                  <p>
                    When enabled, clicking the <strong className="text-slate-900 font-black">"Place Order"</strong> button on any product instantly opens a 1-second order confirmation drawer using your saved delivery address and Cash on Delivery option.
                  </p>
                  <div className="flex items-center space-x-2 pt-1 text-slate-600">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>No need to re-enter shipping details or credit cards every time.</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PAYMENT METHODS MANAGEMENT */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-900" />
                    Saved Payment Methods & Preferences
                  </h3>
                  
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold uppercase border border-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add Payment Card</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Cash on Delivery Card */}
                  <div
                    onClick={() => setSelectedPaymentMethod('cod')}
                    className={`p-5 border-2 transition-all cursor-pointer space-y-3 relative ${
                      selectedPaymentMethod === 'cod'
                        ? 'border-slate-900 bg-slate-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center">
                          <Banknote className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900">
                            Cash on Delivery (COD)
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Pay in cash upon physical item delivery
                          </span>
                        </div>
                      </div>

                      {selectedPaymentMethod === 'cod' && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans border-t border-slate-200 pt-3">
                      Recommended for Egyptian regional deliveries. Inspect your hardware item before cash payment.
                    </p>
                  </div>

                  {/* Saved Credit / Debit Cards */}
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`p-5 border-2 transition-all cursor-pointer space-y-3 relative ${
                        selectedPaymentMethod === 'card'
                          ? 'border-slate-900 bg-slate-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-900 text-white border border-slate-800 flex items-center justify-center font-mono font-bold text-xs">
                            VISA
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase text-slate-900 font-mono">
                              •••• •••• •••• {card.last4}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Expires {card.expMonth}/{card.expYear} • {card.holderName}
                            </span>
                          </div>
                        </div>

                        {selectedPaymentMethod === 'card' && (
                          <span className="px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-mono font-bold uppercase">
                            SELECTED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] font-mono text-slate-500">
                        <span>Card Status: Verified Active</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSavedCards(savedCards.filter((c) => c.id !== card.id));
                            toast.success("Card removed");
                          }}
                          className="text-rose-600 hover:underline font-bold uppercase cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Card Modal */}
              {showAddCardModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white border-2 border-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl font-sans text-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-slate-900" />
                        <h3 className="text-xs font-black uppercase tracking-wider">
                          Add New Payment Card
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddCardModal(false)}
                        className="text-slate-400 hover:text-slate-900 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCardForm.cardNumber || newCardForm.cardNumber.length < 4) {
                          toast.error("Please enter a valid card number");
                          return;
                        }

                        const added = {
                          id: `card-${Date.now()}`,
                          brand: "Visa",
                          last4: newCardForm.cardNumber.slice(-4),
                          expMonth: newCardForm.expMonth,
                          expYear: newCardForm.expYear,
                          holderName: newCardForm.holderName || "AURA MEMBER",
                          isDefault: false,
                        };

                        setSavedCards([...savedCards, added]);
                        setShowAddCardModal(false);
                        toast.success("New payment card added successfully!");
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newCardForm.holderName}
                          onChange={(e) => setNewCardForm({ ...newCardForm, holderName: e.target.value })}
                          className="w-full p-2 border border-slate-300 font-medium text-slate-900 focus:border-slate-900 outline-none"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          value={newCardForm.cardNumber}
                          onChange={(e) => setNewCardForm({ ...newCardForm, cardNumber: e.target.value })}
                          className="w-full p-2 border border-slate-300 font-mono font-medium text-slate-900 focus:border-slate-900 outline-none"
                          placeholder="4532 0000 0000 4242"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">
                            Expiry Month / Year
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              maxLength={2}
                              value={newCardForm.expMonth}
                              onChange={(e) => setNewCardForm({ ...newCardForm, expMonth: e.target.value })}
                              className="w-full p-2 border border-slate-300 font-mono text-center focus:border-slate-900 outline-none"
                              placeholder="12"
                            />
                            <input
                              type="text"
                              required
                              maxLength={2}
                              value={newCardForm.expYear}
                              onChange={(e) => setNewCardForm({ ...newCardForm, expYear: e.target.value })}
                              className="w-full p-2 border border-slate-300 font-mono text-center focus:border-slate-900 outline-none"
                              placeholder="28"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">
                            CVV Code
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            className="w-full p-2 border border-slate-300 font-mono text-center focus:border-slate-900 outline-none"
                            placeholder="***"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center space-x-2">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider border border-slate-800 transition-colors cursor-pointer"
                        >
                          Save Payment Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCardModal(false)}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase border border-slate-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: VIP Rewards */}
          {activeTab === 'loyalty' && (
            <div className="p-6 bg-white border border-slate-200 space-y-6">
              {/* Header & Status Pill */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-slate-900 uppercase">AURA Rewards Status</h2>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                      (loyaltyData.points ?? loyaltyPoints) >= 5000
                        ? 'bg-slate-900 text-amber-400 border-amber-400'
                        : (loyaltyData.points ?? loyaltyPoints) >= 1500
                        ? 'bg-amber-400 text-slate-900 border-amber-500'
                        : (loyaltyData.points ?? loyaltyPoints) >= 500
                        ? 'bg-slate-200 text-slate-900 border-slate-400'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}>
                      {(loyaltyData.points ?? loyaltyPoints) >= 5000
                        ? 'PLATINUM VIP'
                        : (loyaltyData.points ?? loyaltyPoints) >= 1500
                        ? 'GOLD VIP'
                        : (loyaltyData.points ?? loyaltyPoints) >= 500
                        ? 'SILVER VIP'
                        : 'BRONZE MEMBER'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Earn 10% base points on every order + Automatic High-Value Purchase Bonuses!
                  </p>
                </div>
                <div className="p-4 bg-slate-900 text-white border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Available Balance</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {loyaltyData.points ?? profile?.loyalty_points ?? loyaltyPoints ?? 0} PTS
                  </span>
                </div>
              </div>

              {/* Automatic High-Value Order Bonus Rules */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Automatic High-Value Order Bonuses
                </h3>
                <p className="text-xs text-slate-600">
                  When you make a high-value purchase, bonus points are added automatically to your account balance at checkout!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold font-mono text-slate-500 block uppercase">Silver Tier Order</span>
                    <p className="text-xs font-black text-slate-900">Orders &ge; EGP 1,500</p>
                    <p className="text-xs font-mono font-bold text-emerald-600">+250 Bonus Points</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold font-mono text-slate-500 block uppercase">Gold Tier Order</span>
                    <p className="text-xs font-black text-slate-900">Orders &ge; EGP 3,000</p>
                    <p className="text-xs font-mono font-bold text-amber-600">+600 Bonus Points</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold font-mono text-slate-500 block uppercase">Platinum Tier Order</span>
                    <p className="text-xs font-black text-slate-900">Orders &ge; EGP 5,000</p>
                    <p className="text-xs font-mono font-bold text-purple-600">+1,200 Bonus Points</p>
                  </div>
                </div>
              </div>

              {/* VIP Points Store & Redemption Catalog */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-500" />
                      VIP Points Store & Redemption Catalog
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exchange your points ({loyaltyData.points ?? profile?.loyalty_points ?? loyaltyPoints ?? 0} PTS available) for instant discount vouchers!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewardsCatalog.map((reward) => {
                    const currentBalance = loyaltyData.points ?? profile?.loyalty_points ?? loyaltyPoints ?? 0;
                    const canAfford = currentBalance >= reward.pointsCost;

                    return (
                      <div
                        key={reward.id}
                        className={`p-5 border flex flex-col justify-between space-y-3 transition-all ${
                          canAfford
                            ? "bg-slate-50 border-slate-300 hover:border-slate-900"
                            : "bg-slate-50/50 border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-amber-600 uppercase block">
                              {reward.badge}
                            </span>
                            <h4 className="text-xs font-black text-slate-900 uppercase mt-0.5">
                              {reward.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">
                              {reward.description}
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-slate-900 text-amber-400 font-mono font-black text-xs border border-slate-800 flex-shrink-0">
                            {reward.pointsCost} PTS
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-slate-700">
                            Value: EGP {reward.discountAmount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRedeemReward(reward)}
                            disabled={!canAfford}
                            className={`px-4 py-2 text-xs font-bold uppercase transition-colors border cursor-pointer ${
                              canAfford
                                ? "bg-slate-900 hover:bg-black text-white border-slate-800"
                                : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                            }`}
                          >
                            {canAfford ? "REDEEM VOUCHER" : `NEED ${reward.pointsCost - currentBalance} MORE PTS`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Claimed Vouchers list */}
              {redeemedVouchers.length > 0 && (
                <div className="p-5 bg-slate-900 text-white space-y-3 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-400" />
                    Your Active Claimed Vouchers ({redeemedVouchers.length})
                  </h4>
                  <p className="text-xs text-slate-300">
                    Use these promo codes at checkout to apply your redeemed discount!
                  </p>

                  <div className="space-y-2 pt-1">
                    {redeemedVouchers.map((v, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-800 border border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white uppercase">{v.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">Claimed on {v.date}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <code className="px-3 py-1 bg-black text-amber-400 font-mono font-black border border-slate-700">
                            {v.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(v.code)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === v.code ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-200" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
