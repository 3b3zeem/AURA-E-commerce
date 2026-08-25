import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Profile } from "@/types";
import { updateUserLoyaltyPointsInDb } from "@/lib/services/userService";

interface UserState {
  profile: Profile | null;
  token: string | null;
  loyaltyPoints: number;
  setProfile: (profile: Profile | null) => void;
  setToken: (token: string | null) => void;
  addLoyaltyPoints: (points: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      token: null,
      loyaltyPoints: 0,

      setProfile: (profile) =>
        set({
          profile,
          loyaltyPoints: profile?.loyalty_points || 0,
        }),

      setToken: (token) => set({ token }),

      addLoyaltyPoints: (points) => {
        const newTotal = Math.max(0, get().loyaltyPoints + points);
        set((state) => ({
          loyaltyPoints: newTotal,
          profile: state.profile
            ? { ...state.profile, loyalty_points: newTotal }
            : null,
        }));

        const profileId = get().profile?.id;
        if (profileId) {
          updateUserLoyaltyPointsInDb(profileId, newTotal).catch(() => {});
        }
      },

      clearUser: () =>
        set({ profile: null, token: null, loyaltyPoints: 0 }),
    }),
    {
      name: "aura-user-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
