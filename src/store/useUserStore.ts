import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Profile } from '@/types';

interface UserState {
  profile: Profile | null;
  token: string | null;
  wishlistIds: string[];
  loyaltyPoints: number;
  setProfile: (profile: Profile | null) => void;
  setToken: (token: string | null) => void;
  setWishlistIds: (ids: string[]) => void;
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  addLoyaltyPoints: (points: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      token: null,
      wishlistIds: [],
      loyaltyPoints: 0,

      setProfile: (profile) =>
        set({
          profile,
          loyaltyPoints: profile?.loyalty_points || 0,
        }),

      setToken: (token) => set({ token }),

      setWishlistIds: (ids) => set({ wishlistIds: ids }),

      toggleWishlist: (productId) => {
        const current = get().wishlistIds;
        const profile = get().profile;
        const exists = current.includes(productId);

        if (exists) {
          const updated = current.filter((id) => id !== productId);
          set({ wishlistIds: updated });

          if (profile?.id) {
            fetch(`/api/wishlists?userId=${profile.id}&productId=${productId}`, {
              method: 'DELETE',
            }).catch(() => {});
          }
          return false;
        } else {
          const updated = [...current, productId];
          set({ wishlistIds: updated });

          if (profile?.id) {
            fetch('/api/wishlists', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: profile.id, product_id: productId }),
            }).catch(() => {});
          }
          return true;
        }
      },

      isInWishlist: (productId) => get().wishlistIds.includes(productId),

      addLoyaltyPoints: (points) => {
        const newTotal = Math.max(0, get().loyaltyPoints + points);
        set((state) => ({
          loyaltyPoints: newTotal,
          profile: state.profile ? { ...state.profile, loyalty_points: newTotal } : null,
        }));

        const profileId = get().profile?.id;
        if (profileId) {
          fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: profileId, loyalty_points: newTotal }),
          }).catch(() => {});
        }
      },

      clearUser: () => set({ profile: null, token: null, wishlistIds: [], loyaltyPoints: 0 }),
    }),
    {
      name: 'aura-user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
