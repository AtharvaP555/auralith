import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package } from "lucide-react";
import { fetchOrder } from "../api/orders";

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-50 text-gray-700",
};

const statusSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });

  const order = data?.data?.order;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-100 rounded w-32" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Order not found</p>
        <button
          onClick={() => navigate("/orders")}
          className="text-sm text-gray-900 underline"
        >
          Back to orders
        </button>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);
  const address = order.shippingAddress;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to orders
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      {statusSteps.includes(order.status) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Order progress
          </h2>
          <div className="flex items-center gap-0">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      i <= currentStep
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-4 ${
                      i < currentStep ? "bg-gray-900" : "bg-gray-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Items</h2>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                <img
                  src={item.productImage || "https://placehold.co/48x48?text=?"}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.productName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Subtotal</span>
            <span>₹{parseFloat(order.total).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Shipping address
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-900">{address?.fullName}</p>
          <p>{address?.street}</p>
          <p>
            {address?.city}, {address?.state} {address?.postalCode}
          </p>
          <p>{address?.country}</p>
          <p>{address?.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
