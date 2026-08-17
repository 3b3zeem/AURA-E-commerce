'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice, formatDate } from '@/lib/utils';
import { User, Heart, Package, Sparkles, LogOut, ShieldCheck, Save, ExternalLink, Lock } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

import { getUserOrders, getUserLoyaltyInfo, getProducts } from '@/lib/services/db';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, wishlistIds, setProfile, clearUser } = useUserStore();

  const [activeTab, setActiveTab] = useState<'info' | 'wishlist' | 'orders' | 'loyalty'>('info');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Data States
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<{ points: number; logs: any[] }>({ points: 0, logs: [] });
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleLogout = () => {
    clearUser();
    router.push('/login');
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
        <div className="flex items-center space-x-4 bg-slate-50 px-5 py-3 border border-slate-200">
          <Sparkles className="w-5 h-5 text-slate-900" />
          <div>
            <span className="text-[10px] text-slate-500 block font-mono uppercase">VIP Points</span>
            <span className="text-base font-black text-slate-900 font-mono">{loyaltyData.points} PTS</span>
          </div>
        </div>
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
            <User className="w-4 h-4 text-slate-900" />
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
              <Heart className="w-4 h-4 text-slate-900" />
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
            <Package className="w-4 h-4 text-slate-900" />
            <span>Order History</span>
          </button>

          <Link
            href="/addresses"
            className="w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          >
            <User className="w-4 h-4 text-slate-900" />
            <span>Your Addresses</span>
          </Link>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`w-full p-3 text-xs font-bold flex items-center space-x-3 transition-colors uppercase border ${
              activeTab === 'loyalty'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
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

          {/* Tab 4: VIP Rewards */}
          {activeTab === 'loyalty' && (
            <div className="p-6 bg-white border border-slate-200 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase">AURA Rewards Status</h2>
                  <p className="text-xs text-slate-600 mt-1">Earn points on every purchase.</p>
                </div>
                <span className="text-2xl font-black text-slate-900 font-mono">{loyaltyData.points} PTS</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Redemption Rules</h4>
                <p className="text-xs text-slate-700">
                  Every 10 points equals $1.00 discount applied directly at checkout.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-700">
                  <span className="bg-white px-3 py-1 border border-slate-300">🛍️ 10% Points per $1 spent</span>
                  <span className="bg-white px-3 py-1 border border-slate-300">⭐ 25 Points per product review</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
