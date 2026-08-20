'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getProducts,
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
  getOrdersFromDb,
  updateOrderStatusInDb,
  deleteOrderInDb,
  getUsersFromDb,
  getAdminPromoCodes,
} from '@/lib/services/db';
import { Product, Category, Story, BentoItem, Offer, Profile } from '@/types';

// Generic Fetchers
async function fetchBentoItems(): Promise<BentoItem[]> {
  try {
    const res = await fetch('/api/bento');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

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
// 1. PRODUCTS QUERY & OPTIMISTIC MUTATIONS
// ==========================================
export function useProducts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['bento'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channelId = `products_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['offers'] });
        queryClient.invalidateQueries({ queryKey: ['bento'] });
        queryClient.invalidateQueries({ queryKey: ['stories'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => getProducts(),
    staleTime: 1000 * 30, // 30s cache for ultra fast instant renders
  });

  return { ...query, data: query.data || [] };
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidateAllStoreData = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['offers'] });
    queryClient.invalidateQueries({ queryKey: ['bento'] });
    queryClient.invalidateQueries({ queryKey: ['stories'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const addProductMutation = useMutation({
    mutationFn: (data: Partial<Product>) => createProductInDb(data),
    onMutate: async (newProductData) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']) || [];
      const tempId = 'temp_' + Date.now();
      const optimisticProduct = {
        id: tempId,
        name: newProductData.name || 'New Product',
        description: newProductData.description || '',
        price: newProductData.price || 0,
        images: newProductData.images || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'],
        category_id: newProductData.category_id || 'all',
        stock: newProductData.stock ?? 10,
        rating_avg: 5.0,
        reviews_count: 0,
        badge: newProductData.badge || 'NEW',
        is_flash_deal: newProductData.is_flash_deal || false,
        is_featured: newProductData.is_featured || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Product;

      queryClient.setQueryData<Product[]>(['products'], (old = []) => [optimisticProduct, ...old]);
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
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
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']) || [];

      queryClient.setQueryData<Product[]>(['products'], (old = []) =>
        old.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      invalidateAllStoreData();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']) || [];

      queryClient.setQueryData<Product[]>(['products'], (old = []) =>
        old.filter((p) => p.id !== id)
      );
      return { previousProducts };
    },
    onError: (err, id, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      invalidateAllStoreData();
    },
  });

  return { addProductMutation, updateProductMutation, deleteProductMutation };
}

// ==========================================
// 2. CATEGORIES QUERY & OPTIMISTIC MUTATIONS
// ==========================================
export function useCategories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_categories_query_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Category[]>({
    queryKey: ['categories'],
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
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previousCategories = queryClient.getQueryData<Category[]>(['categories']) || [];
      const tempCategory = {
        id: 'cat_' + Date.now(),
        name: newCat.name || 'New Category',
        description: newCat.description || '',
        created_at: new Date().toISOString(),
      } as Category;

      queryClient.setQueryData<Category[]>(['categories'], (old = []) => [...old, tempCategory]);
      return { previousCategories };
    },
    onError: (err, newCat, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      updateCategoryInDb(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previousCategories = queryClient.getQueryData<Category[]>(['categories']) || [];
      queryClient.setQueryData<Category[]>(['categories'], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      return { previousCategories };
    },
    onError: (err, vars, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previousCategories = queryClient.getQueryData<Category[]>(['categories']) || [];
      queryClient.setQueryData<Category[]>(['categories'], (old = []) =>
        old.filter((c) => c.id !== id)
      );
      return { previousCategories };
    },
    onError: (err, id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return { addCategoryMutation, updateCategoryMutation, deleteCategoryMutation };
}

// ==========================================
// 3. STORIES QUERY & MUTATIONS
// ==========================================
export function useStories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_stories_query_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        queryClient.invalidateQueries({ queryKey: ['stories'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Story[]>({
    queryKey: ['stories'],
    queryFn: () => getStories(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useStoryMutations() {
  const queryClient = useQueryClient();

  const addStoryMutation = useMutation({
    mutationFn: (data: Partial<Story>) =>
      createStoryInDb(data.title || '', data.subtitle || '', data.image_url || ''),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const updateStoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Story> }) =>
      updateStoryInDb(id, updates),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) => deleteStoryInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      const previousStories = queryClient.getQueryData<Story[]>(['stories']) || [];
      queryClient.setQueryData<Story[]>(['stories'], (old = []) =>
        old.filter((s) => s.id !== id)
      );
      return { previousStories };
    },
    onError: (err, id, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(['stories'], context.previousStories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  return { addStoryMutation, updateStoryMutation, deleteStoryMutation };
}

// ==========================================
// 4. BENTO ITEMS QUERY
// ==========================================
export function useBentoItems() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['bento'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_bento_query_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bento_items' }, () => {
        queryClient.invalidateQueries({ queryKey: ['bento'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<BentoItem[]>({
    queryKey: ['bento'],
    queryFn: () => fetchBentoItems(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

// ==========================================
// 5. OFFERS QUERY & OPTIMISTIC MUTATIONS
// ==========================================
export function useOffers() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_offers_query_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['offers'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: () => getOffers(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: (query.data || []) as Offer[] };
}

export function useOfferMutations() {
  const queryClient = useQueryClient();

  const addOfferMutation = useMutation({
    mutationFn: (data: Partial<Offer>) => createOfferInDb(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Offer> }) =>
      updateOfferInDb(id, updates),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: (id: string) => deleteOfferInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['offers'] });
      const previousOffers = queryClient.getQueryData<Offer[]>(['offers']) || [];
      queryClient.setQueryData<Offer[]>(['offers'], (old = []) =>
        old.filter((o) => o.id !== id)
      );
      return { previousOffers };
    },
    onError: (err, id, context) => {
      if (context?.previousOffers) {
        queryClient.setQueryData(['offers'], context.previousOffers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  return { addOfferMutation, updateOfferMutation, deleteOfferMutation };
}

// ==========================================
// 6. ADMIN ORDERS QUERY & MUTATIONS
// ==========================================
export function useAdminOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_orders_query_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ['admin_orders'],
    queryFn: () => getOrdersFromDb(),
    staleTime: 1000 * 10,
  });

  return { ...query, data: query.data || [] };
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatusInDb(id, status),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => deleteOrderInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin_orders'] });
      const previousOrders = queryClient.getQueryData<any[]>(['admin_orders']) || [];
      queryClient.setQueryData<any[]>(['admin_orders'], (old = []) =>
        old.filter((o) => o.id !== id)
      );
      return { previousOrders };
    },
    onError: (err, id, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['admin_orders'], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
    },
  });

  return { updateOrderStatusMutation, deleteOrderMutation };
}

// ==========================================
// 7. ADMIN USERS QUERY & MUTATIONS
// ==========================================
export function useAdminUsers() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_users_query_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Profile[]>({
    queryKey: ['admin_users'],
    queryFn: () => getUsersFromDb(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

// ==========================================
// 8. PROMO CODES QUERY
// ==========================================
export function useAdminPromoCodes() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['admin_promos'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ['admin_promos'],
    queryFn: () => getAdminPromoCodes(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

// ==========================================
// 9. PRODUCT REVIEWS QUERY & MUTATION
// ==========================================
export function useProductReviews(productId: string) {
  const query = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviews(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || [] };
}

export function useAddReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      product_id,
      user_id,
      rating,
      comment,
    }: {
      product_id: string;
      user_id: string;
      rating: number;
      comment: string;
    }) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id, user_id, rating, comment }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
    },
  });
}

export function useUpdateReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      review_id,
      product_id,
      rating,
      comment,
    }: {
      review_id: string;
      product_id: string;
      rating: number;
      comment: string;
    }) => {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id, rating, comment }),
      });
      if (!res.ok) throw new Error('Failed to update review');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      review_id,
      product_id,
    }: {
      review_id: string;
      product_id: string;
    }) => {
      const res = await fetch(`/api/reviews?reviewId=${review_id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete review');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
    },
  });
}

