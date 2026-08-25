"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getProducts,
  getProductById,
  createProductInDb,
  updateProductInDb,
  deleteProductInDb,
  getCategories,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  getStories,
  createStoryInDb,
  updateStoryInDb,
  deleteStoryInDb,
  getOffers,
  createOfferInDb,
  updateOfferInDb,
  deleteOfferInDb,
  getBentoItems,
  createBentoItemInDb,
  updateBentoItemInDb,
  deleteBentoItemInDb,
} from "@/lib/services/productsService";
import {
  createReviewInDb,
  approveReviewInDb,
  updateReviewInDb,
  deleteReviewInDb,
} from "@/lib/services/adminService";
import { Product, Category, Story, BentoItem, Offer } from "@/types";

// Generic Fetchers
async function fetchReviews(productId: string) {
  try {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ==========================================
// 1. PRODUCTS QUERY & MUTATIONS
// ==========================================
export function useProducts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["bento"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channelId = `products_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["offers"] });
          queryClient.invalidateQueries({ queryKey: ["bento"] });
          queryClient.invalidateQueries({ queryKey: ["stories"] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useSingleProduct(productId?: string) {
  const query = useQuery<Product | null>({
    queryKey: ["product", productId || ""],
    queryFn: () =>
      productId ? getProductById(productId) : Promise.resolve(null),
    enabled: Boolean(productId),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || null };
}

export function useRecommendationsQuery(
  userCategoryPreferences: string | string[] = [],
) {
  const { data: allProducts, isLoading } = useProducts();

  const categories = Array.isArray(userCategoryPreferences)
    ? userCategoryPreferences
    : userCategoryPreferences
      ? [userCategoryPreferences]
      : [];

  const recommendedProducts = (allProducts || []).filter((p) => {
    if (categories.length === 0)
      return p.is_featured || (p.rating_avg && p.rating_avg >= 4.5);
    return p.category_id && categories.includes(p.category_id);
  });

  return { data: recommendedProducts, isLoading };
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidateAllStoreData = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["offers"] });
    queryClient.invalidateQueries({ queryKey: ["bento"] });
    queryClient.invalidateQueries({ queryKey: ["stories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const addProductMutation = useMutation({
    mutationFn: (data: Partial<Product>) => createProductInDb(data),
    onMutate: async (newProductData) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts =
        queryClient.getQueryData<Product[]>(["products"]) || [];
      const tempId = "temp_" + Date.now();
      const optimisticProduct = {
        id: tempId,
        name: newProductData.name || "New Product",
        description: newProductData.description || "",
        price: newProductData.price || 0,
        images: newProductData.images || [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800",
        ],
        category_id: newProductData.category_id || "all",
        stock: newProductData.stock ?? 10,
        rating_avg: 5.0,
        reviews_count: 0,
        badge: newProductData.badge || "NEW",
        is_flash_deal: newProductData.is_flash_deal || false,
        is_featured: newProductData.is_featured || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Product;

      queryClient.setQueryData<Product[]>(["products"], (old = []) => [
        optimisticProduct,
        ...old,
      ]);
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
      }
    },
    onSettled: () => {
      invalidateAllStoreData();
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      updateProductInDb(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts =
        queryClient.getQueryData<Product[]>(["products"]) || [];

      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
      }
    },
    onSettled: () => {
      invalidateAllStoreData();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts =
        queryClient.getQueryData<Product[]>(["products"]) || [];

      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.filter((p) => p.id !== id),
      );
      return { previousProducts };
    },
    onError: (err, id, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
      }
    },
    onSettled: () => {
      invalidateAllStoreData();
    },
  });

  return { addProductMutation, updateProductMutation, deleteProductMutation };
}

// ==========================================
// 2. CATEGORIES QUERY & MUTATIONS
// ==========================================
export function useCategories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channelId = `categories_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const addCategoryMutation = useMutation({
    mutationFn: (data: Partial<Category>) => createCategoryInDb(data),
    onMutate: async (newCat) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories =
        queryClient.getQueryData<Category[]>(["categories"]) || [];
      const tempCategory = {
        id: "cat_" + Date.now(),
        name: newCat.name || "New Category",
        description: newCat.description || "",
        slug: (newCat.name || "new").toLowerCase().replace(/\s+/g, "-"),
        created_at: new Date().toISOString(),
      } as Category;

      queryClient.setQueryData<Category[]>(["categories"], (old = []) => [
        tempCategory,
        ...old,
      ]);
      return { previousCategories };
    },
    onError: (err, newCat, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      updateCategoryInDb(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories =
        queryClient.getQueryData<Category[]>(["categories"]) || [];

      queryClient.setQueryData<Category[]>(["categories"], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
      return { previousCategories };
    },
    onError: (err, vars, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories =
        queryClient.getQueryData<Category[]>(["categories"]) || [];

      queryClient.setQueryData<Category[]>(["categories"], (old = []) =>
        old.filter((c) => c.id !== id),
      );
      return { previousCategories };
    },
    onError: (err, id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    addCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}

// ==========================================
// 3. STORIES QUERY & MUTATIONS
// ==========================================
export function useStories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channelId = `stories_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stories" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["stories"] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Story[]>({
    queryKey: ["stories"],
    queryFn: () => getStories(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useStoryMutations() {
  const queryClient = useQueryClient();

  const addStoryMutation = useMutation({
    mutationFn: (data: {
      title: string;
      subtitle: string;
      imageUrl: string;
      productIds?: string[];
      bgGradient?: string;
      isActive?: boolean;
    }) =>
      createStoryInDb(
        data.title,
        data.subtitle,
        data.imageUrl,
        data.productIds,
        data.bgGradient,
        data.isActive,
      ),
    onMutate: async (newStory) => {
      await queryClient.cancelQueries({ queryKey: ["stories"] });
      const previousStories =
        queryClient.getQueryData<Story[]>(["stories"]) || [];
      const tempStory: Story = {
        id: "story_" + Date.now(),
        title: newStory.title,
        subtitle: newStory.subtitle,
        image_url: newStory.imageUrl,
        bg_gradient:
          newStory.bgGradient || "from-yellow-950 via-stone-900 to-black",
        is_active: newStory.isActive ?? true,
        display_order: 0,
        products: [],
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Story[]>(["stories"], (old = []) => [
        tempStory,
        ...old,
      ]);
      return { previousStories };
    },
    onError: (err, vars, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(["stories"], context.previousStories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const updateStoryMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Story> & { product_ids?: string[] };
    }) => updateStoryInDb(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["stories"] });
      const previousStories =
        queryClient.getQueryData<Story[]>(["stories"]) || [];

      queryClient.setQueryData<Story[]>(["stories"], (old = []) =>
        old.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
      return { previousStories };
    },
    onError: (err, vars, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(["stories"], context.previousStories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) => deleteStoryInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["stories"] });
      const previousStories =
        queryClient.getQueryData<Story[]>(["stories"]) || [];

      queryClient.setQueryData<Story[]>(["stories"], (old = []) =>
        old.filter((s) => s.id !== id),
      );
      return { previousStories };
    },
    onError: (err, id, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(["stories"], context.previousStories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  return { addStoryMutation, updateStoryMutation, deleteStoryMutation };
}

// ==========================================
// 4. OFFERS QUERY & MUTATIONS
// ==========================================
export function useOffers(overlayOnly = false) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["offers", overlayOnly] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channelId = `offers_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["offers", overlayOnly] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient, overlayOnly]);

  const query = useQuery<Offer[]>({
    queryKey: ["offers", overlayOnly],
    queryFn: () => getOffers(overlayOnly),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useOfferMutations() {
  const queryClient = useQueryClient();

  const addOfferMutation = useMutation({
    mutationFn: (data: Partial<Offer>) => createOfferInDb(data),
    onMutate: async (newOffer) => {
      await queryClient.cancelQueries({ queryKey: ["offers"] });
      const previousOffers =
        queryClient.getQueryData<Offer[]>(["offers", false]) || [];
      const tempOffer: Offer = {
        id: "offer_" + Date.now(),
        title: newOffer.title || "New Exclusive Offer",
        subtitle: newOffer.subtitle || "",
        offer_price: newOffer.offer_price || 0,
        original_price: newOffer.original_price || 0,
        discount_percentage: newOffer.discount_percentage || 0,
        image_url: newOffer.image_url || "",
        badge: newOffer.badge || "LIMITED DEAL",
        is_active: newOffer.is_active ?? true,
        show_in_overlay: newOffer.show_in_overlay ?? false,
        product_ids: newOffer.product_ids || [],
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Offer[]>(["offers", false], (old = []) => [
        tempOffer,
        ...old,
      ]);
      return { previousOffers };
    },
    onError: (err, vars, context) => {
      if (context?.previousOffers) {
        queryClient.setQueryData(["offers", false], context.previousOffers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Offer> }) =>
      updateOfferInDb(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["offers"] });
      const previousOffers =
        queryClient.getQueryData<Offer[]>(["offers", false]) || [];

      queryClient.setQueryData<Offer[]>(["offers", false], (old = []) =>
        old.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      );
      return { previousOffers };
    },
    onError: (err, vars, context) => {
      if (context?.previousOffers) {
        queryClient.setQueryData(["offers", false], context.previousOffers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: (id: string) => deleteOfferInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["offers"] });
      const previousOffers =
        queryClient.getQueryData<Offer[]>(["offers", false]) || [];

      queryClient.setQueryData<Offer[]>(["offers", false], (old = []) =>
        old.filter((o) => o.id !== id),
      );
      return { previousOffers };
    },
    onError: (err, id, context) => {
      if (context?.previousOffers) {
        queryClient.setQueryData(["offers", false], context.previousOffers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });

  return { addOfferMutation, updateOfferMutation, deleteOfferMutation };
}

// ==========================================
// 5. BENTO GRID QUERY & MUTATIONS
// ==========================================
export function useBentoItems() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["bento"] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channelId = `bento_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bento_items" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["bento"] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<BentoItem[]>({
    queryKey: ["bento"],
    queryFn: () => getBentoItems(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useBentoMutations() {
  const queryClient = useQueryClient();

  const addBentoItemMutation = useMutation({
    mutationFn: (data: Partial<BentoItem>) => createBentoItemInDb(data),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["bento"] });
      const previousItems =
        queryClient.getQueryData<BentoItem[]>(["bento"]) || [];
      const tempItem: BentoItem = {
        id: "bento_" + Date.now(),
        box_type: newItem.box_type || "spotlight",
        title: newItem.title || "New Bento Card",
        subtitle: newItem.subtitle || "",
        image_url: newItem.image_url || "",
        display_order: newItem.display_order ?? 0,
        is_active: newItem.is_active ?? true,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<BentoItem[]>(["bento"], (old = []) => [
        tempItem,
        ...old,
      ]);
      return { previousItems };
    },
    onError: (err, vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["bento"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bento"] });
    },
  });

  const updateBentoItemMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<BentoItem>;
    }) => updateBentoItemInDb(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["bento"] });
      const previousItems =
        queryClient.getQueryData<BentoItem[]>(["bento"]) || [];

      queryClient.setQueryData<BentoItem[]>(["bento"], (old = []) =>
        old.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
      return { previousItems };
    },
    onError: (err, vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["bento"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bento"] });
    },
  });

  const deleteBentoItemMutation = useMutation({
    mutationFn: (id: string) => deleteBentoItemInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bento"] });
      const previousItems =
        queryClient.getQueryData<BentoItem[]>(["bento"]) || [];

      queryClient.setQueryData<BentoItem[]>(["bento"], (old = []) =>
        old.filter((item) => item.id !== id),
      );
      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["bento"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bento"] });
    },
  });

  return {
    addBentoItemMutation,
    updateBentoItemMutation,
    deleteBentoItemMutation,
  };
}

// ==========================================
// 6. REVIEWS QUERY & MUTATIONS
// ==========================================
export function useProductReviews(productId: string) {
  const query = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useAddReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData: any) => createReviewInDb(reviewData),
    onSuccess: (_, variables) => {
      if (variables?.product_id || variables?.productId) {
        queryClient.invalidateQueries({
          queryKey: ["reviews", variables.product_id || variables.productId],
        });
      }
    },
  });
}

export function useUpdateReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id?: string;
      review_id?: string;
      product_id?: string;
      is_approved?: boolean;
      rating?: number;
      comment?: string;
    }) => {
      const targetId = args.id || args.review_id || "";
      return updateReviewInDb({
        id: targetId,
        rating: args.rating,
        comment: args.comment,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if (variables?.product_id) {
        queryClient.invalidateQueries({ queryKey: ["reviews", variables.product_id] });
      }
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      args: string | { id?: string; review_id?: string; product_id?: string },
    ) => {
      const targetId =
        typeof args === "string" ? args : args.id || args.review_id || "";
      return deleteReviewInDb(targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
