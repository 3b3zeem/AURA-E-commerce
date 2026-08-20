"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getProductById,
  getProducts,
  getUserAddresses,
} from "@/lib/services/db";
import { Product, UserAddress } from "@/types";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductBundleWizard } from "@/components/product/ProductBundleWizard";
import { ProductCarouselSection } from "@/components/product/ProductCarouselSection";
import { ProductDiscountCountdown } from "@/components/product/ProductDiscountCountdown";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  calculateExpressDelivery,
  getStoredGovernorates,
  getShippingFee,
  getActiveGovernorate,
  setActiveGovernorate,
} from "@/lib/shipping";
import toast from "react-hot-toast";
import {
  Star,
  Heart,
  Truck,
  RefreshCw,
  Lock,
  RotateCcw,
  Banknote,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  MapPin,
  X,
} from "lucide-react";
import { ExpressBuyModal } from "@/components/checkout/ExpressBuyModal";
import { trackProductView } from "@/lib/analytics/tracker";
import { createClient } from "@/lib/supabase/client";
import { useProductReviews } from "@/hooks/useStoreData";

export default function ProductClientPage({
  productId,
}: {
  productId: string;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [selectedProtectionPlan, setSelectedProtectionPlan] = useState<
    string | null
  >(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>(() =>
    getActiveGovernorate(),
  );
  const [storedGovs, setStoredGovs] = useState(() => getStoredGovernorates());
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null,
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

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
    async function loadUserAddresses() {
      try {
        const addrs = await getUserAddresses();
        if (Array.isArray(addrs) && addrs.length > 0) {
          setSavedAddresses(addrs);
          const def = addrs.find((a: UserAddress) => a.is_default) || addrs[0];
          setSelectedAddress(def);
          const govName = def.state_region || def.city;
          if (govName) {
            handleSetGovernorate(govName);
          }
        }
      } catch {}
    }
    loadUserAddresses();
  }, []);

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useUserStore();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [productId]);

  const [boughtAlsoBought, setBoughtAlsoBought] = useState<Product[]>([]);
  const [inspiredProducts, setInspiredProducts] = useState<Product[]>([]);
  const [viewedHistoryProducts, setViewedHistoryProducts] = useState<Product[]>(
    [],
  );

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const [prod, catalog] = await Promise.all([
        getProductById(productId),
        getProducts(),
      ]);

      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.images[0] || "");
        const initialVariants: Record<string, string> = {};
        prod.variants?.forEach((v: any) => {
          if (v.options.length > 0) initialVariants[v.name] = v.options[0];
        });
        setSelectedVariants(initialVariants);

        try {
          trackProductView(prod.id, prod.name, prod.price);
        } catch {}
      }
      if (Array.isArray(catalog)) {
        setAllProducts(catalog);
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (allProducts.length === 0 || !product) return;
    const currId = product.id;

    async function loadRecommendationSections() {
      const supabase = createClient();

      // 1. Customers who bought this item also bought (Pure Supabase DB query on order_items)
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
              if (ci.product_id) {
                freq[ci.product_id] = (freq[ci.product_id] || 0) + 1;
              }
            });
            const sortedIds = Object.keys(freq).sort(
              (a, b) => freq[b] - freq[a],
            );
            const coProducts = sortedIds
              .map((id) => allProducts.find((p) => p.id === id))
              .filter((p): p is Product => Boolean(p));

            setBoughtAlsoBought(coProducts);
          } else {
            setBoughtAlsoBought([]);
          }
        } else {
          setBoughtAlsoBought([]);
        }
      } catch (err) {
        console.error("Error loading co-purchases from Supabase:", err);
        setBoughtAlsoBought([]);
      }

      // 2. Inspired by your browsing history (Pure Supabase DB query on analytics_events for search_query)
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
              const text =
                `${p.name} ${p.brand || ""} ${p.category?.name || ""} ${p.description || ""}`.toLowerCase();
              return queries.some((q) => text.includes(q.toLowerCase()));
            });

            setInspiredProducts(searchMatches);
          } else {
            setInspiredProducts([]);
          }
        } else {
          setInspiredProducts([]);
        }
      } catch (err) {
        console.error("Error loading search inspiration from Supabase:", err);
        setInspiredProducts([]);
      }

      // 3. Your Browsing History (Pure Supabase DB query on analytics_events for product_view)
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
        } else {
          setViewedHistoryProducts([]);
        }
      } catch (err) {
        console.error("Error loading product view history from Supabase:", err);
        setViewedHistoryProducts([]);
      }
    }

    loadRecommendationSections();
  }, [allProducts, product]);

  const { data: productReviews = [] } = useProductReviews(product?.id || "");
  const dynamicRatingAvg = productReviews.length > 0
    ? (productReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / productReviews.length).toFixed(1)
    : (product?.rating_avg || 0);

  const dynamicReviewsCount = productReviews.length > 0
    ? productReviews.length
    : (product?.reviews_count || 0);

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

  if (loading) {
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

  const isLiked = isInWishlist(product.id);
  const discount = product.original_price
    ? calculateDiscountPercentage(product.original_price, product.price)
    : 0;

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Product link copied to clipboard!", {
        style: {
          background: "#0f172a",
          color: "#ffffff",
          borderRadius: "0px",
          fontSize: "12px",
          fontWeight: "bold",
        },
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddToCart = () => {
    const chosenPlan = protectionPlans.find(
      (p) => p.id === selectedProtectionPlan,
    );
    const finalVariants = { ...selectedVariants };
    if (chosenPlan) {
      finalVariants["Protection Plan"] =
        `${chosenPlan.name} (+${formatPrice(chosenPlan.price)})`;
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
      },
    );
  };

  // Technical Specs from Supabase JSONB
  const techSpecs = product.specs || {};

  // Highlights / About this item from Supabase ARRAY or JSONB
  const aboutHighlights = Array.isArray(product.highlights)
    ? product.highlights
    : [];

  // Bank Promotions (Coupons) from Supabase JSONB
  const bankPromos = product.bank_promos || [];

  // Protection Plans (Extended Warranties) with fallback to default Boxi plans
  const defaultProtectionPlans = [
    {
      id: "plan_1",
      name: "1-Year Extended Warranty by Boxi (Email delivery)",
      price: 56,
    },
    {
      id: "plan_2",
      name: "2-Year Extended Warranty by Boxi (E-mail delivery)",
      price: 89,
    },
    {
      id: "plan_3",
      name: "1-Year Accidental Damage Protection by Boxi (Email Delivery)",
      price: 97,
    },
  ];
  const protectionPlans =
    product.protection_plans && product.protection_plans.length > 0
      ? product.protection_plans
      : defaultProtectionPlans;

  // Related products from Supabase DB by matching category_id
  const relatedCategoryDeals = allProducts.filter(
    (p) => p.id !== product.id && p.category_id === product.category_id,
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
        <Link
          href="/products"
          className="hover:text-slate-900 transition-colors"
        >
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

      {/* 2. Main Product Details Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (4 Cols on LG) */}
        <div className="lg:col-span-4 flex flex-col-reverse sm:flex-row gap-3 items-start lg:sticky  top-24">
          {/* Vertical Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-2 max-h-[500px] w-full sm:w-auto shrink-0 overflow-y-auto py-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 bg-white border transition-all cursor-pointer overflow-hidden ${
                    selectedImage === img
                      ? "border-slate-900 border-2 shadow-sm scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Display Image */}
          <div className="relative aspect-square w-full flex-1 bg-white border border-slate-200 overflow-hidden group">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 uppercase border border-rose-700 shadow-md">
                -{discount}% OFF
              </span>
            )}
            {product.badge && (
              <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase border border-amber-600 shadow-md">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Center Column: Product Specs & Information (5 Cols on LG) */}
        <div className="lg:col-span-5 space-y-5 border-b lg:border-b-0 border-slate-200 pb-6 lg:pb-0">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Brand:{" "}
              <strong className="text-slate-900">
                {product.brand || "AURA Flagship"}
              </strong>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1">
              {product.name}
            </h1>

            {/* Ratings, Reviews & Search link */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <div className="flex items-center text-amber-500">
                <span className="font-black mr-1 text-slate-900">
                  {dynamicRatingAvg}
                </span>
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              </div>
              <span className="text-slate-600 font-bold">
                ({dynamicReviewsCount} verified ratings)
              </span>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleSearchThisPage}
                className="text-slate-600 hover:text-slate-900 underline font-semibold cursor-pointer"
              >
                Search this page
              </button>
            </div>
          </div>

          {/* Pricing & Installments Banner */}
          <div className="space-y-2 pb-4 border-b border-slate-200">
            <div className="flex items-baseline gap-3">
              {discount > 0 && (
                <span className="text-lg font-black text-rose-600">
                  -{discount}%
                </span>
              )}
              <span className="text-2xl font-black text-slate-900 font-mono">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-xs font-semibold line-through text-slate-600 font-mono">
                  List Price: {formatPrice(product.original_price)}
                </span>
              )}
            </div>

            {/* Live Discount Offer Countdown Timer */}
            {(discount > 0 || product.discount_ends_at || product.is_flash_deal) && (
              <ProductDiscountCountdown
                targetDate={product.discount_ends_at || product.flash_deal_ends_at}
                discountPercent={discount}
              />
            )}

            {/* Monthly Payment Plan / Installments */}
            <div className="text-xs text-slate-700 flex items-center gap-1.5 pt-1 border-t border-slate-100 font-medium">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Or <strong>{formatPrice(Math.round(product.price / 3))}</strong>
                /month x 3 months at 0% interest.
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold uppercase pt-0.5">
              <span className="text-emerald-700">FREE Returns</span>
              <span>•</span>
              <span>All prices include VAT</span>
            </div>
          </div>

          {/* 5 Trust Badges Grid */}
          <div className="grid grid-cols-5 gap-1.5 py-3 border-y border-slate-200 text-center text-[10px] font-bold text-slate-700">
            <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
              <Banknote className="w-4 h-4 text-slate-900" />
              <span>Cash on Delivery</span>
            </div>
            <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
              <RotateCcw className="w-4 h-4 text-slate-900" />
              <span>15 Days Returnable</span>
            </div>
            <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
              <Truck className="w-4 h-4 text-slate-900" />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-slate-900" />
              <span>Delivered by AURA</span>
            </div>
            <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
              <Lock className="w-4 h-4 text-slate-900" />
              <span>Secure Transaction</span>
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              {product.variants.map((v) => (
                <div key={v.name} className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase block">
                    {v.name}:{" "}
                    <strong className="text-slate-950">
                      {selectedVariants[v.name] || "Select"}
                    </strong>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setSelectedVariants({
                            ...selectedVariants,
                            [v.name]: opt,
                          })
                        }
                        className={`px-3 py-1.5 text-xs font-bold uppercase border transition-all cursor-pointer ${
                          selectedVariants[v.name] === opt
                            ? "bg-slate-900 text-white border-slate-800 shadow-sm"
                            : "bg-white text-slate-700 border-slate-300 hover:border-slate-900"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Technical Specifications Summary */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-black uppercase text-slate-800 block">
              Technical Specifications
            </span>
            <div className="bg-white border border-slate-200 text-xs divide-y divide-slate-100">
              {Object.entries(techSpecs)
                .slice(0, 5)
                .map(([key, val]) => (
                  <div key={key} className="grid grid-cols-2 p-2">
                    <span className="font-bold text-slate-600">{key}</span>
                    <span className="text-slate-900 font-medium">{val}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* About This Item Bullet List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-black uppercase text-slate-800 block">
              About this item
            </span>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-1 leading-relaxed">
              {aboutHighlights.map((hl, idx) => (
                <li key={idx} className="text-slate-800">
                  <span className="font-semibold text-slate-900">{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Desktop Buy Box (3 Cols on LG) - Matches Image 3 */}
        <div className="lg:col-span-3 bg-white border border-slate-300 p-4 space-y-3.5 sticky top-24 shadow-sm text-slate-900">
          <div className="space-y-1.5 pb-3 border-b border-slate-200">
            <span className="text-2xl font-black text-slate-900 font-mono block">
              {formatPrice(product.price)}
            </span>
            <span className="text-[11px] font-bold text-slate-700 uppercase block tracking-wider">
              FREE Returns
            </span>
            {(() => {
              const est = calculateExpressDelivery(
                17,
                selectedGovernorate,
                storedGovs,
              );
              const shipInfo = getShippingFee(
                selectedGovernorate,
                product.price,
              );
              return (
                <div className="space-y-1.5 mt-2 text-xs">
                  <p className="text-slate-900">
                    {shipInfo.isFree ? (
                      <>
                        FREE delivery{" "}
                        <strong className="font-bold text-slate-950">
                          {est.formattedStandardDate}
                        </strong>
                      </>
                    ) : (
                      <>
                        Shipping:{" "}
                        <strong className="font-bold">
                          {formatPrice(shipInfo.fee)}
                        </strong>{" "}
                        • Delivery by{" "}
                        <strong className="font-bold text-slate-950">
                          {est.formattedStandardDate}
                        </strong>
                      </>
                    )}
                  </p>

                  <p className="text-slate-800 text-xs">
                    Or fastest delivery{" "}
                    <strong className="font-bold text-slate-950">
                      {est.deliveryText}
                    </strong>
                    . Order within{" "}
                    <span className="text-slate-900 font-bold">
                      {est.formattedCountdown}
                    </span>
                  </p>

                  {/* Deliver to address line button */}
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-1 text-xs text-slate-900 hover:text-black font-semibold pt-1 underline transition-colors cursor-pointer group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-900 shrink-0 group-hover:text-black" />
                    <span className="truncate">
                      Deliver to{" "}
                      {selectedAddress
                        ? `${selectedAddress.full_name?.split(" ")[0] || "User"} - ${selectedAddress.city || selectedAddress.state_region}`
                        : selectedGovernorate}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Stock Status Alert */}
          <div>
            {product.stock > 5 ? (
              <span className="text-xs font-bold uppercase text-slate-900 block tracking-wider">
                In Stock
              </span>
            ) : product.stock > 0 ? (
              <span className="text-xs font-black text-slate-900 uppercase block bg-slate-100 p-2 border border-slate-300">
                Only {product.stock} left in stock - order soon.
              </span>
            ) : (
              <span className="text-xs font-black text-slate-900 uppercase block bg-slate-100 p-2 border border-slate-300">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity Selector using CustomSelect */}
          <div className="space-y-1">
            <CustomSelect
              value={String(quantity)}
              onChange={(val) => setQuantity(Number(val))}
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => ({
                value: String(num),
                label: `Quantity: ${num}`,
              }))}
              className="w-full"
              triggerClassName="w-full justify-between py-2 text-xs font-bold"
            />
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="w-full h-10 bg-slate-950 hover:bg-black text-white rounded-none font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] uppercase tracking-wider"
            >
              <span>Add to cart</span>
            </button>

            <button
              onClick={() => setIsExpressModalOpen(true)}
              className="w-full h-10 bg-white hover:bg-slate-100 text-slate-950 border border-slate-900 rounded-none font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] uppercase tracking-wider"
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* Shipper & Payment Information */}
          <div className="text-[11px] space-y-1.5 pt-3 border-t border-slate-200 text-slate-600 font-medium">
            <div className="grid grid-cols-2">
              <span className="text-slate-500">Shipper / Seller</span>
              <span className="font-bold text-slate-900 text-right">
                AURA.eg
              </span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-slate-500">Payment</span>
              <span className="font-bold text-slate-900 hover:underline cursor-pointer text-right">
                Secure transaction
              </span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-slate-500">Customer service</span>
              <span className="font-bold text-slate-900 hover:underline cursor-pointer text-right">
                AURA.eg
              </span>
            </div>
          </div>

          {/* Wishlist Button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-full py-2 px-3 border text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isLiked
                  ? "bg-black text-white border-black"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`}
              />
              <span>
                {isLiked ? "Added to Wishlist" : "Add to List / Wishlist"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Frequently Bought Together Bundle Savings Wizard */}
      <div className="pt-6 border-t border-slate-200">
        <ProductBundleWizard
          currentProduct={product}
          allProducts={allProducts}
        />
      </div>

      {/* 4. Explore top deals in related categories */}
      <ProductCarouselSection
        title="Explore top deals in related categories"
        subtitle="Hand-picked flash deals and category bestsellers with extra savings"
        actionLink={{
          href: `/products?category=${encodeURIComponent(product.category_id || product.category?.id || "all")}`,
          label: "See all deals",
        }}
        products={displayCategoryDeals}
      />

      {/* 5. Tabs: Technical Specifications & Customer Reviews */}
      <div className="pt-8 border-t border-slate-200">
        <ProductTabs product={product} />
      </div>

      {/* 6. Customers who bought this item also bought */}
      <ProductCarouselSection
        title="Customers who bought this item also bought"
        subtitle="Frequently paired products bought by AURA shoppers"
        products={boughtAlsoBought}
      />

      {/* 7. Inspired by your browsing history (Search queries) */}
      <ProductCarouselSection
        title="Inspired by your browsing history"
        subtitle="Recommendations based on your search queries and interests"
        products={inspiredProducts}
      />

      {/* 8. Your Browsing History */}
      <ProductCarouselSection
        title="Your Browsing History"
        subtitle="Products you recently viewed on AURA"
        products={viewedHistoryProducts}
      />

      {/* Express Buy Modal */}
      {(() => {
        const chosenPlan = protectionPlans.find(
          (p) => p.id === selectedProtectionPlan,
        );
        const activeVariants = chosenPlan
          ? {
              ...selectedVariants,
              "Protection Plan": `${chosenPlan.name} (+${formatPrice(chosenPlan.price)})`,
            }
          : selectedVariants;
        const activeProduct = chosenPlan
          ? { ...product, price: product.price + chosenPlan.price }
          : product;

        return (
          <ExpressBuyModal
            product={activeProduct}
            quantity={quantity}
            selectedVariants={activeVariants}
            isOpen={isExpressModalOpen}
            onClose={() => setIsExpressModalOpen(false)}
          />
        );
      })()}

      {/* Choose Your Delivery Location Overlay Modal - Matches Image 4 */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 animate-scaleUp text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Choose your delivery location
              </h3>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Delivery options and delivery speeds may vary for different
              locations
            </p>

            {/* Saved Addresses List */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        if (addr.state_region || addr.city) {
                          handleSetGovernorate(addr.state_region || addr.city);
                        }
                        setIsLocationModalOpen(false);
                      }}
                      className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-slate-900 bg-slate-50 shadow-xs"
                          : "border-slate-200 hover:border-slate-400 bg-white"
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900 leading-snug">
                        {addr.full_name}{" "}
                        {addr.building_no ? `${addr.building_no} ` : ""}
                        {addr.street_address}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {addr.building_no ? `${addr.building_no}, ` : ""}
                        {addr.city} {addr.state_region}
                      </div>
                      {addr.is_default && (
                        <span className="text-[11px] font-bold text-slate-700 block mt-1.5">
                          Default address
                        </span>
                      )}
                    </div>
                  );
                })}

                <Link
                  href="/addresses"
                  className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 hover:underline block pt-1"
                >
                  Manage address book
                </Link>
              </div>
            )}

            {savedAddresses.length > 0 && (
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-400 font-bold uppercase">
                  or
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
            )}

            {/* Governorate Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Select your Governorate
              </label>
              <CustomSelect
                value={selectedGovernorate}
                onChange={(val) => {
                  handleSetGovernorate(val);
                  setIsLocationModalOpen(false);
                }}
                placeholder="Select your Governorate"
                options={storedGovs.map((g) => ({
                  value: g.name,
                  label: `${g.nameAr} (${g.name}) - ${g.fee === 0 ? "Free" : formatPrice(g.fee)}`,
                }))}
                triggerClassName="w-full justify-between py-2.5 text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
