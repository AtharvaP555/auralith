import { create } from "zustand";
import { persist } from "zustand/middleware";

const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const { products } = get();
        const filtered = products.filter((p) => p.id !== product.id);
        const updated = [product, ...filtered].slice(0, 6);
        set({ products: updated });
      },

      clearAll: () => set({ products: [] }),
    }),
    {
      name: "auralith-recently-viewed",
    },
  ),
);

export default useRecentlyViewedStore;
