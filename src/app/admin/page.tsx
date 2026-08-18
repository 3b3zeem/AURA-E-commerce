"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useUserStore } from "@/store/useUserStore";
import {
  getProducts,
  getCategories,
  getStories,
  getUsersFromDb,
  updateUserRoleInDb,
  createProductInDb,
  updateProductInDb,
  deleteProductInDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  createStoryInDb,
  updateStoryInDb,
  deleteStoryInDb,
  deleteUserInDb,
  deleteOrderInDb,
  deleteTrendingSearch,
  getOrdersFromDb,
  updateOrderStatusInDb,
  getAdminTrendingSearches,
  getAdminAddresses,
  getAdminPromoCodes,
  getOffers,
  createOfferInDb,
  updateOfferInDb,
  deleteOfferInDb,
  getNewsletterSubscribers,
} from "@/lib/services/db";
import { Product, Category, Story, Profile, Offer, NewsletterSubscriber } from "@/types";
import { CheckCircle2 } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabsNav, AdminTab } from "@/components/admin/AdminTabsNav";
import { AdminProductsTab } from "@/components/admin/AdminProductsTab";
import { AdminOffersTab } from "@/components/admin/AdminOffersTab";
import { AdminNewsletterTab } from "@/components/admin/AdminNewsletterTab";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminCategoriesTab } from "@/components/admin/AdminCategoriesTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminStoriesTab } from "@/components/admin/AdminStoriesTab";
import { AdminBentoTab } from "@/components/admin/AdminBentoTab";
import { AdminPromoTab } from "@/components/admin/AdminPromoTab";
import { AdminTrendingTab } from "@/components/admin/AdminTrendingTab";
import { AdminAddressesTab } from "@/components/admin/AdminAddressesTab";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminModals } from "@/components/admin/AdminModals";

const ALL_ADMIN_TABS: AdminTab[] = [
  "products",
  "offers",
  "newsletter",
  "bento",
  "orders",
  "categories",
  "users",
  "stories",
  "trending",
  "addresses",
  "promos",
  "analytics",
];

