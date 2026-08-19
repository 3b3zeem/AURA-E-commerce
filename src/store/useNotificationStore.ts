import { create } from "zustand";

export interface AdminNotification {
  id: string;
  type: "order" | "cart" | "product" | "search" | "user" | "review" | "newsletter" | "system";
  title: string;
  message: string;
  userEmail?: string;
  amount?: number;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<AdminNotification, "id" | "read" | "createdAt">) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        const list = (data.notifications || []).map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          userEmail: n.user_email || n.userEmail,
          amount: n.amount,
          read: Boolean(n.read),
          createdAt: n.created_at || n.createdAt || new Date().toISOString(),
        }));
        const unread = list.filter((n: AdminNotification) => !n.read).length;
        set({ notifications: list, unreadCount: unread, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },

  addNotification: async (data) => {
    const tempId = "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const newNotif: AdminNotification = {
      ...data,
      id: tempId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const updated = [newNotif, ...state.notifications].slice(0, 100);
      const unread = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount: unread };
    });

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  },

  markAsRead: async (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unread = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount: unread };
    });

    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  },

  markAllAsRead: async () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      return { notifications: updated, unreadCount: 0 };
    });

    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch {}
  },

  clearAll: async () => {
    set({ notifications: [], unreadCount: 0 });

    try {
      await fetch("/api/admin/notifications", {
        method: "DELETE",
      });
    } catch {}
  },
}));
