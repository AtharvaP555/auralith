import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import useCartStore from "../../store/cartStore";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : null;

  return (
    <Link to={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={
              product.images?.[0] ||
              "https://placehold.co/400x400?text=No+Image"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{product.categoryName}</p>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-500">
              {parseFloat(product.avgRating).toFixed(1)}
              <span className="ml-1">({product.reviewCount})</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-xs text-gray-400 line-through">
                  ${parseFloat(product.comparePrice).toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
