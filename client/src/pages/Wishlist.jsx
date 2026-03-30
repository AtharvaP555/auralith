import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchWishlist, toggleWishlist } from "../api/wishlist";
import useWishlistStore from "../store/wishlistStore";
import useCartStore from "../store/cartStore";

const Wishlist = () => {
  const queryClient = useQueryClient();
  const { setWishlisted } = useWishlistStore();
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
  });

  const items = data?.data?.items || [];

  const removeMutation = useMutation({
    mutationFn: (productId) => toggleWishlist(productId),
    onSuccess: (data, productId) => {
      setWishlisted(productId, false);
      queryClient.invalidateQueries(["wishlist"]);
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Failed to remove from wishlist"),
  });

  const handleAddToCart = (item) => {
    addItem({
      id: item.productId,
      name: item.name,
      price: item.price,
      images: item.images,
      stock: item.stock,
    });
    toast.success(`${item.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="text-gray-500 mb-4">Your wishlist is empty</p>
        <Link to="/products" className="text-sm text-gray-900 underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Wishlist ({items.length})
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
          >
            <Link to={`/products/${item.slug}`}>
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={
                    item.images?.[0] ||
                    "https://placehold.co/400x400?text=No+Image"
                  }
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {item.stock === 0 && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-500">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <p className="text-xs text-gray-400 mb-1">{item.categoryName}</p>
              <Link to={`/products/${item.slug}`}>
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-1 hover:underline">
                  {item.name}
                </h3>
              </Link>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  ₹{parseFloat(item.price).toFixed(2)}
                </span>
                {item.comparePrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{parseFloat(item.comparePrice).toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.stock === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={13} />
                  Add to cart
                </button>
                <button
                  onClick={() => removeMutation.mutate(item.productId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
