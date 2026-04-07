import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ShoppingCart, ArrowLeft, Star, Package } from "lucide-react";
import { fetchProduct, fetchRelatedProducts } from "../api/products";
import useCartStore from "../store/cartStore";
import toast from "react-hot-toast";
import Reviews from "../components/features/Reviews";
import ProductCard from "../components/features/ProductCard";
import useRecentlyViewedStore from "../store/recentlyViewedStore";
import api from "../api/axios";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
  });
  const { data: relatedData } = useQuery({
    queryKey: ["related", slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: !!slug,
  });
  const product = data?.data?.product;
  const relatedProducts = relatedData?.data?.products || [];
  const { addProduct } = useRecentlyViewedStore();

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  useEffect(() => {
    if (product) {
      addProduct({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        comparePrice: product.comparePrice,
        images: product.images,
        stock: product.stock,
        categoryName: product.categoryName,
        avgRating: product.avgRating,
        reviewCount: product.reviewCount,
      });
    }
  }, [product?.id]);

  const alertMutation = useMutation({
    mutationFn: () =>
      api.post("/stock-alerts/subscribe", { productId: product.id }),
    onSuccess: () =>
      toast.success("We'll notify you when this is back in stock"),
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to subscribe"),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
            <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Product not found
        </p>
        <button
          onClick={() => navigate("/products")}
          className="text-sm text-gray-900 dark:text-white underline"
        >
          Back to products
        </button>
      </div>
    );
  }

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : null;

  return (
    <div>
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-3">
            <img
              src={
                product.images?.[selectedImage] ||
                "https://placehold.co/800x800?text=No+Image"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i
                      ? "border-gray-900 dark:border-white"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
            {product.categoryName}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(product.avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {parseFloat(product.avgRating).toFixed(1)} ({product.reviewCount}{" "}
              reviews)
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{parseFloat(product.price).toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                ₹{parseFloat(product.comparePrice).toFixed(2)}
              </span>
            )}
            {discount && (
              <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="flex items-center gap-2 mb-6">
            <Package size={16} className="text-gray-400" />
            <span
              className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {product.stock === 0 && (
            <button
              onClick={() => alertMutation.mutate()}
              disabled={alertMutation.isPending || alertMutation.isSuccess}
              className="w-full mb-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {alertMutation.isSuccess
                ? "You will be notified"
                : alertMutation.isPending
                  ? "Subscribing..."
                  : "Notify me when back in stock"}
            </button>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} />
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <Reviews slug={slug} />
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Related products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
