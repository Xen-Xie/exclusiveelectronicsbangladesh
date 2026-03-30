/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";

function Analysis() {
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [analyticsData, setAnalyticsData] = useState({
    revenueData: [],
    salesData: [],
    topProducts: [],
    categoryDistribution: [],
    dailyStats: [],
    monthlyStats: [],
    weeklyStats: [],
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    topCategory: "",
    topProduct: "",
  });

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  const getWeekNumber = useCallback((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
    );
  }, []);

  const processAnalyticsData = useCallback(
    (orders, products) => {
      const now = new Date();
      let filteredOrders = [...orders];

      // Filter based on time range
      if (timeRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredOrders = orders.filter((o) => new Date(o.createdAt) >= weekAgo);
      } else if (timeRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredOrders = orders.filter(
          (o) => new Date(o.createdAt) >= monthAgo,
        );
      } else if (timeRange === "year") {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filteredOrders = orders.filter((o) => new Date(o.createdAt) >= yearAgo);
      }

      // Daily revenue data
      const dailyMap = new Map();
      filteredOrders.forEach((order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        dailyMap.set(date, (dailyMap.get(date) || 0) + (order.total || 0));
      });
      const dailyRevenue = Array.from(dailyMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7);

      // Weekly sales data
      const weeklyMap = new Map();
      filteredOrders.forEach((order) => {
        const week = getWeekNumber(new Date(order.createdAt));
        weeklyMap.set(week, (weeklyMap.get(week) || 0) + 1);
      });
      const weeklySales = Array.from(weeklyMap.entries())
        .map(([week, sales]) => ({ week: `Week ${week}`, sales }))
        .slice(-6);

      // Top products by sales
      const productSales = new Map();
      filteredOrders.forEach((order) => {
        order.items?.forEach((item) => {
          productSales.set(
            item.name,
            (productSales.get(item.name) || 0) + (item.qty || 0),
          );
        });
      });
      const topProducts = Array.from(productSales.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Category distribution
      const categoryMap = new Map();
      products.forEach((product) => {
        if (product.category) {
          categoryMap.set(
            product.category,
            (categoryMap.get(product.category) || 0) + 1,
          );
        }
      });
      const categoryDistribution = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      // Monthly revenue
      const monthlyMap = new Map();
      orders.forEach((order) => {
        const month = new Date(order.createdAt).toLocaleString("default", {
          month: "short",
        });
        monthlyMap.set(
          month,
          (monthlyMap.get(month) || 0) + (order.total || 0),
        );
      });
      const monthlyRevenue = Array.from(monthlyMap.entries())
        .map(([month, revenue]) => ({ month, revenue }))
        .slice(-6);

      return {
        revenueData: dailyRevenue,
        salesData: weeklySales,
        topProducts,
        categoryDistribution,
        dailyStats: dailyRevenue,
        monthlyStats: monthlyRevenue,
        weeklyStats: weeklySales,
      };
    },
    [timeRange, getWeekNumber],
  );

  const calculateSummary = useCallback((orders, products, processedData) => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (compare last 30 days with previous 30 days)
    const now = new Date();
    const last30Start = new Date(now);
    last30Start.setDate(last30Start.getDate() - 30);
    const prev30Start = new Date(last30Start);
    prev30Start.setDate(prev30Start.getDate() - 30);

    const last30Orders = orders.filter(
      (o) => new Date(o.createdAt) >= last30Start,
    );
    const prev30Orders = orders.filter(
      (o) =>
        new Date(o.createdAt) >= prev30Start &&
        new Date(o.createdAt) < last30Start,
    );

    const revenueGrowth =
      prev30Orders.length > 0
        ? ((last30Orders.reduce((s, o) => s + (o.total || 0), 0) -
            prev30Orders.reduce((s, o) => s + (o.total || 0), 0)) /
            prev30Orders.reduce((s, o) => s + (o.total || 0), 0)) *
          100
        : 0;

    const orderGrowth =
      prev30Orders.length > 0
        ? ((last30Orders.length - prev30Orders.length) / prev30Orders.length) *
          100
        : 0;

    const topCategory = processedData.categoryDistribution[0]?.name || "N/A";
    const topProduct = processedData.topProducts[0]?.name || "N/A";

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      avgOrderValue,
      revenueGrowth,
      orderGrowth,
      topCategory,
      topProduct,
    };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch orders for analytics
      const ordersRes = await axios.get(`${apiUrl}/api/order`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = ordersRes.data.data || [];

      // Fetch products
      const productsRes = await axios.get(`${apiUrl}/api/products`);
      const products = productsRes.data.data || [];

      // Process data based on time range
      const processedData = processAnalyticsData(orders, products);
      setAnalyticsData(processedData);
      setSummary(calculateSummary(orders, products, processedData));
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, processAnalyticsData, calculateSummary]);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [timeRange, token, fetchAnalytics]);

  const formatCurrency = (value) => {
    return `৳${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-urbanist">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Track your store performance and sales insights
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["week", "month", "year", "all"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              timeRange === range
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {range === "week"
              ? "Last 7 Days"
              : range === "month"
              ? "Last 30 Days"
              : range === "year"
              ? "Last Year"
              : "All Time"}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Revenue</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-green-600 text-sm sm:text-base"></i>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <div
            className={`mt-2 text-xs sm:text-sm ${
              summary.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {summary.revenueGrowth >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(summary.revenueGrowth).toFixed(1)}% from last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Orders</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-shopping-bag text-blue-600 text-sm sm:text-base"></i>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {summary.totalOrders}
          </p>
          <div
            className={`mt-2 text-xs sm:text-sm ${
              summary.orderGrowth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {summary.orderGrowth >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(summary.orderGrowth).toFixed(1)}% from last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Average Order Value</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-calculator text-purple-600 text-sm sm:text-base"></i>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {formatCurrency(summary.avgOrderValue)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Per transaction average</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Products</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-box text-yellow-600 text-sm sm:text-base"></i>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {summary.totalProducts}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Active products in catalog
          </p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Revenue Trend
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Daily revenue for selected period
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-primary text-sm sm:text-base"></i>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `৳${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`৳${value}`, "Revenue"]} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Trend */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Sales Trend
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Weekly order volume
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-chart-simple text-green-600 text-sm sm:text-base"></i>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Top Selling Products
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Most popular items by quantity
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-trophy text-orange-600 text-sm sm:text-base"></i>
            </div>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {analyticsData.topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-600"
                        : index === 1
                        ? "bg-gray-100 text-gray-600"
                        : index === 2
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.quantity} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary text-sm">
                    {product.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Category Distribution
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Products by category
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-chart-pie text-purple-600 text-sm sm:text-base"></i>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {analyticsData.categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <i className="fa-solid fa-chart-line text-blue-600 text-base sm:text-xl"></i>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
              Growth Metrics
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Revenue Growth</span>
              <span
                className={`font-semibold ${
                  summary.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.revenueGrowth >= 0 ? "+" : ""}
                {summary.revenueGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Growth</span>
              <span
                className={`font-semibold ${
                  summary.orderGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.orderGrowth >= 0 ? "+" : ""}
                {summary.orderGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <i className="fa-solid fa-star text-green-600 text-base sm:text-xl"></i>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
              Top Performer
            </h3>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm sm:text-base">
              {summary.topCategory}
            </p>
            <p className="text-xs text-gray-600">Best performing category</p>
          </div>
          <div className="mt-3">
            <p className="font-bold text-gray-800 text-sm sm:text-base">
              {summary.topProduct}
            </p>
            <p className="text-xs text-gray-600">Best selling product</p>
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <i className="fa-solid fa-bullhorn text-purple-600 text-base sm:text-xl"></i>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
              Quick Insights
            </h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-green-500 text-[10px] sm:text-xs"></i>
              <span>
                Average {summary.avgOrderValue > 1000 ? "high" : "low"} order
                value
              </span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-green-500 text-[10px] sm:text-xs"></i>
              <span>{summary.totalOrders} total orders processed</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-green-500 text-[10px] sm:text-xs"></i>
              <span>
                {analyticsData.topProducts[0]?.name || "No"} is top seller
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
