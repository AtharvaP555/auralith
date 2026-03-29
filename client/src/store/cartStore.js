import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existing = items.find((i) => i.id === product.id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity }] });
    }
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set((state) => ({
      items: state.items.map((i) =>
        i.id === productId ? { ...i, quantity } : i,
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
}));

export default useCartStore;
