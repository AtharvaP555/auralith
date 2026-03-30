import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Package,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  X,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  adminGetProducts,
  adminGetOrders,
  adminGetCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateOrderStatus,
  adminGetCoupons,
  adminCreateCoupon,
  adminDeleteCoupon,
} from "../../api/admin";

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-50 text-gray-700",
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "",
  categoryId: "",
  isFeatured: false,
  images: "",
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("products");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "",
    maxUses: "",
    expiresAt: "",
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminGetProducts,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: adminGetOrders,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: adminGetCategories,
  });

  const { data: couponsData } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: adminGetCoupons,
  });

  const products = productsData?.data?.products || [];
  const orders = ordersData?.data?.orders || [];
  const categories = categoriesData?.data?.categories || [];
  const coupons = couponsData?.data?.coupons || [];

  const createMutation = useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product created");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: adminUpdateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product updated");
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const statusMutation = useMutation({
    mutationFn: adminUpdateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const createCouponMutation = useMutation({
    mutationFn: adminCreateCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success("Coupon created");
      setShowCouponForm(false);
      setCouponForm({
        code: "",
        type: "PERCENTAGE",
        value: "",
        minOrder: "",
        maxUses: "",
        expiresAt: "",
      });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create coupon"),
  });

  const deleteCouponMutation = useMutation({
    mutationFn: adminDeleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success("Coupon deactivated");
    },
    onError: () => toast.error("Failed to deactivate coupon"),
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice || "",
      stock: product.stock,
      categoryId: product.categoryId || "",
      isFeatured: product.isFeatured,
      images: product.images?.join(", ") || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stock: parseInt(form.stock),
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("products")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "products"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Package size={15} />
          Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "orders"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <ShoppingBag size={15} />
          Orders
        </button>
      </div>

      <button
        onClick={() => setTab("coupons")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          tab === "coupons"
            ? "bg-gray-900 text-white"
            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Tag size={15} />
        Coupons
      </button>

      {tab === "products" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingProduct(null);
                setForm(emptyForm);
              }}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <Plus size={15} />
              Add product
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Product
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Category
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Stock
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={
                              product.images?.[0] ||
                              "https://placehold.co/36x36?text=?"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-40">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {product.categoryName}
                    </td>
                    <td className="px-5 py-3 text-gray-900">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-medium ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-500"}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Order
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Customer
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Total
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">
                      {order.userName}
                    </p>
                    <p className="text-xs text-gray-400">{order.userEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-900">
                    ₹{parseFloat(order.total).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: order.id,
                          status: e.target.value,
                        })
                      }
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}
                    >
                      {[
                        "PENDING",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELLED",
                        "REFUNDED",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "coupons" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCouponForm(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <Plus size={15} />
              Add coupon
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Code
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Value
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Uses
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Expires
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {coupon.code}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed"}
                    </td>
                    <td className="px-5 py-3 text-gray-900">
                      {coupon.type === "PERCENTAGE"
                        ? `${parseFloat(coupon.value)}%`
                        : `₹${parseFloat(coupon.value).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "Never"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => deleteCouponMutation.mutate(coupon.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-gray-400 text-sm"
                    >
                      No coupons yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showCouponForm && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900">
                    Add coupon
                  </h2>
                  <button
                    onClick={() => setShowCouponForm(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createCouponMutation.mutate(couponForm);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      required
                      value={couponForm.code}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="SAVE20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={couponForm.type}
                        onChange={(e) =>
                          setCouponForm({ ...couponForm, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                      >
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FIXED">Fixed amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value ({couponForm.type === "PERCENTAGE" ? "%" : "₹"})
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={couponForm.value}
                        onChange={(e) =>
                          setCouponForm({
                            ...couponForm,
                            value: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min order (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={couponForm.minOrder}
                        onChange={(e) =>
                          setCouponForm({
                            ...couponForm,
                            minOrder: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max uses
                      </label>
                      <input
                        type="number"
                        value={couponForm.maxUses}
                        onChange={(e) =>
                          setCouponForm({
                            ...couponForm,
                            maxUses: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Expiry date
                    </label>
                    <input
                      type="date"
                      value={couponForm.expiresAt}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          expiresAt: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={createCouponMutation.isPending}
                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {createCouponMutation.isPending
                      ? "Creating..."
                      : "Create coupon"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-900">
                {editingProduct ? "Edit product" : "Add product"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setForm(emptyForm);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Compare price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.comparePrice}
                    onChange={(e) =>
                      setForm({ ...form, comparePrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="isFeatured" className="text-sm text-gray-700">
                  Featured product
                </label>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingProduct
                    ? "Update product"
                    : "Create product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
