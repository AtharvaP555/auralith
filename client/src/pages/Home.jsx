import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fetchProducts, fetchCategories } from "../api/products";
import ProductCard from "../components/features/ProductCard";
import useRecentlyViewedStore from "../store/recentlyViewedStore";

const Home = () => {
  const { data: productsData } = useQuery({
    queryKey: ["products", { isFeatured: true }],
    queryFn: () => fetchProducts({ limit: 4 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];
  const { products: recentlyViewed } = useRecentlyViewedStore();

  return (
    <div>
      <div className="bg-gray-900 rounded-3xl px-8 py-16 md:py-24 mb-12 text-center">
        <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-4">
          Premium Audio
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Sound that moves
          <br />
          <span className="text-gray-400">your world</span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8">
          Handcrafted audio equipment for those who refuse to compromise on
          quality.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Shop now
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Shop by category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all text-center group"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                {cat.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {cat.productCount} products
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Latest products</h2>
          <Link
            to="/products"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {recentlyViewed.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recently viewed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-1">Free shipping</p>
          <p className="text-sm text-gray-500">On all orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-1">
            2 year warranty
          </p>
          <p className="text-sm text-gray-500">On all products</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-1">24/7 support</p>
          <p className="text-sm text-gray-500">Always here to help</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
