import { create } from 'zustand';
import { CartItem, Product } from '@/types';
import { useUserStore } from '@/store/useUserStore';
import { trackAddToCart } from '@/lib/analytics/tracker';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setItems: (items: CartItem[]) => void;
  addItem: (product: Product, quantity?: number, selected_variant?: Record<string, string>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setItems: (items) => set({ items }),

  addItem: (product, quantity = 1, selected_variant = {}) => {
    const currentItems = get().items;
    const variantKey = JSON.stringify(selected_variant);

    const existingIndex = currentItems.findIndex(
      (item) => item.product_id === product.id && JSON.stringify(item.selected_variant || {}) === variantKey
    );

    if (existingIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingIndex].quantity += quantity;
      set({ items: updatedItems, isOpen: true });
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        product_id: product.id,
        product,
        selected_variant,
        quantity,
      };
      set({ items: [...currentItems, newItem], isOpen: true });
    }

    // Analytics event track
    try {
      trackAddToCart(product.id, product.name, product.price);
    } catch {}

    // Sync to Supabase DB for persistent recommendations & cart state
    const userId = useUserStore.getState().profile?.id || 'guest-session';
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, product_id: product.id, quantity, product }),
    }).catch(() => {});
  },

  removeItem: (cartItemId) => {
    const targetItem = get().items.find((item) => item.id === cartItemId);
    set({ items: get().items.filter((item) => item.id !== cartItemId) });

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('aura-user-storage') : null;
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const userId = parsed?.state?.profile?.id;
        if (userId) {
          fetch(`/api/cart?id=${cartItemId}&userId=${userId}`, {
            method: 'DELETE',
          }).catch(() => {});
        }
      } catch {}
    }
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('aura-user-storage') : null;
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const userId = parsed?.state?.profile?.id;
        if (userId) {
          fetch(`/api/cart?userId=${userId}`, {
            method: 'DELETE',
          }).catch(() => {});
        }
      } catch {}
    }
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
}));
