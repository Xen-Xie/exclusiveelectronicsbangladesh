/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/useCart";
import { useNavigate } from "react-router";
import axios from "axios";
import Btn from "../components/Common/Btn";
import { motion } from "framer-motion";

function DashBoard() {
  const { user, token } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    totalSpent: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    if (!user?.id || !token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileRes = await axios.get(`${apiUrl}/api/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = profileRes.data.data || profileRes.data;
        setUserProfile(profile);

        // Fetch wishlist separately from the wishlist endpoint
        try {
          const wishlistRes = await axios.get(`${apiUrl}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setWishlist(wishlistRes.data.data.wishlist || []);
        } catch (wishlistError) {
          console.error("Error fetching wishlist:", wishlistError);
          setWishlist([]);
        }

        // Fetch orders
        const ordersRes = await axios.get(`${apiUrl}/api/order/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = ordersRes.data.data || [];
        setOrders(ordersData);

        const totalSpent = ordersData.reduce(
          (sum, o) => sum + (o.total || 0),
          0,
        );
        const avgOrderValue =
          ordersData.length > 0 ? totalSpent / ordersData.length : 0;
        const pendingOrders = ordersData.filter(
          (o) =>
            o.status === "created" ||
            o.status === "pending" ||
            o.status === "processing",
        ).length;
        const deliveredOrders = ordersData.filter(
          (o) => o.status === "delivered",
        ).length;

        setStats({
          totalSpent,
          avgOrderValue,
          pendingOrders,
          deliveredOrders,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setWishlist([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, token, apiUrl]);

  const navigateToProfileTab = (tab) => {
    navigate(`/profile/${tab}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
          <div className="px-4 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  {getGreeting()}!
                </p>
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate">
                  Welcome back,{" "}
                  {userProfile?.name?.split(" ")[0] ||
                    user?.name?.split(" ")[0] ||
                    "User"}
                  !
                </h2>
                <p className="text-white/80 text-xs sm:text-sm mt-1 hidden xs:block">
                  Here's what's happening with your account
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shrink-0">
                <i className="fa-regular fa-calendar text-white text-xs sm:text-sm"></i>
                <span className="text-white text-xs sm:text-sm whitespace-nowrap">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2">
                <i className="fa-solid fa-shopping-bag text-blue-600 text-sm sm:text-lg"></i>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800">
                {orders.length}
              </span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">Total Orders</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
              {stats.deliveredOrders} delivered
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="bg-green-100 rounded-lg p-1.5 sm:p-2">
                <i className="fa-solid fa-cart-shopping text-green-600 text-sm sm:text-lg"></i>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800">
                {cart.length}
              </span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">Cart Items</p>
            {cart.length > 0 && (
              <button
                onClick={() => navigateToProfileTab("cart")}
                className="text-[10px] sm:text-xs text-primary hover:text-primary/80 mt-0.5 sm:mt-1"
              >
                View cart →
              </button>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="bg-purple-100 rounded-lg p-1.5 sm:p-2">
                <i className="fa-regular fa-heart text-purple-600 text-sm sm:text-lg"></i>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800">
                {wishlist.length}
              </span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">Wishlist</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 truncate">
              {wishlist.length > 0 ? `${wishlist.length} saved` : "No items"}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="bg-yellow-100 rounded-lg p-1.5 sm:p-2">
                <i className="fa-solid fa-money-bill-wave text-yellow-600 text-sm sm:text-lg"></i>
              </div>
              <span className="text-sm sm:text-xl font-bold text-gray-800 truncate ml-1">
                ৳{stats.totalSpent.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">Total Spent</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 truncate">
              Avg: ৳{Math.round(stats.avgOrderValue).toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                  Recent Orders
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Your latest orders
                </p>
              </div>
              {orders.length > 0 && (
                <button
                  onClick={() => navigateToProfileTab("orders")}
                  className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium flex items-center gap-1 shrink-0"
                >
                  View All
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 3).map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigateToProfileTab("orders")}
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-mono text-gray-600 truncate">
                        #{order._id.slice(-8)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span
                        className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "processing"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                        ৳{order.total?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-10">
              <i className="fa-solid fa-box-open text-4xl sm:text-5xl text-gray-300 mb-2 sm:mb-3"></i>
              <p className="text-gray-500 text-sm sm:text-base">
                No orders yet
              </p>
              <Btn onClick={() => navigate("/")} className="mt-3 sm:mt-4">
                Start Shopping
              </Btn>
            </div>
          )}
        </div>

        {/* Quick Actions & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-yellow-500 text-sm sm:text-base"></i>
              Quick Actions
            </h3>
            <div className="space-y-1.5 sm:space-y-2">
              <button
                onClick={() => navigateToProfileTab("profile")}
                className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
              >
                <i className="fa-solid fa-user text-gray-400 text-sm w-4 sm:w-5"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    Edit Profile
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                    Update your information
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigateToProfileTab("orders")}
                className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
              >
                <i className="fa-solid fa-truck text-gray-400 text-sm w-4 sm:w-5"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    Track Orders
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                    View order history
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigateToProfileTab("cart")}
                className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
              >
                <i className="fa-solid fa-cart-shopping text-gray-400 text-sm w-4 sm:w-5"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    View Cart
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                    {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigateToProfileTab("wishlist")}
                className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
              >
                <i className="fa-regular fa-heart text-gray-400 text-sm w-4 sm:w-5"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    Wishlist
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                    {wishlist.length} saved items
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Order Status Summary */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-blue-500 text-sm sm:text-base"></i>
              Order Status
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className="text-gray-600 truncate">Pending Orders</span>
                  <span className="font-medium text-gray-800 shrink-0 ml-2">
                    {stats.pendingOrders}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-yellow-500 rounded-full h-1.5 sm:h-2 transition-all duration-500"
                    style={{
                      width: `${
                        orders.length
                          ? (stats.pendingOrders / orders.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className="text-gray-600 truncate">
                    Delivered Orders
                  </span>
                  <span className="font-medium text-gray-800 shrink-0 ml-2">
                    {stats.deliveredOrders}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-green-500 rounded-full h-1.5 sm:h-2 transition-all duration-500"
                    style={{
                      width: `${
                        orders.length
                          ? (stats.deliveredOrders / orders.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="pt-2 sm:pt-3 mt-1 sm:mt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold text-gray-800">
                    {orders.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shopping Tips */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-yellow-500 text-sm sm:text-base"></i>
              Shopping Tips
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                <i className="fa-solid fa-tag text-primary mt-0.5 text-[10px] sm:text-xs shrink-0"></i>
                <span className="flex-1 min-w-0">
                  Check our daily deals for discounts
                </span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                <i className="fa-solid fa-truck-fast text-primary mt-0.5 text-[10px] sm:text-xs shrink-0"></i>
                <span className="flex-1 min-w-0">Free shipping over ৳2000</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                <i className="fa-regular fa-star text-primary mt-0.5 text-[10px] sm:text-xs shrink-0"></i>
                <span className="flex-1 min-w-0">Earn loyalty points</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                <i className="fa-solid fa-shield-alt text-primary mt-0.5 text-[10px] sm:text-xs shrink-0"></i>
                <span className="flex-1 min-w-0">30-day returns</span>
              </li>
            </ul>
            <Btn
              onClick={() => navigate("/products")}
              className="mt-3 sm:mt-4 w-full"
              size="sm"
            >
              Continue Shopping
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
