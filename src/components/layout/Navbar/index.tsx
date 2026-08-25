"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useCategories } from "@/hooks/useProductsData";
import { useUserAddresses } from "@/hooks/useUserData";
import { Category, UserAddress } from "@/types";
import { getUserCartFromDb } from "@/lib/services/userService";
import { NavbarBrand } from "./NavbarBrand";
import { NavbarSearch } from "./NavbarSearch";
import { NavbarUserMenu } from "./NavbarUserMenu";
import { NavbarSubNav } from "./NavbarSubNav";
import { NavbarMobileDrawer } from "./NavbarMobileDrawer";

export function Navbar() {
  const router = useRouter();
  const { getTotalItems, openCart } = useCartStore();
  const { profile, setProfile, setToken } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Hook-based data fetching (React Query)
  const { data: categories = [] } = useCategories();
  const { data: userAddresses = [] } = useUserAddresses(profile?.id);

  const userAddress: UserAddress | null =
    userAddresses.find((a: UserAddress) => a.is_default) ||
    userAddresses[0] ||
    null;

  const cartCount = getTotalItems();
  const syncedUserIdRef = useRef<string | null>(null);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Sync user session & cart/wishlist
  useEffect(() => {
    async function syncUserData(userId: string) {
      if (!userId || syncedUserIdRef.current === userId) return;
      syncedUserIdRef.current = userId;

      try {
        const cartData = await getUserCartFromDb(userId);

        if (Array.isArray(cartData)) {
          const items = cartData
            .map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              product: item.products,
              quantity: item.quantity,
              selected_variant: item.selected_variant || {},
            }))
            .filter((i) => i.product);
          useCartStore.getState().setItems(items);
        }
      } catch {}
    }

    async function initUserSession() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setToken(session.access_token);
        }

        const user = session?.user;

        if (user) {
          syncUserData(user.id);
          const { data: profData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (!profData) {
            // Profile row deleted from database: clear local session & force redirect
            await supabase.auth.signOut();
            useUserStore.getState().clearUser();
            useCartStore.getState().setItems([]);
            syncedUserIdRef.current = null;
            toast.error("Your account no longer exists. Redirecting to sign in...");
            router.push("/login");
            return;
          }

          const googleName =
            user.user_metadata?.full_name || user.user_metadata?.name;
          const googleAvatar =
            user.user_metadata?.avatar_url || user.user_metadata?.picture;

          setProfile({
            ...profData,
            full_name:
              profData.full_name ||
              googleName ||
              user.email?.split("@")[0] ||
              "User",
            avatar_url: profData.avatar_url || googleAvatar || null,
          });
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === "SIGNED_OUT" || !session) {
              const wasLoggedIn = Boolean(syncedUserIdRef.current);
              setToken(null);
              useUserStore.getState().clearUser();
              useCartStore.getState().setItems([]);
              syncedUserIdRef.current = null;

              if (wasLoggedIn) {
                toast.error("Your session has expired. Please sign in again.");
                router.push("/login");
              }
              return;
            }
            if (session) {
              setToken(session.access_token);
            }
            if (session?.user) {
              const u = session.user;
              syncUserData(u.id);
            }
          },
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (e) {
        console.error("Failed to sync session:", e);
      }
    }
    initUserSession();
  }, [setProfile, setToken]);


  const handleSignOut = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      useUserStore.getState().clearUser();
      useCartStore.getState().setItems([]);
      setAccountDropdownOpen(false);
      setMobileMenuOpen(false);
      window.location.href = "/login";
    }
  };

  // Smart Scroll Header (Hide on Scroll Down, Show on Scroll Up)
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (
        currentScrollY < 60 ||
        mobileMenuOpen ||
        accountDropdownOpen ||
        isSearchFocused
      ) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current + 8) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 8) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen, accountDropdownOpen, isSearchFocused]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full font-sans border-b border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
          isVisible
            ? "translate-y-0 shadow-sm"
            : "-translate-y-full shadow-none pointer-events-none"
        }`}
      >
        {/* TOP MAIN ROW */}
        <div className="bg-white text-slate-900 px-3 sm:px-4 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-slate-200">
          {/* 1. Mobile Menu Toggle, Brand Logo & Deliver To */}
          <NavbarBrand
            profile={profile}
            userAddress={userAddress}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          {/* 2. Central Search Bar */}
          <NavbarSearch
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
          />

          {/* 3. Right User Menu Controls */}
          <NavbarUserMenu
            profile={profile}
            cartCount={cartCount}
            accountDropdownOpen={accountDropdownOpen}
            setAccountDropdownOpen={setAccountDropdownOpen}
            onOpenCart={openCart}
            onSignOut={handleSignOut}
          />
        </div>

        {/* SUB-NAVBAR ROW */}
        <NavbarSubNav
          categories={categories}
          profile={profile}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </header>

      {/* Mobile Drawer Navigation */}
      <NavbarMobileDrawer
        isOpen={mobileMenuOpen}
        categories={categories}
        profile={profile}
        onClose={() => setMobileMenuOpen(false)}
        onSignOut={handleSignOut}
      />
    </>
  );
}
