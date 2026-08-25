"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useUserOrders, useUserLoyalty, useProducts } from "@/hooks/useStoreData";
import { useUserWishlist } from "@/hooks/useUserData";
import { ProfileHeaderBanner } from "@/components/profile/ProfileHeaderBanner";
import {
  ProfileNavSidebar,
  ProfileTab,
} from "@/components/profile/ProfileNavSidebar";
import { ProfileInfoTab } from "@/components/profile/ProfileInfoTab";
import { ProfileWishlistTab } from "@/components/profile/ProfileWishlistTab";
import { ProfileOrdersTab } from "@/components/profile/ProfileOrdersTab";
import { ProfilePaymentTab } from "@/components/profile/ProfilePaymentTab";
import { ProfileLoyaltyTab } from "@/components/profile/ProfileLoyaltyTab";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loyaltyPoints, clearUser } = useUserStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [mounted, setMounted] = useState(false);

  // React Query cached hooks
  const { data: userOrders = [] } = useUserOrders(profile?.id);
  const { data: fetchedLoyaltyData } = useUserLoyalty(profile?.id);
  const { data: userWishlistRaw = [] } = useUserWishlist(profile?.id);
  const { data: allProducts = [] } = useProducts();

  const [loyaltyDataState, setLoyaltyDataState] = useState<{ points: number; logs: any[] }>({
    points: 0,
    logs: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!profile && mounted) {
      router.push("/login");
    }
  }, [profile, mounted, router]);

  useEffect(() => {
    if (fetchedLoyaltyData && fetchedLoyaltyData.points !== loyaltyDataState.points) {
      setLoyaltyDataState(fetchedLoyaltyData);
    }
  }, [fetchedLoyaltyData?.points]);

  const wishlistProducts = userWishlistRaw
    .map((item: any) => item.products || allProducts.find((p) => p.id === item.product_id || p.id === item))
    .filter(Boolean);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 text-center space-y-4 font-sans text-slate-900">
        <Lock className="w-8 h-8 mx-auto text-slate-900" />
        <h2 className="text-xl font-black uppercase text-slate-900">
          Authentication Required
        </h2>
        <p className="text-xs text-slate-600">
          Please sign in to view your profile and account settings.
        </p>
        <Link
          href="/login"
          className="inline-block w-full py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black border border-slate-800 transition-colors"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearUser();
      const { useCartStore } = await import("@/store/useCartStore");
      useCartStore.getState().setItems([]);
      router.push("/login");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-slate-900">
      {/* Profile Header Banner */}
      <ProfileHeaderBanner
        profile={profile}
        loyaltyPoints={loyaltyPoints}
        loyaltyDataPoints={loyaltyDataState.points}
        onOpenLoyaltyTab={() => setActiveTab("loyalty")}
      />

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <ProfileNavSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          wishlistCount={wishlistProducts.length}
          profile={profile}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeTab === "info" && <ProfileInfoTab profile={profile} />}
          {activeTab === "wishlist" && (
            <ProfileWishlistTab wishlistProducts={wishlistProducts} />
          )}
          {activeTab === "orders" && (
            <ProfileOrdersTab userOrders={userOrders} />
          )}
          {activeTab === "payment" && <ProfilePaymentTab profile={profile} />}
          {activeTab === "loyalty" && (
            <ProfileLoyaltyTab
              profile={profile}
              loyaltyData={loyaltyDataState}
              setLoyaltyData={setLoyaltyDataState}
            />
          )}
        </div>
      </div>
    </div>
  );
}
