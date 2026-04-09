import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";
import api from "../../api/axios";

const fetchAnalytics = async () => {
  const response = await api.get("/admin/analytics");
  return response.data;
};

const statusColors = {
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
  REFUNDED: "#6b7280",
};

const Analytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAnalytics,
  });

  const analytics = data?.data;
  const isDark = document.documentElement.classList.contains("dark");

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  const revenueData =
    analytics?.revenueByDay?.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      revenue: parseFloat(d.revenue),
      orders: parseInt(d.orders),
    })) || [];

  const statusData =
    analytics?.ordersByStatus?.map((d) => ({
      name: d.status,
      value: parseInt(d.count),
    })) || [];

  const topProducts = analytics?.topProducts || [];
  const totals = analytics?.totals || {};

  const gridColor = isDark ? "#374151" : "#f0f0f0";
  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipStyle = {
    borderRadius: "8px",
    border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
    fontSize: "13px",
    background: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#f9fafb" : "#111827",
  };
  const areaColor = isDark ? "#ffffff" : "#111827";

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Analytics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp
              size={16}
              className="text-gray-400 dark:text-gray-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total revenue
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{parseFloat(totals.totalRevenue || 0).toFixed(0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag
              size={16}
              className="text-gray-400 dark:text-gray-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total orders
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-400 dark:text-gray-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total users
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics?.totalUsers || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-gray-400 dark:text-gray-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Successful orders
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.successfulOrders || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Revenue — last 30 days
          </h3>
          {revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={areaColor} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${parseFloat(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={areaColor}
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Orders by status
          </h3>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={statusColors[entry.name] || "#6b7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Top selling products
        </h3>
        {topProducts.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            No sales data yet
          </p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 w-4">
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 shrink-0">
                  <img
                    src={product.image || "https://placehold.co/40x40?text=?"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {product.sold} sold
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                  ₹{parseFloat(product.revenue).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
