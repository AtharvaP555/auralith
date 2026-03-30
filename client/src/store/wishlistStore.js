import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWishlistStore = create(
  persist(
    (set, get) => ({
      productIds: [],

      setWishlisted: (productId, wishlisted) => {
        const { productIds } = get();
        if (wishlisted) {
          set({ productIds: [...new Set([...productIds, productId])] });
        } else {
          set({ productIds: productIds.filter((id) => id !== productId) });
        }
      },

      isWishlisted: (productId) => {
        return get().productIds.includes(productId);
      },

      setAll: (productIds) => {
        set({ productIds });
      },
    }),
    {
      name: "auralith-wishlist",
    },
  ),
);

export default useWishlistStore;