export default function AdminDashboardPage() {
  const { profile, setProfile } = useUserStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  const isAdmin = profile?.role === "admin";

  // Data States loaded live from Supabase DB
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [storiesList, setStoriesList] = useState<Story[]>([]);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [trendingList, setTrendingList] = useState<any[]>([]);
  const [addressesList, setAddressesList] = useState<any[]>([]);
  const [promosList, setPromosList] = useState<any[]>([]);
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [subscribersList, setSubscribersList] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals visibility
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isAddTrendingOpen, setIsAddTrendingOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("299.99");
  const [newProdOrigPrice, setNewProdOrigPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdBadge, setNewProdBadge] = useState("NEW");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdImage, setNewProdImage] = useState(
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  );
  const [newProdImages, setNewProdImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  ]);
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [newProdFlashDeal, setNewProdFlashDeal] = useState(false);
  const [newProdBrand, setNewProdBrand] = useState("AURA Official");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdTargetGender, setNewProdTargetGender] = useState("unisex");
  const [newProdOriginCountry, setNewProdOriginCountry] = useState("");
  const [newProdShelfLife, setNewProdShelfLife] = useState("");
  const [newProdKeyBenefits, setNewProdKeyBenefits] = useState("");
  const [newProdHighlights, setNewProdHighlights] = useState("");
  const [newProdUsage, setNewProdUsage] = useState("");
  const [newProdCare, setNewProdCare] = useState("");
  const [newProdPackageIncludes, setNewProdPackageIncludes] = useState("");
  const [newProdDeliveryInfo, setNewProdDeliveryInfo] = useState("");
  const [newProdReturnPolicy, setNewProdReturnPolicy] = useState("");

  // New Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [newCatFeatured, setNewCatFeatured] = useState(false);

  // New Story Form State
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStorySub, setNewStorySub] = useState("");
  const [newStoryImg, setNewStoryImg] = useState(
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
  );

  // New Trending Keyword State
  const [newTrendingQuery, setNewTrendingQuery] = useState("");

  // New Offer Form State (Empty by default)
  const [newOfferTitle, setNewOfferTitle] = useState("");
  const [newOfferSub, setNewOfferSub] = useState("");
  const [newOfferDesc, setNewOfferDesc] = useState("");
  const [newOfferBadge, setNewOfferBadge] = useState("");
  const [newOfferImage, setNewOfferImage] = useState("");
  const [newOfferOrigPrice, setNewOfferOrigPrice] = useState("");
  const [newOfferPrice, setNewOfferPrice] = useState("");
  const [newOfferSelectedProductIds, setNewOfferSelectedProductIds] = useState<string[]>([]);
  const [newOfferOverlay, setNewOfferOverlay] = useState(false);

  // Editing Item States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Load live data from Supabase DB on mount
  const refreshData = async () => {
    setLoading(true);
    const [prods, cats, stors, usrs, ords, trend, addrs, prmos, offs, subs] =
      await Promise.all([
        getProducts(),
        getCategories(),
        getStories(),
        getUsersFromDb(),
        getOrdersFromDb(),
        getAdminTrendingSearches(),
        getAdminAddresses(),
        getAdminPromoCodes(),
        getOffers(),
        getNewsletterSubscribers(),
      ]);

    setProductsList(prods);
    setCategoriesList(cats);
    setStoriesList(stors);
    setUsersList(usrs);
    setOrdersList(ords);
    setTrendingList(trend);
    setAddressesList(addrs);
    setPromosList(prmos);
    setOffersList(offs);
    setSubscribersList(subs);

    if (cats.length > 0) setNewProdCategory(cats[0].id);
    setLoading(false);
  };

  const changeTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get("tab") as AdminTab;
      if (tabFromUrl && ALL_ADMIN_TABS.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64Url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (
      isAddProductOpen ||
      isAddCategoryOpen ||
      isAddStoryOpen ||
      isAddTrendingOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAddProductOpen, isAddCategoryOpen, isAddStoryOpen, isAddTrendingOpen]);

  // Promote current logged in user to Admin
  const handleMakeMeAdmin = () => {
    if (profile) {
      const updated = { ...profile, role: "admin" as const };
      setProfile(updated);
      updateUserRoleInDb(profile.id, "admin");
      showNotification("Success: Your profile role was updated to Admin");
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    toast.success(msg, {
      style: {
        background: "#0f172a",
        color: "#ffffff",
        borderRadius: "0px",
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
        border: "1px solid #1e293b",
      },
      iconTheme: {
        primary: "#10b981",
        secondary: "#ffffff",
      },
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handlers for Products
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createProductInDb({
        name: newProdName,
        description: newProdDesc || "Premium Monochrome AURA item.",
        price: parseFloat(newProdPrice),
        original_price: newProdOrigPrice
          ? parseFloat(newProdOrigPrice)
          : undefined,
        stock: parseInt(newProdStock) || 10,
        category_id: newProdCategory || categoriesList[0]?.id || undefined,
        images: newProdImages.filter(Boolean).length > 0 ? newProdImages.filter(Boolean) : [newProdImage],
        in_stock: true,
        rating_avg: 5.0,
        badge: newProdBadge || "NEW",
        is_featured: newProdFeatured,
        is_flash_deal: newProdFlashDeal,
        brand: newProdBrand || "AURA Official",
        sku: newProdSku || undefined,
        target_gender: newProdTargetGender || "unisex",
        origin_country: newProdOriginCountry || undefined,
        shelf_life: newProdShelfLife || undefined,
        key_benefits: newProdKeyBenefits || undefined,
        highlights: newProdHighlights
          ? newProdHighlights.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        usage_instructions: newProdUsage || undefined,
        care_instructions: newProdCare || undefined,
        package_includes: newProdPackageIncludes
          ? newProdPackageIncludes.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        delivery_info: newProdDeliveryInfo || undefined,
        return_policy: newProdReturnPolicy || undefined,
      });

      showNotification(
        `Product "${newProdName}" added successfully to Supabase!`,
      );
      await refreshData();

      setNewProdName("");
      setNewProdDesc("");
      setNewProdPrice("299.99");
      setNewProdOrigPrice("");
      setNewProdStock("10");
      setNewProdBadge("NEW");
      setNewProdFeatured(false);
      setNewProdFlashDeal(false);
      setNewProdBrand("AURA Official");
      setNewProdSku("");
      setNewProdTargetGender("unisex");
      setNewProdOriginCountry("");
      setNewProdShelfLife("");
      setNewProdKeyBenefits("");
      setNewProdHighlights("");
      setNewProdUsage("");
      setNewProdCare("");
      setNewProdPackageIncludes("");
      setNewProdDeliveryInfo("");
      setNewProdReturnPolicy("");
      setIsAddProductOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await updateProductInDb(editingProduct.id, editingProduct);
      if (res) {
        showNotification(`Product "${editingProduct.name}" updated!`);
        await refreshData();
        setEditingProduct(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmWithToast = (title: string, onConfirm: () => Promise<void>) => {
    toast(
      (t) => (
        <div className="space-y-2 font-sans text-slate-900">
          <p className="text-xs font-black uppercase text-slate-900">{title}</p>
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await onConfirm();
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
        position: "top-center",
        style: {
          background: "#ffffff",
          border: "2px solid #0f172a",
          borderRadius: "0px",
          padding: "16px 24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          minWidth: "300px",
          textAlign: "center",
        },
      },
    );
  };

  const handleDeleteProduct = async (id: string) => {
    confirmWithToast("Delete this Product?", async () => {
      try {
        setActionLoadingId(id);
        const success = await deleteProductInDb(id);
        if (success) {
          setProductsList((prev) => prev.filter((p) => p.id !== id));
          showNotification("Product removed from database.");
        }
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Handlers for Categories
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const generatedSlug =
        newCatSlug ||
        newCatName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-");
      const newCat = await createCategoryInDb({
        name: newCatName,
        slug: generatedSlug,
        description: newCatDesc,
        image_url: newCatImage,
        is_featured: newCatFeatured,
      });

      if (newCat) {
        showNotification(`Category "${newCatName}" added to database!`);
        await refreshData();
      }

      setNewCatName("");
      setNewCatSlug("");
      setNewCatDesc("");
      setNewCatImage("");
      setNewCatFeatured(false);
      setIsAddCategoryOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await updateCategoryInDb(editingCategory.id, editingCategory);
      if (res) {
        showNotification(`Category "${editingCategory.name}" updated!`);
        await refreshData();
        setEditingCategory(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    confirmWithToast("Delete this Category?", async () => {
      try {
        setActionLoadingId(id);
        const success = await deleteCategoryInDb(id);
        if (success) {
          showNotification("Category deleted successfully.");
          await refreshData();
        } else {
          showNotification("Failed to delete category.");
        }
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Handlers for Stories
  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newStor = await createStoryInDb(
        newStoryTitle,
        newStorySub,
        newStoryImg,
      );
      if (newStor) {
        showNotification(`Campaign Story "${newStoryTitle}" published!`);
        await refreshData();
      }

      setNewStoryTitle("");
      setNewStorySub("");
      setIsAddStoryOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await updateStoryInDb(editingStory.id, editingStory);
      if (res) {
        showNotification(`Story "${editingStory.title}" updated!`);
        await refreshData();
        setEditingStory(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    confirmWithToast("Delete this Campaign Story?", async () => {
      try {
        setActionLoadingId(id);
        const success = await deleteStoryInDb(id);
        if (success) {
          showNotification("Story removed from database.");
          await refreshData();
        }
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Handlers for Users
  const toggleUserRole = async (user: Profile) => {
    try {
      setActionLoadingId(user.id);
      const newRole = user.role === "admin" ? "customer" : "admin";
      const success = await updateUserRoleInDb(user.id, newRole);
      if (success) {
        showNotification(`Updated role for ${user.full_name} to ${newRole}`);
        await refreshData();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    confirmWithToast("Delete this User Profile?", async () => {
      try {
        setActionLoadingId(userId);
        const success = await deleteUserInDb(userId);
        if (success) {
          showNotification("User account removed.");
          await refreshData();
        }
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Handlers for Orders
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      setActionLoadingId(orderId);
      const success = await updateOrderStatusInDb(orderId, status);
      if (success) {
        showNotification(
          `Order #${orderId.slice(0, 8)} status updated to ${status}`,
        );
        await refreshData();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    confirmWithToast(`Delete Order #${orderId.slice(0, 8)}?`, async () => {
      try {
        setActionLoadingId(orderId);
        const success = await deleteOrderInDb(orderId);
        if (success) {
          toast.success(`Order #${orderId.slice(0, 8)} removed successfully`, {
            style: {
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: "0px",
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              border: "1px solid #1e293b",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          });
          await refreshData();
        } else {
          toast.error("Failed to remove order from database");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to remove order");
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Handlers for Offers & Bundles
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle || !newOfferPrice || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await createOfferInDb({
        title: newOfferTitle,
        subtitle: newOfferSub || null,
        description: newOfferDesc || null,
        badge: newOfferBadge || "SPECIAL BUNDLE",
        image_url: newOfferImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
        original_price: parseFloat(newOfferOrigPrice || newOfferPrice),
        offer_price: parseFloat(newOfferPrice),
        product_ids: newOfferSelectedProductIds,
        show_in_overlay: newOfferOverlay,
        is_active: true,
      });

      if (res) {
        showNotification(`Offer bundle "${newOfferTitle}" created successfully!`);
        setIsAddOfferOpen(false);
        setNewOfferTitle("");
        setNewOfferSub("");
        setNewOfferDesc("");
        setNewOfferSelectedProductIds([]);
        await refreshData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await updateOfferInDb(editingOffer.id, editingOffer);
      if (res) {
        showNotification(`Offer bundle "${editingOffer.title}" updated!`);
        setEditingOffer(null);
        await refreshData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    confirmWithToast("Delete this Offer bundle?", async () => {
      try {
        setActionLoadingId(id);
        const success = await deleteOfferInDb(id);
        if (success) {
          showNotification("Offer bundle deleted.");
          await refreshData();
        }
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Handlers for Trending Searches
  const handleAddTrending = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrendingQuery || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await fetch("/api/admin/trending-searches", {
        method: "POST",
        headers: {
          "x-admin-key": "aura-admin-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: newTrendingQuery }),
      });

      showNotification(`Added "${newTrendingQuery}" to Trending Searches!`);
      setNewTrendingQuery("");
      setIsAddTrendingOpen(false);
      await refreshData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrending = async (id: string) => {
    confirmWithToast("Delete Search Keyword?", async () => {
      try {
        setActionLoadingId(id);
        const success = await deleteTrendingSearch(id);
        if (success) {
          toast.success("Search term removed");
          await refreshData();
        }
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans min-h-screen pb-16">
      <Toaster position="top-center" />
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-white text-slate-900 px-4 py-3 border border-slate-200 border-l-4 border-l-slate-900 flex items-center space-x-2 text-xs font-bold uppercase"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN HEADER */}
      <AdminHeader isAdmin={isAdmin} onMakeMeAdmin={handleMakeMeAdmin} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB NAVIGATION GRID */}
        <AdminTabsNav
          activeTab={activeTab}
          onTabChange={changeTab}
          productsCount={productsList.length}
          ordersCount={ordersList.length}
          categoriesCount={categoriesList.length}
          usersCount={usersList.length}
          storiesCount={storiesList.length}
          trendingCount={trendingList.length}
          addressesCount={addressesList.length}
          promosCount={promosList.length}
          offersCount={offersList.length}
          subscribersCount={subscribersList.length}
        />

        {/* ACTIVE TAB CONTENTS */}
        {activeTab === "products" && (
          <AdminProductsTab
            productsList={productsList}
            categoriesList={categoriesList}
            actionLoadingId={actionLoadingId}
            onOpenAddModal={() => setIsAddProductOpen(true)}
            onEditProduct={(p) => setEditingProduct(p)}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === "offers" && (
          <AdminOffersTab
            offersList={offersList}
            productsList={productsList}
            actionLoadingId={actionLoadingId}
            onOpenAddModal={() => {
              setNewOfferTitle("");
              setNewOfferSub("");
              setNewOfferDesc("");
              setNewOfferBadge("");
              setNewOfferImage("");
              setNewOfferOrigPrice("");
              setNewOfferPrice("");
              setNewOfferSelectedProductIds([]);
              setNewOfferOverlay(false);
              setIsAddOfferOpen(true);
            }}
            onEditOffer={(o) => setEditingOffer(o)}
            onDeleteOffer={handleDeleteOffer}
            onRefresh={refreshData}
            onNotify={showNotification}
          />
        )}

        {activeTab === "newsletter" && (
          <AdminNewsletterTab onNotify={showNotification} onRefresh={refreshData} />
        )}

        {activeTab === "orders" && (
          <AdminOrdersTab
            ordersList={ordersList}
            actionLoadingId={actionLoadingId}
            onOrderStatusChange={handleOrderStatusChange}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeTab === "categories" && (
          <AdminCategoriesTab
            categoriesList={categoriesList}
            actionLoadingId={actionLoadingId}
            onOpenAddModal={() => setIsAddCategoryOpen(true)}
            onEditCategory={(c) => setEditingCategory(c)}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === "users" && (
          <AdminUsersTab
            usersList={usersList}
            actionLoadingId={actionLoadingId}
            onToggleUserRole={toggleUserRole}
            onDeleteUser={handleDeleteUser}
            onRefresh={refreshData}
            onNotify={showNotification}
          />
        )}

        {activeTab === "stories" && (
          <AdminStoriesTab
            storiesList={storiesList}
            actionLoadingId={actionLoadingId}
            onOpenAddModal={() => setIsAddStoryOpen(true)}
            onEditStory={(s) => setEditingStory(s)}
            onDeleteStory={handleDeleteStory}
          />
        )}

        {activeTab === "bento" && (
          <AdminBentoTab
            onRefresh={refreshData}
            onNotify={showNotification}
            onFileUpload={handleFileUpload}
          />
        )}

        {activeTab === "promos" && (
          <AdminPromoTab
            promosList={promosList}
            onRefresh={refreshData}
            onNotify={showNotification}
          />
        )}

        {activeTab === "trending" && (
          <AdminTrendingTab
            trendingList={trendingList}
            actionLoadingId={actionLoadingId}
            onOpenAddModal={() => setIsAddTrendingOpen(true)}
            onDeleteTrending={handleDeleteTrending}
            onRefresh={refreshData}
            onNotify={showNotification}
          />
        )}

        {activeTab === "addresses" && (
          <AdminAddressesTab
            addressesList={addressesList}
            onRefresh={refreshData}
            onNotify={showNotification}
          />
        )}

        {activeTab === "analytics" && (
          <AdminAnalyticsTab
            productsCount={productsList.length}
            usersCount={usersList.length}
            ordersCount={ordersList.length}
          />
        )}
      </div>

      {/* ALL CREATE & EDIT MODALS */}
      <AdminModals
        categoriesList={categoriesList}
        productsList={productsList}
        isSubmitting={isSubmitting}
        onFileUpload={handleFileUpload}
        isAddProductOpen={isAddProductOpen}
        onCloseAddProduct={() => setIsAddProductOpen(false)}
        newProdName={newProdName}
        setNewProdName={setNewProdName}
        newProdDesc={newProdDesc}
        setNewProdDesc={setNewProdDesc}
        newProdPrice={newProdPrice}
        setNewProdPrice={setNewProdPrice}
        newProdOrigPrice={newProdOrigPrice}
        setNewProdOrigPrice={setNewProdOrigPrice}
        newProdStock={newProdStock}
        setNewProdStock={setNewProdStock}
        newProdBadge={newProdBadge}
        setNewProdBadge={setNewProdBadge}
        newProdCategory={newProdCategory}
        setNewProdCategory={setNewProdCategory}
        newProdImage={newProdImage}
        setNewProdImage={setNewProdImage}
        newProdImages={newProdImages}
        setNewProdImages={setNewProdImages}
        newProdFeatured={newProdFeatured}
        setNewProdFeatured={setNewProdFeatured}
        newProdFlashDeal={newProdFlashDeal}
        setNewProdFlashDeal={setNewProdFlashDeal}
        newProdBrand={newProdBrand}
        setNewProdBrand={setNewProdBrand}
        newProdSku={newProdSku}
        setNewProdSku={setNewProdSku}
        newProdTargetGender={newProdTargetGender}
        setNewProdTargetGender={setNewProdTargetGender}
        newProdOriginCountry={newProdOriginCountry}
        setNewProdOriginCountry={setNewProdOriginCountry}
        newProdShelfLife={newProdShelfLife}
        setNewProdShelfLife={setNewProdShelfLife}
        newProdKeyBenefits={newProdKeyBenefits}
        setNewProdKeyBenefits={setNewProdKeyBenefits}
        newProdHighlights={newProdHighlights}
        setNewProdHighlights={setNewProdHighlights}
        newProdUsage={newProdUsage}
        setNewProdUsage={setNewProdUsage}
        newProdCare={newProdCare}
        setNewProdCare={setNewProdCare}
        newProdPackageIncludes={newProdPackageIncludes}
        setNewProdPackageIncludes={setNewProdPackageIncludes}
        newProdDeliveryInfo={newProdDeliveryInfo}
        setNewProdDeliveryInfo={setNewProdDeliveryInfo}
        newProdReturnPolicy={newProdReturnPolicy}
        setNewProdReturnPolicy={setNewProdReturnPolicy}
        onAddProductSubmit={handleAddProduct}
        isAddCategoryOpen={isAddCategoryOpen}
        onCloseAddCategory={() => setIsAddCategoryOpen(false)}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        newCatSlug={newCatSlug}
        setNewCatSlug={setNewCatSlug}
        newCatDesc={newCatDesc}
        setNewCatDesc={setNewCatDesc}
        newCatImage={newCatImage}
        setNewCatImage={setNewCatImage}
        newCatFeatured={newCatFeatured}
        setNewCatFeatured={setNewCatFeatured}
        onAddCategorySubmit={handleAddCategory}
        isAddStoryOpen={isAddStoryOpen}
        onCloseAddStory={() => setIsAddStoryOpen(false)}
        newStoryTitle={newStoryTitle}
        setNewStoryTitle={setNewStoryTitle}
        newStorySub={newStorySub}
        setNewStorySub={setNewStorySub}
        newStoryImg={newStoryImg}
        setNewStoryImg={setNewStoryImg}
        onAddStorySubmit={handleAddStory}
        isAddTrendingOpen={isAddTrendingOpen}
        onCloseAddTrending={() => setIsAddTrendingOpen(false)}
        newTrendingQuery={newTrendingQuery}
        setNewTrendingQuery={setNewTrendingQuery}
        onAddTrendingSubmit={handleAddTrending}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        onUpdateProductSubmit={handleUpdateProduct}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        onUpdateCategorySubmit={handleUpdateCategory}
        editingStory={editingStory}
        setEditingStory={setEditingStory}
        onUpdateStorySubmit={handleUpdateStory}
        isAddOfferOpen={isAddOfferOpen}
        onCloseAddOffer={() => setIsAddOfferOpen(false)}
        newOfferTitle={newOfferTitle}
        setNewOfferTitle={setNewOfferTitle}
        newOfferSub={newOfferSub}
        setNewOfferSub={setNewOfferSub}
        newOfferDesc={newOfferDesc}
        setNewOfferDesc={setNewOfferDesc}
        newOfferBadge={newOfferBadge}
        setNewOfferBadge={setNewOfferBadge}
        newOfferImage={newOfferImage}
        setNewOfferImage={setNewOfferImage}
        newOfferOrigPrice={newOfferOrigPrice}
        setNewOfferOrigPrice={setNewOfferOrigPrice}
        newOfferPrice={newOfferPrice}
        setNewOfferPrice={setNewOfferPrice}
        newOfferSelectedProductIds={newOfferSelectedProductIds}
        setNewOfferSelectedProductIds={setNewOfferSelectedProductIds}
        newOfferOverlay={newOfferOverlay}
        setNewOfferOverlay={setNewOfferOverlay}
        onAddOfferSubmit={handleAddOffer}
        editingOffer={editingOffer}
        setEditingOffer={setEditingOffer}
        onUpdateOfferSubmit={handleUpdateOffer}
      />
    </div>
  );
}
