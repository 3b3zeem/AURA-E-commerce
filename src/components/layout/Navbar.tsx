"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Sparkles,
  MapPin,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  User,
  Zap,
  Flame,
  Clock,
  Trash2,
  LogOut,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { getCategories, getUserAddresses } from "@/lib/services/db";
import { Category, UserAddress } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { UserNotificationCenter } from "@/components/layout/UserNotificationCenter";

export function Navbar() {
  const { getTotalItems, openCart } = useCartStore();
  const { profile } = useUserStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);

  const cartCount = getTotalItems();

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

  const { setProfile, setToken } = useUserStore();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function syncUserData(userId: string) {
      if (!userId || syncedUserIdRef.current === userId) return;
      syncedUserIdRef.current = userId;

      try {
        const [cartRes, wishRes] = await Promise.all([
          fetch(`/api/cart?userId=${userId}`),
          fetch(`/api/wishlists?userId=${userId}`),
        ]);

        if (cartRes.ok) {
          const cartData = await cartRes.json();
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
        }

        if (wishRes.ok) {
          const wishData = await wishRes.json();
          if (Array.isArray(wishData)) {
            const productIds = wishData.map((w: any) => w.product_id);
            useUserStore.getState().setWishlistIds(productIds);
          }
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
            .single();

          const googleName =
            user.user_metadata?.full_name || user.user_metadata?.name;
          const googleAvatar =
            user.user_metadata?.avatar_url || user.user_metadata?.picture;

          if (profData) {
            setProfile({
              ...profData,
              full_name:
                profData.full_name ||
                googleName ||
                user.email?.split("@")[0] ||
                "User",
              avatar_url: profData.avatar_url || googleAvatar || null,
            });
          } else {
            setProfile({
              id: user.id,
              email: user.email || "",
              full_name: googleName || user.email?.split("@")[0] || "User",
              avatar_url: googleAvatar || null,
              phone: null,
              role: user.email?.includes("admin") ? "admin" : "customer",
              loyalty_points: 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }

        // Listen for Google Auth redirects & state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === "SIGNED_OUT" || !session) {
              setToken(null);
              useUserStore.getState().clearUser();
              useCartStore.getState().setItems([]);
              syncedUserIdRef.current = null;
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
  }, [setProfile]);

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  const profileId = profile?.id;

  useEffect(() => {
    async function fetchUserAddress() {
      if (profileId) {
        const addrs = await getUserAddresses();
        if (Array.isArray(addrs) && addrs.length > 0) {
          const def = addrs.find((a: UserAddress) => a.is_default) || addrs[0];
          setUserAddress(def);
        } else {
          setUserAddress(null);
        }
      } else {
        setUserAddress(null);
      }
    }
    fetchUserAddress();

    const handleDataChange = () => {
      fetchUserAddress();
    };

    window.addEventListener("aura_data_changed", handleDataChange);
    return () => {
      window.removeEventListener("aura_data_changed", handleDataChange);
    };
  }, [profileId]);

  // Search States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const hasFetchedTrendingRef = useRef(false);

  // Lazy load Trending ONLY when search input is clicked/focused
  useEffect(() => {
    if (!isSearchFocused || hasFetchedTrendingRef.current) return;
    hasFetchedTrendingRef.current = true;

    async function fetchTrending() {
      try {
        const res = await fetch("/api/trending-searches");
        if (res.ok) {
          const data = await res.json();
          setTrendingSearches(data);
        }
      } catch {
        setTrendingSearches([
          "AURA CyberHeadset",
          "OLED Display",
          "Wireless Audio",
          "Smartwatch Pro",
        ]);
      }
    }
    fetchTrending();
  }, [isSearchFocused]);

  // Click Outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    const updated = [
      clean,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase(),
      ),
    ].slice(0, 5);
    setRecentSearches(updated);

    // Send to trending API in DB
    fetch("/api/trending-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: clean }),
    }).catch(() => {});
  };

  const removeRecentSearch = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
  };

  const executeSearch = (queryToSearch: string) => {
    if (!queryToSearch.trim() && selectedCategory === "all") return;
    saveRecentSearch(queryToSearch);
    setIsSearchFocused(false);
    const url = `/products?search=${encodeURIComponent(queryToSearch)}&category=${selectedCategory}`;
    window.location.href = url;
  };

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full font-sans border-b border-slate-200 bg-white">
      {/* TOP MAIN ROW: Clean Light Header */}
      <div className="bg-white text-slate-900 px-3 sm:px-4 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-slate-200">
        {/* 1. Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="sm:hidden p-1.5 text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Open Mobile Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link
            href="/"
            className="flex items-center space-x-2 px-1 py-1 hover:opacity-95 flex-shrink-0 border border-transparent hover:border-black"
          >
            <img
              src="/logo.png"
              alt="AURA Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-cover border border-slate-900"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none font-mono">
                aura
              </span>
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                Luxury Tech
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Deliver To Location Picker */}
        {!profile ? (
          <Link
            href="/login?redirect=/addresses"
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 border border-rose-300 hover:border-rose-500 bg-rose-50 cursor-pointer transition-all flex-shrink-0"
            title="Sign In to Set Address"
          >
            <MapPin className="w-4 h-4 text-rose-600 mt-1" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">
                Login Required
              </span>
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Set Your Delivery Location
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/addresses"
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 border border-slate-300 hover:border-slate-900 cursor-pointer transition-all flex-shrink-0 bg-slate-50"
          >
            <MapPin className="w-4 h-4 text-slate-900 mt-1" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-slate-500">
                Deliver to {userAddress?.full_name?.split(" ")[0] || profile?.full_name?.split(" ")[0] || "User"}
              </span>
              <span
                className="text-xs font-bold text-slate-800 tracking-tight truncate max-w-[130px]"
                title={
                  userAddress
                    ? `${userAddress.street_address}, ${userAddress.city}`
                    : "Add Delivery Address"
                }
              >
                {userAddress
                  ? `${userAddress.city}${userAddress.state_region ? `, ${userAddress.state_region}` : ""}`
                  : "Set Location..."}
              </span>
            </div>
          </Link>
        )}

        {/* 3. Central Search Bar (Desktop & Tablet) */}
        <div
          ref={searchContainerRef}
          className="relative order-3 sm:order-none w-full sm:w-auto sm:flex-1 sm:max-w-2xl lg:max-w-3xl z-40"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center h-9 sm:h-10 bg-slate-100 text-slate-900 border border-slate-300 transition-all focus-within:border-slate-900"
          >
            {/* Custom Category Dropdown Selector */}
            <div className="hidden sm:flex items-center">
              <CustomSelect
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                options={[
                  { value: "all", label: "All" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                triggerClassName="h-10 bg-slate-200 border-0 border-r border-slate-300 hover:bg-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>

            {/* Search Input Text Box */}
            <input
              type="text"
              placeholder="Search AURA products..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium h-full bg-transparent"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-slate-900 hover:bg-black text-white px-3 sm:px-4 h-full flex items-center justify-center transition-colors font-bold flex-shrink-0 cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </form>

          {/* Interactive Recent & Trending Searches Dropdown */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 z-50 overflow-hidden font-sans text-slate-900 p-4 space-y-4 shadow-none"
              >
                {/* 1. Trending Searches */}
                {trendingSearches.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {trendingSearches.map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            executeSearch(term);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-300 text-xs font-bold uppercase transition-colors flex items-center space-x-1 cursor-pointer text-slate-800"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. 🕒 Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-slate-900" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearAllRecent}
                        className="text-[10px] text-slate-500 hover:text-slate-900 underline font-bold uppercase cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1 pt-1">
                      {recentSearches.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSearchQuery(item);
                            executeSearch(item);
                          }}
                          className="flex items-center justify-between px-3 py-2 hover:bg-slate-100 border border-transparent hover:border-slate-300 text-xs font-semibold cursor-pointer group transition-all"
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
                            <span className="text-slate-800">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, item)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {recentSearches.length === 0 &&
                  trendingSearches.length === 0 && (
                    <div className="py-4 text-center text-xs font-bold text-slate-500 uppercase">
                      Type a query or press Enter to search products
                    </div>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Right Controls */}
        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0 text-xs">
          {/* Accounts & Lists Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex flex-col text-left px-2 py-1.5 border border-transparent hover:border-slate-900 leading-tight transition-all cursor-pointer"
            >
              <span className="text-[10px] text-slate-500">
                Hello, {profile?.full_name?.split(" ")[0] || "Sign in"}
              </span>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-0.5">
                Account & Lists{" "}
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </span>
            </button>

            {/* Dropdown Menu */}
            {accountDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white text-slate-800 border border-slate-300 py-2 z-50 text-xs space-y-1">
                {profile ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-200">
                      <p className="font-bold text-slate-900">
                        {profile.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {profile.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-100 font-bold text-slate-800"
                    >
                      Your Account & Rewards
                    </Link>
                    <Link
                      href="/order-tracking"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-100 font-bold text-slate-800"
                    >
                      Your Orders & Tracking
                    </Link>
                    {profile.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2 bg-slate-900 text-white font-bold hover:bg-black border-t border-slate-800"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-white" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-rose-600 font-bold hover:bg-rose-50 border-t border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="p-3 text-center space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="block w-full py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs border border-slate-800"
                    >
                      Sign In
                    </Link>
                    <span className="text-[11px] text-slate-500 block">
                      New customer?{" "}
                      <Link
                        href="/register"
                        className="font-bold underline text-slate-900"
                      >
                        Start here.
                      </Link>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orders Quick Link */}
          <Link
            href="/order-tracking"
            className="hidden md:flex flex-col text-left px-2 py-1.5 border border-transparent hover:border-slate-300 leading-tight"
          >
            <span className="text-[10px] text-slate-500">Returns</span>
            <span className="text-xs font-bold text-slate-900">& Orders</span>
          </Link>

          {/* USER NOTIFICATION CENTER BELL */}
          <UserNotificationCenter />

          {/* Cart Icon & Counter */}
          <button
            onClick={openCart}
            className="flex items-center space-x-1 px-2.5 py-1.5 border border-transparent hover:border-slate-900 font-bold relative transition-all cursor-pointer"
            aria-label="Shopping Bag"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-slate-900" />
              <span className="absolute -top-1.5 -right-1 text-white font-black text-xs font-mono bg-slate-900 px-1 border border-slate-800">
                {cartCount}
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-slate-900 font-bold self-end mb-0.5">
              Cart
            </span>
          </button>
        </div>
      </div>

      {/* SUB-NAVBAR ROW: Clean Sub-Bar */}
      <div className="bg-slate-50 text-slate-700 px-3 py-1.5 flex items-center justify-between text-xs overflow-x-auto font-medium border-t border-slate-200">
        <div className="flex items-center space-x-4 whitespace-nowrap">
          {/* Side Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center space-x-1 px-2 py-1 border border-transparent hover:border-slate-900 font-bold text-slate-800 cursor-pointer"
          >
            <Menu className="w-4 h-4 text-slate-900" />
            <span>All</span>
          </button>

          {/* Join VIP Pill */}
          <Link
            href="/profile"
            className="px-2.5 py-0.5 bg-slate-900 text-white font-bold text-[11px] hover:bg-black transition-colors border border-slate-800"
          >
            AURA VIP
          </Link>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="px-2 py-1 bg-slate-900 text-white border border-slate-800 font-bold hover:bg-black transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          {/* Today's Deals */}
          <Link
            href="/offers"
            className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
            <span>Offers & Bundles</span>
          </Link>

          <Link
            href="/products?flash=true"
            className="px-2 py-1 border border-transparent hover:border-amber-500 font-bold text-amber-700 flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Today's Deals</span>
          </Link>

          {/* Dynamic Categories Links */}
          <Link
            href="/products"
            className="px-2 py-1 border border-transparent hover:border-slate-300 text-slate-800 hover:text-slate-900 font-bold"
          >
            All Products
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="px-2 py-1 border border-transparent hover:border-slate-300 text-slate-700 hover:text-slate-900 font-medium"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 bg-white text-slate-900 h-full border-r border-slate-300 flex flex-col z-10 overflow-y-auto">
            <div className="bg-slate-100 text-slate-900 p-4 flex items-center justify-between border-b border-slate-300">
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-slate-900" />
                <span className="font-bold text-sm">
                  Hello, {profile?.full_name || "Sign in"}
                </span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-slate-500 hover:text-slate-900" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs font-semibold text-slate-800">
              <div>
                <h4 className="text-slate-500 font-bold uppercase text-[11px] mb-2">
                  Shop By Department
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-2 hover:bg-slate-100 border-b border-slate-200"
                  >
                    Full Product Catalog
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 hover:bg-slate-100 border-b border-slate-200"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-300 pt-4">
                <h4 className="text-slate-500 font-bold uppercase text-[11px] mb-2">
                  Settings & Account
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-2 hover:bg-slate-100"
                  >
                    Your Account
                  </Link>
                  <Link
                    href="/order-tracking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-2 hover:bg-slate-100"
                  >
                    Order Tracking
                  </Link>
                  {profile?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 bg-slate-900 text-white font-bold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {profile ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left p-2 text-rose-600 font-bold hover:bg-rose-50 flex items-center space-x-1.5 border-t border-slate-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 text-slate-900 font-bold underline"
                    >
                      Sign In / Register
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
