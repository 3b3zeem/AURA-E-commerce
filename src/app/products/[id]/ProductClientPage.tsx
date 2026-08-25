"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, UserAddress } from "@/types";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductBundleWizard } from "@/components/product/ProductBundleWizard";
import { ProductCarouselSection } from "@/components/product/ProductCarouselSection";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useUserWishlist } from "@/hooks/useUserData";
import {
  useSingleProduct,
  useProducts,
  useUserAddresses,
  useProductReviews,
} from "@/hooks/useStoreData";
import {
  getStoredGovernorates,
  getActiveGovernorate,
  setActiveGovernorate,
} from "@/lib/shipping";
import toast from "react-hot-toast";
import { RefreshCw, ChevronRight } from "lucide-react";
import { ExpressBuyModal } from "@/components/checkout/ExpressBuyModal";
import { trackProductView } from "@/lib/analytics/tracker";
import { createClient } from "@/lib/supabase/client";

import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfoCenter } from "@/components/product/ProductInfoCenter";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";

export default function ProductClientPage({ productId }: { productId: string }) {
  // React Query cached hooks
  const { data: product, isLoading: loadingProduct } = useSingleProduct(productId);
  const { data: allProducts = [] } = useProducts();
  const { data: userAddresses = [] } = useUserAddresses();

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [selectedProtectionPlan] = useState<string | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>(() =>
    getActiveGovernorate()
  );
  const [storedGovs, setStoredGovs] = useState(() => getStoredGovernorates());
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [, setIsLocationModalOpen] = useState(false);

  const handleSetGovernorate = (gov: string) => {
    setSelectedGovernorate(gov);
    setActiveGovernorate(gov);
  };

  useEffect(() => {
    setStoredGovs(getStoredGovernorates());
    const handleGovChange = () => setStoredGovs(getStoredGovernorates());
    window.addEventListener("aura_governorates_changed", handleGovChange);
    return () =>
      window.removeEventListener("aura_governorates_changed", handleGovChange);
  }, []);

  useEffect(() => {
    if (Array.isArray(userAddresses) && userAddresses.length > 0) {
      const def = userAddresses.find((a: UserAddress) => a.is_default) || userAddresses[0];
      setSelectedAddress(def);
      const govName = def.state_region || def.city;
      if (govName) handleSetGovernorate(govName);
    }
  }, [userAddresses]);

  const { addItem } = useCartStore();
  const { profile } = useUserStore();
  const { data: wishlistRaw = [], addToWishlistMutation, removeFromWishlistMutation } = useUserWishlist(profile?.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || "");
      const initialVariants: Record<string, string> = {};
      product.variants?.forEach((v: any) => {
        if (v.options.length > 0) initialVariants[v.name] = v.options[0];
      });
      setSelectedVariants(initialVariants);

      try {
        trackProductView(product.id, product.name, product.price);
      } catch {}
    }
  }, [product]);

  const [boughtAlsoBought, setBoughtAlsoBought] = useState<Product[]>([]);
  const [inspiredProducts, setInspiredProducts] = useState<Product[]>([]);
  const [viewedHistoryProducts, setViewedHistoryProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (allProducts.length === 0 || !product) return;
    const currId = product.id;

    async function loadRecommendationSections() {
      const supabase = createClient();

      try {
        const { data: matchedOrders } = await supabase
          .from("order_items")
          .select("order_id")
          .eq("product_id", currId);

        if (matchedOrders && matchedOrders.length > 0) {
          const orderIds = matchedOrders.map((o: any) => o.order_id);
          const { data: coItems } = await supabase
            .from("order_items")
            .select("product_id")
            .in("order_id", orderIds)
            .neq("product_id", currId);

          if (coItems && coItems.length > 0) {
            const freq: Record<string, number> = {};
            coItems.forEach((ci: any) => {
              if (ci.product_id) freq[ci.product_id] = (freq[ci.product_id] || 0) + 1;
            });
            const sortedIds = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
            const coProducts = sortedIds
              .map((id) => allProducts.find((p) => p.id === id))
              .filter((p): p is Product => Boolean(p));

            setBoughtAlsoBought(coProducts);
          }
        }
      } catch (err) {
        console.error("Error loading co-purchases from Supabase:", err);
      }

      try {
        const { data: searchEvents } = await supabase
          .from("analytics_events")
          .select("meta")
          .eq("event_type", "search_query")
          .order("timestamp", { ascending: false })
          .limit(20);

        if (searchEvents && searchEvents.length > 0) {
          const queries = searchEvents
            .map((e: any) => e.meta?.query)
            .filter((q): q is string => Boolean(q) && typeof q === "string");

          if (queries.length > 0) {
            const searchMatches = allProducts.filter((p) => {
              if (p.id === currId) return false;
              const text = `${p.name} ${p.brand || ""} ${p.category?.name || ""} ${p.description || ""}`.toLowerCase();
              return queries.some((q) => text.includes(q.toLowerCase()));
            });

            setInspiredProducts(searchMatches);
          }
        }
      } catch (err) {
        console.error("Error loading search inspiration from Supabase:", err);
      }

      try {
        const { data: viewEvents } = await supabase
          .from("analytics_events")
          .select("meta")
          .eq("event_type", "product_view")
          .order("timestamp", { ascending: false })
          .limit(30);

        if (viewEvents && viewEvents.length > 0) {
          const viewedIds: string[] = [];
          viewEvents.forEach((ev: any) => {
            const pid = ev.meta?.product_id;
            if (pid && pid !== currId && !viewedIds.includes(pid)) {
              viewedIds.push(pid);
            }
          });

          const visited = viewedIds
            .map((id) => allProducts.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p));

          setViewedHistoryProducts(visited);
        }
      } catch (err) {
        console.error("Error loading product view history from Supabase:", err);
      }
    }

    loadRecommendationSections();
  }, [allProducts, product]);

  const { data: productReviews = [] } = useProductReviews(product?.id || "");
  const dynamicReviewsCount =
    productReviews.length > 0 ? productReviews.length : (product?.reviews_count || 0);

  const dynamicRatingAvg =
    productReviews.length > 0
      ? (
          productReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
          productReviews.length
        ).toFixed(1)
      : dynamicReviewsCount > 0
      ? (product?.rating_avg || 0)
      : 0;

  const handleSearchThisPage = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Page link copied to clipboard!", {
        style: {
          background: "#0f172a",
          color: "#fff",
          fontSize: "12px",
          borderRadius: "9999px",
        },
      });
    }
  };

  if (loadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-900 font-sans space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900" />
        <p className="text-xs uppercase font-bold text-slate-600">
          Loading Product Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-900 font-sans space-y-4">
        <h1 className="text-2xl font-black uppercase text-slate-900">
          Product Not Found
        </h1>
        <Link
          href="/products"
          className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase border border-slate-800 inline-block hover:bg-black transition-colors"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isLiked =
    Boolean(product) &&
    Array.isArray(wishlistRaw) &&
    wishlistRaw.some(
      (w: any) =>
        w.product_id === product?.id || w.id === product?.id || w === product?.id
    );

  const handleToggleWishlist = (productId: string) => {
    if (!profile?.id) return;
    if (isLiked) {
      removeFromWishlistMutation.mutate({ userId: profile.id, productId });
    } else {
      addToWishlistMutation.mutate({ userId: profile.id, productId });
    }
  };
  const discount = product.original_price
    ? calculateDiscountPercentage(product.original_price, product.price)
    : 0;

  const defaultProtectionPlans = [
    { id: "plan_1", name: "1-Year Extended Warranty by Boxi", price: 56 },
    { id: "plan_2", name: "2-Year Extended Warranty by Boxi", price: 89 },
    { id: "plan_3", name: "1-Year Accidental Damage Protection", price: 97 },
  ];
  const protectionPlans =
    product.protection_plans && product.protection_plans.length > 0
      ? product.protection_plans
      : defaultProtectionPlans;

  const handleAddToCart = () => {
    const chosenPlan = protectionPlans.find((p) => p.id === selectedProtectionPlan);
    const finalVariants = { ...selectedVariants };
    if (chosenPlan) {
      finalVariants["Protection Plan"] = `${chosenPlan.name} (+${formatPrice(chosenPlan.price)})`;
    }

    const itemToAdd = chosenPlan
      ? { ...product, price: product.price + chosenPlan.price }
      : product;

    addItem(itemToAdd, quantity, finalVariants);

    toast.success(
      `Added ${quantity}x ${product.name} to cart!${chosenPlan ? ` (Includes ${chosenPlan.name})` : ""}`,
      {
        style: {
          background: "#0f172a",
          color: "#ffffff",
          borderRadius: "0px",
          fontSize: "12px",
          fontWeight: "bold",
        },
      }
    );
  };

  const techSpecs = product.specs || {};
  const aboutHighlights = Array.isArray(product.highlights) ? product.highlights : [];
  const relatedCategoryDeals = allProducts.filter(
    (p) => p.id !== product.id && p.category_id === product.category_id
  );
  const displayCategoryDeals =
    relatedCategoryDeals.length > 0
      ? relatedCategoryDeals
      : allProducts.filter((p) => p.id !== product.id);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-6 space-y-10 text-slate-900 font-sans">
      {/* 1. Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 uppercase font-bold tracking-tight">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/products" className="hover:text-slate-900 transition-colors">
          Catalog
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="hover:text-slate-900 transition-colors">
          {product.category?.name || "Hardware"}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-black truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </div>

      {/* 2. Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <ProductGallery
          images={product.images}
          productName={product.name}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          discount={discount}
          badge={product.badge}
        />

        <ProductInfoCenter
          product={product}
          dynamicRatingAvg={dynamicRatingAvg}
          dynamicReviewsCount={dynamicReviewsCount}
          discount={discount}
          selectedVariants={selectedVariants}
          setSelectedVariants={setSelectedVariants}
          handleSearchThisPage={handleSearchThisPage}
          techSpecs={techSpecs}
          aboutHighlights={aboutHighlights}
        />

        <ProductBuyBox
          product={product}
          quantity={quantity}
          setQuantity={setQuantity}
          selectedGovernorate={selectedGovernorate}
          storedGovs={storedGovs}
          selectedAddress={selectedAddress}
          setIsLocationModalOpen={setIsLocationModalOpen}
          handleAddToCart={handleAddToCart}
          setIsExpressModalOpen={setIsExpressModalOpen}
          isLiked={isLiked}
          toggleWishlist={handleToggleWishlist}
        />
      </div>

      {/* 3. Bundle Wizard */}
      <ProductBundleWizard currentProduct={product} allProducts={allProducts} />

      
      {displayCategoryDeals.length > 0 && (
        <ProductCarouselSection
          title={`More In ${product.category?.name || "Category"}`}
          subtitle="Recommended alternatives from our catalog"
          products={displayCategoryDeals}
        />
      )}

      {/* 4. Product Tabs */}
      <ProductTabs product={product} />

      {/* 5. Recommended Carousels */}
      {boughtAlsoBought.length > 0 && (
        <ProductCarouselSection
          title="Customers Who Bought This Item Also Bought"
          subtitle="Real-time co-purchases from customer orders"
          products={boughtAlsoBought}
        />
      )}

      {inspiredProducts.length > 0 && (
        <ProductCarouselSection
          title="Inspired by your search history"
          subtitle="Based on your search activity"
          products={inspiredProducts}
        />
      )}

      {viewedHistoryProducts.length > 0 && (
        <ProductCarouselSection
          title="Your Browsing History"
          subtitle="Recently viewed hardware items"
          products={viewedHistoryProducts}
        />
      )}

      {/* Express Buy Modal */}
      {isExpressModalOpen && (
        <ExpressBuyModal
          product={product}
          quantity={quantity}
          isOpen={isExpressModalOpen}
          onClose={() => setIsExpressModalOpen(false)}
        />
      )}
    </div>
  );
}