// ==========================================
// 10. USER CART & WISHLIST QUERIES
// ==========================================
export function useUserCartQuery(userId: string) {
  const query = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/cart?userId=${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || [] };
}

export function useUserWishlistQuery(userId: string) {
  const query = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/wishlists?userId=${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || [] };
}

// ==========================================
// 11. RECOMMENDATIONS & TRENDING QUERIES
// ==========================================
export function useRecommendationsQuery(userId: string) {
  const query = useQuery({
    queryKey: ['recommendations', userId || 'guest-session'],
    queryFn: async () => {
      const uId = userId || 'guest-session';
      const res = await fetch(`/api/recommendations?userId=${uId}`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || [] };
}

export function useTrendingSearchesQuery(enabled = true) {
  const query = useQuery({
    queryKey: ['trending_searches'],
    queryFn: async () => {
      const res = await fetch('/api/trending-searches');
      if (!res.ok) return [];
      return res.json();
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 min cache
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || [] };
}

export function useUserOrders(userId?: string) {
  const query = useQuery({
    queryKey: ['user_orders', userId || 'all'],
    queryFn: async () => {
      const endpoint = userId ? `/api/orders?userId=${userId}` : '/api/orders';
      const res = await fetch(endpoint);
      if (!res.ok) return [];
      const orders = await res.json();
      return Array.isArray(orders) ? orders : [];
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || [] };
}
