import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import useCartStore from "../store/cartStore";
import { createOrder, verifyPayment, validateCoupon } from "../api/orders";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      const { razorpayOrderId, amount, currency, keyId, orderId } = data.data;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "Auralith",
        description: "Order Payment",
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            });
            clearCart();
            toast.success("Order placed successfully!");
            navigate(`/orders/${orderId}`);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: form.fullName,
          contact: form.phone,
        },
        theme: { color: "#111827" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create order");
    },
  });

  const { mutate: applyCoupon, isPending: isValidating } = useMutation({
    mutationFn: validateCoupon,
    onSuccess: (data) => {
      setAppliedCoupon(data.data.coupon);
      toast.success(
        `Coupon applied — ₹${data.data.coupon.discount.toFixed(2)} off`,
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Invalid coupon");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    placeOrder({
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingAddress: form,
      couponCode: appliedCoupon?.code || null,
      discount: appliedCoupon?.discount || 0,
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <button
          onClick={() => navigate("/products")}
          className="text-sm text-gray-900 underline"
        >
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-base font-semibold text-gray-900">
            Shipping details
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street address
            </label>
            <input
              type="text"
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal code
              </label>
              <input
                type="text"
                required
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="400001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon code
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {appliedCoupon.code}
                  </p>
                  <p className="text-xs text-green-600">
                    ₹{appliedCoupon.discount.toFixed(2)} discount applied
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-green-700 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter coupon code"
                />
                <button
                  type="button"
                  disabled={!couponCode || isValidating}
                  onClick={() =>
                    applyCoupon({
                      code: couponCode,
                      orderTotal: getTotalPrice(),
                    })
                  }
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isValidating ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isPending
              ? "Processing..."
              : `Pay ₹${Math.max(0, getTotalPrice() - (appliedCoupon?.discount || 0)).toFixed(2)}`}
          </button>
        </form>

        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Order summary
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  <img
                    src={
                      item.images?.[0] || "https://placehold.co/48x48?text=?"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 shrink-0">
                  ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>
                  ₹
                  {Math.max(
                    0,
                    getTotalPrice() - (appliedCoupon?.discount || 0),
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
