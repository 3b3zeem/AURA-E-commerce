"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getUsersFromDb,
  getUserProfileFromDb,
  updateUserRoleInDb,
  createUserInDb,
  updateUserInDb,
  deleteUserInDb,
  getUserAddresses,
  getAdminAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  createAdminAddress,
  updateAdminAddress,
  deleteAdminAddress,
  getUserWishlist,
  addToWishlistInDb,
  removeFromWishlistInDb,
  getUserCartFromDb,
  syncCartItemToDb,
  deleteCartItemFromDb,
  getUserLoyaltyInfo,
  recordUserLoyaltyRedemption,
  awardLoyaltyPointsAdmin,
} from "@/lib/services/userService";
import { Profile } from "@/types";

const DEFAULT_LOYALTY_DATA = { points: 0, logs: [] };
const EMPTY_ARRAY: any[] = [];

// ==========================================
// 1. ADMIN USERS QUERY & MUTATIONS
// ==========================================
export function useAdminUsers() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    };
    window.addEventListener("aura_data_changed", handleDataChanged);

    const supabase = createClient();
    const channelId = `users_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin_users"] });
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("aura_data_changed", handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<Profile[]>({
    queryKey: ["admin_users"],
    queryFn: () => getUsersFromDb(),
    staleTime: 1000 * 30,
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => createUserInDb(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: any) => updateUserInDb(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "customer" | "admin";
    }) => updateUserRoleInDb(userId, role),
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: ["admin_users"] });
      const previousUsers =
        queryClient.getQueryData<Profile[]>(["admin_users"]) || EMPTY_ARRAY;

      queryClient.setQueryData<Profile[]>(
        ["admin_users"],
        (old = EMPTY_ARRAY) =>
          old.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
      return { previousUsers };
    },
    onError: (err, vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin_users"], context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUserInDb(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin_users"] });
      const previousUsers =
        queryClient.getQueryData<Profile[]>(["admin_users"]) || EMPTY_ARRAY;

      queryClient.setQueryData<Profile[]>(
        ["admin_users"],
        (old = EMPTY_ARRAY) => old.filter((u) => u.id !== userId),
      );
      return { previousUsers };
    },
    onError: (err, userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin_users"], context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });

  return {
    ...query,
    data: query.data || EMPTY_ARRAY,
    createUserMutation,
    updateUserMutation,
    updateUserRoleMutation,
    deleteUserMutation,
  };
}

// ==========================================
// 2. USER PROFILE QUERY
// ==========================================
export function useUserProfile(userId?: string) {
  const query = useQuery<Profile | null>({
    queryKey: ["user_profile", userId || "guest"],
    queryFn: () => (userId ? getUserProfileFromDb(userId) : null),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || null };
}

// ==========================================
// 3. USER ADDRESSES QUERY & MUTATIONS
// ==========================================
export function useUserAddresses(userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user_addresses", userId || "guest"],
    queryFn: async () => {
      if (!userId) return EMPTY_ARRAY;
      return getUserAddresses();
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: any) => createUserAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_addresses"] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (data: any) => updateUserAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_addresses"] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => deleteUserAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_addresses"] });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => setDefaultUserAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_addresses"] });
    },
  });

  return {
    ...query,
    data: query.data || EMPTY_ARRAY,
    createAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
    setDefaultAddressMutation,
  };
}

export function useAdminAddresses() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin_addresses"],
    queryFn: () => getAdminAddresses(),
    staleTime: 1000 * 30,
  });

  const createAdminAddressMutation = useMutation({
    mutationFn: (data: any) => createAdminAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_addresses"] });
    },
  });

  const updateAdminAddressMutation = useMutation({
    mutationFn: (data: any) => updateAdminAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_addresses"] });
    },
  });

  const deleteAdminAddressMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_addresses"] });
    },
  });

  return {
    ...query,
    data: query.data || EMPTY_ARRAY,
    createAdminAddressMutation,
    updateAdminAddressMutation,
    deleteAdminAddressMutation,
  };
}

// ==========================================
// 4. USER WISHLIST QUERY & MUTATIONS
// ==========================================
export function useUserWishlist(userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user_wishlist", userId || "guest"],
    queryFn: () => (userId ? getUserWishlist(userId) : EMPTY_ARRAY),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: ({ userId, productId }: { userId: string; productId: string }) =>
      addToWishlistInDb(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_wishlist"] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: ({ userId, productId }: { userId: string; productId: string }) =>
      removeFromWishlistInDb(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_wishlist"] });
    },
  });

  return {
    ...query,
    data: query.data || EMPTY_ARRAY,
    addToWishlistMutation,
    removeFromWishlistMutation,
  };
}

// ==========================================
// 5. USER CART QUERY & MUTATIONS
// ==========================================
export function useUserCart(userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user_cart", userId || "guest"],
    queryFn: () => (userId ? getUserCartFromDb(userId) : EMPTY_ARRAY),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });

  const syncCartMutation = useMutation({
    mutationFn: ({
      userId,
      productId,
      quantity,
    }: {
      userId: string;
      productId: string;
      quantity: number;
    }) => syncCartItemToDb(userId, productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_cart"] });
    },
  });

  const deleteCartMutation = useMutation({
    mutationFn: ({ id, userId }: { id?: string; userId?: string }) =>
      deleteCartItemFromDb(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_cart"] });
    },
  });

  return {
    ...query,
    data: query.data || EMPTY_ARRAY,
    syncCartMutation,
    deleteCartMutation,
  };
}

// ==========================================
// 6. USER LOYALTY QUERY & MUTATIONS
// ==========================================
export function useUserLoyalty(userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user_loyalty", userId || "guest"],
    queryFn: async () => {
      if (!userId) return DEFAULT_LOYALTY_DATA;
      const res = await getUserLoyaltyInfo(userId);
      return res || DEFAULT_LOYALTY_DATA;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const recordRedemptionMutation = useMutation({
    mutationFn: ({
      userId,
      points,
      reason,
    }: {
      userId: string;
      points: number;
      reason: string;
    }) => recordUserLoyaltyRedemption(userId, points, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_loyalty"] });
    },
  });

  const awardPointsAdminMutation = useMutation({
    mutationFn: ({
      userId,
      points,
      pointsType,
      reason,
    }: {
      userId: string;
      points: number;
      pointsType: string;
      reason: string;
    }) => awardLoyaltyPointsAdmin(userId, points, pointsType, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_loyalty"] });
    },
  });

  return {
    ...query,
    data: query.data || DEFAULT_LOYALTY_DATA,
    recordRedemptionMutation,
    awardPointsAdminMutation,
  };
}
