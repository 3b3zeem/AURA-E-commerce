import { useUserStore } from "@/store/useUserStore";

export function getAdminHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let token: string | null = null;
  let profileId: string | null = null;

  if (typeof window !== "undefined") {
    token = useUserStore.getState().token;
    profileId = useUserStore.getState().profile?.id || null;

    if (!token || !profileId) {
      try {
        const stored = localStorage.getItem("aura-user-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!token) token = parsed?.state?.token || null;
          if (!profileId) profileId = parsed?.state?.profile?.id || null;
        }
      } catch {}
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-admin-key"] = `Bearer ${token}`;
  } else {
    headers["x-admin-key"] = "aura-admin-token";
  }

  if (profileId) {
    headers["x-user-id"] = profileId;
  }

  return headers;
}
