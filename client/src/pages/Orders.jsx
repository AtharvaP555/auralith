import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import { fetchOrders } from "../api/orders";

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-50 text-gray-700",
};

const Orders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const orders = data?.data?.orders || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
          >
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="text-gray-500 mb-4">No orders yet</p>
        <Link to="/products" className="text-sm text-gray-900 underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>

            <div className="flex items-center gap-3 mb-3">
              {order.items?.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50"
                >
                  <img
                    src={
                      item.productImage || "https://placehold.co/40x40?text=?"
                    }
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {order.items?.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{order.items.length - 3} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="font-semibold text-gray-900">
                ₹{parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
