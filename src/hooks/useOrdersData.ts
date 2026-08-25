"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getOrdersFromDb,
  getUserOrders as getUserOrdersService,
  createOrderInDb,
  updateOrderStatusInDb,
  deleteOrderInDb,
  getAdminPromoCodes,
  verifyPromoCode,
  createAdminPromoCode,
  updateAdminPromoCode,
  deleteAdminPromoCode,
} from "@/lib/services/ordersService";

const EMPTY_ARRAY: any[] = [];

// ==========================================
// 1. ORDERS QUERY & MUTATIONS
// ==========================================
export function useOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channelId = `orders_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["admin_orders"],
    queryFn: () => getOrdersFromDb(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || EMPTY_ARRAY };
}

export function useUserOrders(userId?: string) {
  const query = useQuery({
    queryKey: ["user_orders", userId || "all"],
    queryFn: async () => {
      if (!userId) return EMPTY_ARRAY;
      return getUserOrdersService(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || EMPTY_ARRAY };
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => createOrderInDb(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
      queryClient.invalidateQueries({ queryKey: ["user_orders"] });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatusInDb(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["admin_orders"] });
      const previousOrders =
        queryClient.getQueryData<any[]>(["admin_orders"]) || EMPTY_ARRAY;

      queryClient.setQueryData<any[]>(["admin_orders"], (old = EMPTY_ARRAY) =>
        old.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      return { previousOrders };
    },
    onError: (err, vars, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["admin_orders"], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => deleteOrderInDb(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin_orders"] });
      const previousOrders =
        queryClient.getQueryData<any[]>(["admin_orders"]) || EMPTY_ARRAY;

      queryClient.setQueryData<any[]>(["admin_orders"], (old = EMPTY_ARRAY) =>
        old.filter((o) => o.id !== id),
      );
      return { previousOrders };
    },
    onError: (err, id, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["admin_orders"], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
    },
  });

  return { createOrderMutation, updateOrderStatusMutation, deleteOrderMutation };
}

// ==========================================
// 2. PROMO CODES QUERY & MUTATIONS
// ==========================================
export function useAdminPromoCodes() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["admin_promo_codes"] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channel = supabase
      .channel("realtime_promos_query_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promo_codes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin_promo_codes"] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["admin_promo_codes"],
    queryFn: () => getAdminPromoCodes(),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || EMPTY_ARRAY };
}

export function useVerifyPromoCode() {
  return useMutation({
    mutationFn: ({ code, userId }: { code: string; userId?: string }) =>
      verifyPromoCode(code, userId),
  });
}

export function usePromoCodeMutations() {
  const queryClient = useQueryClient();

  const addPromoCodeMutation = useMutation({
    mutationFn: (data: Parameters<typeof createAdminPromoCode>[0]) =>
      createAdminPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_promo_codes"] });
    },
  });

  const updatePromoCodeMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateAdminPromoCode>[0]) =>
      updateAdminPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_promo_codes"] });
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: (id: string) => deleteAdminPromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_promo_codes"] });
    },
  });

  return {
    addPromoCodeMutation,
    updatePromoCodeMutation,
    deletePromoCodeMutation,
  };
}
