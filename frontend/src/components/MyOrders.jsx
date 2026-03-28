/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router";
import Btn from "./Common/Btn";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

export default function MyOrders() {
  const { token } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  // State to track which orders have been reviewed
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  // State to track delivered orders that have been notified
  const [notifiedDeliveries, setNotifiedDeliveries] = useState(new Set());

  // Function to check if order is cash on delivery
  const isCashOnDelivery = (order) => {
    return (
      order.payment?.method === "cash_on_delivery" ||
      order.payment?.status === "cash_on_delivery"
    );
  };

  // Get order phases based on payment method
  const getOrderPhases = (order) => {
    const isCOD = isCashOnDelivery(order);

    if (isCOD) {
      // For Cash on Delivery orders, payment happens after delivery
      return [
        {
          status: "created",
          label: "Order Created",
          icon: "fa-solid fa-cart-plus",
          color: "bg-gray-500",
          activeColor: "bg-gray-600",
          description: "Your order has been placed successfully",
        },
        {
          status: "processing",
          label: "Processing",
          icon: "fa-solid fa-gear",
          color: "bg-purple-500",
          activeColor: "bg-purple-600",
          description: "Your order is being prepared for shipment",
        },
        {
          status: "shipped",
          label: "Shipped",
          icon: "fa-solid fa-truck",
          color: "bg-indigo-500",
          activeColor: "bg-indigo-600",
          description: "Your order has been shipped and is on its way",
        },
        {
          status: "delivered",
          label: "Delivered",
          icon: "fa-solid fa-check-circle",
          color: "bg-green-500",
          activeColor: "bg-green-600",
          description: "Your order has been delivered",
        },
        {
          status: "payment_pending",
          label: "Payment Pending",
          icon: "fa-solid fa-credit-card",
          color: "bg-yellow-500",
          activeColor: "bg-yellow-600",
          description: "Payment will be collected at delivery",
        },
        {
          status: "paid",
          label: "Payment Completed",
          icon: "fa-solid fa-money-bill-wave",
          color: "bg-emerald-500",
          activeColor: "bg-emerald-600",
          description: "Payment has been successfully collected",
        },
      ];
    } else {
      // For online payment orders
      return [
        {
          status: "created",
          label: "Order Created",
          icon: "fa-solid fa-cart-plus",
          color: "bg-gray-500",
          activeColor: "bg-gray-600",
          description: "Your order has been placed successfully",
        },
        {
          status: "paid",
          label: "Payment Confirmed",
          icon: "fa-solid fa-credit-card",
          color: "bg-blue-500",
          activeColor: "bg-blue-600",
          description: "Payment has been received and confirmed",
        },
        {
          status: "processing",
          label: "Processing",
          icon: "fa-solid fa-gear",
          color: "bg-purple-500",
          activeColor: "bg-purple-600",
          description: "Your order is being prepared for shipment",
        },
        {
          status: "shipped",
          label: "Shipped",
          icon: "fa-solid fa-truck",
          color: "bg-indigo-500",
          activeColor: "bg-indigo-600",
          description: "Your order has been shipped and is on its way",
        },
        {
          status: "delivered",
          label: "Delivered",
          icon: "fa-solid fa-check-circle",
          color: "bg-green-500",
          activeColor: "bg-green-600",
          description: "Your order has been delivered successfully",
        },
      ];
    }
  };

  // Status colors mapping for visual status indicators
  const statusColors = {
    paid: "bg-success/20 text-success",
    cancelled: "bg-danger/20 text-danger",
    pending: "bg-primary/20 text-primary",
    created: "bg-warning/20 text-warning",
    processing: "bg-primary/20 text-primary",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-teal-100 text-teal-800",
    returned: "bg-pink-100 text-pink-800",
    payment_pending: "bg-yellow-100 text-yellow-800",
  };

  // Get current phase index based on order status and payment method
  const getCurrentPhaseIndex = (order) => {
    const phases = getOrderPhases(order);
    let currentStatus = order.status;

    // For COD orders, handle payment status specially
    if (isCashOnDelivery(order)) {
      if (order.status === "delivered" && order.payment?.status !== "paid") {
        currentStatus = "payment_pending";
      } else if (
        order.payment?.status === "paid" &&
        order.status === "delivered"
      ) {
        currentStatus = "paid";
      }
    }

    const index = phases.findIndex((phase) => phase.status === currentStatus);
    return index !== -1 ? index : 0;
  };

  // Check if phase is completed
  const isPhaseCompleted = (phaseStatus, order) => {
    const phaseIndex = getOrderPhases(order).findIndex(
      (phase) => phase.status === phaseStatus,
    );
    const currentIndex = getCurrentPhaseIndex(order);
    return phaseIndex <= currentIndex;
  };

  // Check if phase is current
  const isPhaseCurrent = (phaseStatus, order) => {
    let currentStatus = order.status;

    if (isCashOnDelivery(order)) {
      if (order.status === "delivered" && order.payment?.status !== "paid") {
        currentStatus = "payment_pending";
      } else if (
        order.payment?.status === "paid" &&
        order.status === "delivered"
      ) {
        currentStatus = "paid";
      }
    }

    return phaseStatus === currentStatus;
  };

  // Check notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Check if review period has expired (7 days after delivery)
  const isReviewPeriodExpired = (deliveryDate) => {
    if (!deliveryDate) return true;

    const delivery = new Date(deliveryDate);
    const now = new Date();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    return now - delivery > sevenDaysInMs;
  };

  // Check if order should show review button
  const shouldShowReviewButton = (order) => {
    if (order.status !== "delivered") return false;

    // Check if already reviewed
    if (reviewedOrders.has(order._id)) return false;

    // Check if review period expired (7 days after delivery)
    const deliveryDate =
      order.deliveredAt || order.updatedAt || order.createdAt;
    if (isReviewPeriodExpired(deliveryDate)) return false;

    return true;
  };

  // Check which products have been reviewed
  const checkReviewedProducts = useCallback(
    async (ordersData) => {
      if (!token) return;

      try {
        // Fetch user's reviews
        const reviewsRes = await axios
          .get(`${apiUrl}/api/reviews/my-reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => {
            // If error, return empty array
            return { data: { reviews: [] } };
          });

        const userReviews = reviewsRes.data.reviews || [];
        const reviewedOrderIds = new Set();

        // For each order, check if its products have been reviewed
        ordersData.forEach((order) => {
          if (order.status === "delivered" && order.items) {
            const hasReviewedProduct = order.items.some((item) => {
              return userReviews.some(
                (review) => review.product?._id === item.product?._id,
              );
            });

            if (hasReviewedProduct) {
              reviewedOrderIds.add(order._id);
            }
          }
        });

        setReviewedOrders(reviewedOrderIds);
      } catch {
        // Continue with empty set of reviewed orders
        setReviewedOrders(new Set());
      }
    },
    [token, apiUrl],
  );

  // Mark an order as reviewed
  const markOrderAsReviewed = (orderId) => {
    setReviewedOrders((prev) => new Set(prev).add(orderId));
    // Save to localStorage
    const updated = new Set([...reviewedOrders, orderId]);
    localStorage.setItem("reviewedOrders", JSON.stringify(Array.from(updated)));
  };

  // Load reviewed orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reviewedOrders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReviewedOrders(new Set(parsed));
      } catch {
        // Silently handle error
      }
    }
  }, []);

  // Fetch user orders
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/order/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = res.data.data || [];
        setOrders(ordersData);

        // Check for reviewed products
        await checkReviewedProducts(ordersData);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, apiUrl, checkReviewedProducts]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.info("Your browser doesn't support notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        toast.success(
          "Notifications enabled! You'll get alerts for order updates.",
        );
        // Show a test notification
        new Notification("Notifications Enabled!", {
          body: "You'll now receive notifications for your orders.",
          icon: "/favicon.ico",
        });
      } else if (permission === "denied") {
        toast.warn(
          "Notifications blocked. You can enable them in your browser settings.",
        );
      }
    } catch {
      toast.error("Failed to request notification permission");
    }
  };

  /**
   * Check for delivered orders and show notifications
   */
  useEffect(() => {
    if (orders.length === 0) return;

    const newlyDeliveredOrders = orders.filter(
      (order) =>
        order.status === "delivered" && !notifiedDeliveries.has(order._id),
    );

    newlyDeliveredOrders.forEach((order) => {
      toast.success(
        `🎉 Order #${order._id.slice(
          -6,
        )} delivered! You can now review the products.`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `order-delivered-${order._id}`,
        },
      );

      // Show system notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notification = new Notification("🎉 Order Delivered!", {
            body: `Order #${order._id.slice(
              -6,
            )} has been delivered. Click to review products.`,
            icon: "/favicon.ico",
            tag: `order-delivered-${order._id}`,
          });

          notification.onclick = () => {
            window.focus();
            setSelectedOrder(order);
            notification.close();
          };

          setTimeout(() => notification.close(), 10000);
        } catch {
          // Silently handle notification error
        }
      }

      setNotifiedDeliveries((prev) => new Set(prev).add(order._id));
    });
  }, [orders, notifiedDeliveries]);

  // Save notified deliveries to localStorage
  useEffect(() => {
    if (notifiedDeliveries.size > 0) {
      localStorage.setItem(
        "notifiedDeliveries",
        JSON.stringify(Array.from(notifiedDeliveries)),
      );
    }
  }, [notifiedDeliveries]);

  // Load notified deliveries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notifiedDeliveries");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifiedDeliveries(new Set(parsed));
      } catch {
        // Silently handle error
      }
    }
  }, []);

  // Handle navigation to write review page
  const handleWriteReview = (order, e) => {
    if (e) e.stopPropagation();
    markOrderAsReviewed(order._id);
    setSelectedOrder(null); // Close the modal

    if (order.items.length > 0) {
      const product = order.items[0].product;
      const slug =
        product.slug ||
        (product.name
          ? product.name.toLowerCase().replace(/\s+/g, "-")
          : "product");
      navigate(`/products/${product._id}/${slug}?tab=reviews`);
    }
  };

  // Handle navigation to see review page
  const handleSeeReview = (order, e) => {
    if (e) e.stopPropagation();
    setSelectedOrder(null); // Close the modal

    if (order.items.length > 0) {
      const product = order.items[0].product;
      const slug =
        product.slug ||
        (product.name
          ? product.name.toLowerCase().replace(/\s+/g, "-")
          : "product");
      navigate(`/products/${product._id}/${slug}?tab=reviews`);
    }
  };

  const handlePayment = (order, e) => {
    if (e) e.stopPropagation();
    setSelectedOrder(null); // Close the modal
    navigate("/checkout", {
      state: { existingOrder: order, isExistingOrderPayment: true },
    });
  };

  // Get days remaining for review
  const getDaysRemainingForReview = (deliveryDate) => {
    if (!deliveryDate) return 0;

    const delivery = new Date(deliveryDate);
    const now = new Date();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const timePassed = now - delivery;
    const daysRemaining = Math.ceil(
      (sevenDaysInMs - timePassed) / (24 * 60 * 60 * 1000),
    );

    return Math.max(0, daysRemaining);
  };

  // Get payment status text for COD orders
  const getPaymentStatusText = (order) => {
    if (!isCashOnDelivery(order)) return null;

    if (order.payment?.status === "paid") {
      return {
        text: "Payment Completed",
        color: "text-green-600",
        icon: "fa-solid fa-check-circle",
      };
    } else if (order.status === "delivered") {
      return {
        text: "Awaiting Payment",
        color: "text-yellow-600",
        icon: "fa-solid fa-clock",
      };
    }
    return null;
  };

  // Phase tracker component
  const OrderPhaseTracker = ({ order }) => {
    const phases = getOrderPhases(order);
    const currentIndex = getCurrentPhaseIndex(order);
    const isCOD = isCashOnDelivery(order);
    const paymentStatus = getPaymentStatusText(order);

    return (
      <div className="relative py-8 px-4">
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="relative flex justify-between items-center">
            {/* Progress Line Background */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

            {/* Progress Line Active */}
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-linear-to-r from-blue-500 to-green-500 -translate-y-1/2 z-0"
              initial={{ width: "0%" }}
              animate={{
                width: `${(currentIndex / (phases.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Phase Steps */}
            {phases.map((phase, idx) => {
              const isCompleted = isPhaseCompleted(phase.status, order);
              const isCurrent = isPhaseCurrent(phase.status, order);

              return (
                <div
                  key={phase.status}
                  className="relative z-10 flex flex-col items-center flex-1"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? `${phase.activeColor} text-white shadow-lg`
                        : "bg-gray-200 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-offset-2 ring-blue-400" : ""}`}
                  >
                    <i className={`${phase.icon} text-xl`}></i>
                  </motion.div>
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {phase.label}
                    </p>
                    {isCurrent && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-blue-600 mt-1"
                      >
                        Current
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View - Vertical Timeline */}
        <div className="md:hidden">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {phases.map((phase, idx) => {
              const isCompleted = isPhaseCompleted(phase.status, order);
              const isCurrent = isPhaseCurrent(phase.status, order);

              if (!isCompleted && !isCurrent && idx > currentIndex + 1)
                return null;

              return (
                <motion.div
                  key={phase.status}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex items-start mb-8 last:mb-0"
                >
                  {/* Icon */}
                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? `${phase.activeColor} text-white shadow-lg`
                          : "bg-gray-200 text-gray-400"
                      } ${
                        isCurrent ? "ring-4 ring-offset-2 ring-blue-400" : ""
                      }`}
                    >
                      <i className={`${phase.icon} text-xl`}></i>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <p
                        className={`font-semibold ${
                          isCompleted ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {phase.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {phase.description}
                      </p>
                      {isCurrent && (
                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Current Status
                        </span>
                      )}
                      {isCompleted && !isCurrent && (
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Status Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
        >
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-info-circle text-blue-500 mt-0.5"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Current Status: {phases[currentIndex]?.label}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {phases[currentIndex]?.description}
              </p>
              {isCOD && paymentStatus && order.status === "delivered" && (
                <div
                  className={`mt-2 text-xs ${paymentStatus.color} flex items-center gap-1`}
                >
                  <i className={paymentStatus.icon}></i>
                  <span>{paymentStatus.text}</span>
                </div>
              )}
              {order.status === "shipped" && (
                <p className="text-xs text-blue-600 mt-2">
                  <i className="fa-solid fa-truck-fast mr-1"></i>
                  Estimated delivery: Within 3-5 business days
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <ToastContainer />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </>
    );
  }

  // Empty orders state
  if (!orders.length) {
    return (
      <>
        <ToastContainer />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">No orders found</p>
            <Btn
              variant="primary"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              Start Shopping
            </Btn>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      {/* Show notification button only if permission is not granted */}
      {notificationPermission !== "granted" && (
        <div className="fixed bottom-4 right-4 z-50">
          <Btn
            variant="primary"
            onClick={requestNotificationPermission}
            className="shadow-lg"
          >
            <i className="fa-solid fa-bell mr-2"></i>
            Enable Notifications
          </Btn>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold text-secondary/55">
            My Orders
          </h2>
          <div className="text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Orders grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const showReviewBtn = shouldShowReviewButton(order);
            const isReviewed = reviewedOrders.has(order._id);
            const deliveryDate =
              order.deliveredAt || order.updatedAt || order.createdAt;
            const daysRemaining = getDaysRemainingForReview(deliveryDate);
            const phases = getOrderPhases(order);
            const currentIndex = getCurrentPhaseIndex(order);
            const currentPhase = phases[currentIndex];
            const isCOD = isCashOnDelivery(order);
            const paymentStatus = getPaymentStatusText(order);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="bg-container rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                {/* Order Header */}
                <div className="p-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="text-sm font-mono font-medium">
                        {order._id.slice(-8)}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      <i className="fa-regular fa-calendar mr-1"></i>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">
                      Total: ৳{order.total.toLocaleString()}
                    </span>
                  </div>
                  {isCOD && (
                    <div className="mt-2 text-xs">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        <i className="fa-solid fa-truck mr-1"></i>
                        Cash on Delivery
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Items Preview */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={
                          order.items[0]?.product?.images?.[0]?.url ||
                          "/placeholder.jpg"
                        }
                        alt={order.items[0]?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-1">
                        {order.items[0]?.name}
                      </p>
                      {order.items.length > 1 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 1} more item
                          {order.items.length - 1 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mini Status Indicator */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-xs">
                      <i
                        className={`${
                          currentPhase.icon
                        } ${currentPhase.color.replace("bg-", "text-")}`}
                      ></i>
                      <span className="text-gray-600">
                        {currentPhase.label}
                      </span>
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{
                            width: `${
                              (currentIndex / (phases.length - 1)) * 100
                            }%`,
                          }}
                          className={`h-full ${currentPhase.color} rounded-full`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Status for COD */}
                  {isCOD && paymentStatus && order.status === "delivered" && (
                    <div
                      className={`mt-2 text-xs ${paymentStatus.color} flex items-center gap-1`}
                    >
                      <i className={paymentStatus.icon}></i>
                      <span>{paymentStatus.text}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4">
                  <div className="flex flex-col xs:flex-row gap-2">
                    {/* First row of buttons */}
                    <div className="flex flex-1 gap-2">
                      {order.status === "created" && !isCOD && (
                        <Btn
                          variant="primary"
                          onClick={(e) => handlePayment(order, e)}
                          className="text-xs py-2 px-3 rounded-lg flex-1 min-w-0"
                          size="sm"
                        >
                          <i className="fa-solid fa-credit-card mr-1"></i>
                          <span className="hidden xs:inline">Pay Now</span>
                          <span className="xs:hidden">Pay</span>
                        </Btn>
                      )}

                      {showReviewBtn && (
                        <Btn
                          variant="success"
                          onClick={(e) => handleWriteReview(order, e)}
                          className="text-xs py-2 px-3 rounded-lg flex-1 min-w-0"
                          size="sm"
                        >
                          <i className="fa-solid fa-star mr-1"></i>
                          <span className="hidden xs:inline">
                            Write Review
                            {daysRemaining > 0 && (
                              <span className="ml-1 text-xs">
                                ({daysRemaining}d)
                              </span>
                            )}
                          </span>
                          <span className="xs:hidden">
                            Review
                            {daysRemaining > 0 && (
                              <span className="ml-1 text-xs">
                                ({daysRemaining}d)
                              </span>
                            )}
                          </span>
                        </Btn>
                      )}

                      {order.status === "delivered" && isReviewed && (
                        <Btn
                          variant="outline"
                          onClick={(e) => handleSeeReview(order, e)}
                          className="text-xs py-2 px-3 rounded-lg flex-1 min-w-0"
                          size="sm"
                        >
                          <i className="fa-solid fa-eye mr-1"></i>
                          <span className="hidden xs:inline">View Review</span>
                          <span className="xs:hidden">View</span>
                        </Btn>
                      )}
                    </div>

                    {/* Track Order button - separate row or column based on screen size */}
                    <div className="flex xs:flex-none">
                      <Btn
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="text-xs py-2 px-3 rounded-lg w-full xs:w-auto min-w-0"
                        size="sm"
                      >
                        <i className="fa-solid fa-chart-line mr-1"></i>
                        <span className="hidden xs:inline">Track Order</span>
                        <span className="xs:hidden">Track</span>
                      </Btn>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Details Modal/Popup with Phase Tracker */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-xs bg-black/50 flex justify-center items-center z-50 p-2 sm:p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-primarybg rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-y-auto max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 cursor-pointer z-10 flex items-center justify-center"
                onClick={() => setSelectedOrder(null)}
              >
                <i className="fa-solid fa-x"></i>
              </button>

              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Order Details
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Order #{selectedOrder._id}
                </p>

                {/* Phase Tracker */}
                <OrderPhaseTracker order={selectedOrder} />

                {/* Order Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-sm font-medium capitalize">
                      {selectedOrder.payment?.method === "cash_on_delivery"
                        ? "Cash on Delivery"
                        : selectedOrder.payment?.method || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                    <p className="text-sm font-medium">
                      ৳{selectedOrder.subtotal?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Shipping Fee</p>
                    <p className="text-sm font-medium">
                      ৳{selectedOrder.shippingFee?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-primary">
                      ৳{selectedOrder.total?.toLocaleString()}
                    </p>
                  </div>
                  {isCashOnDelivery(selectedOrder) && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Payment Status
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          selectedOrder.payment?.status === "paid"
                            ? "text-green-600"
                            : selectedOrder.status === "delivered"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {selectedOrder.payment?.status === "paid"
                          ? "✓ Payment Completed"
                          : selectedOrder.status === "delivered"
                          ? "⏳ Awaiting Payment Collection"
                          : "Payment pending (to be collected at delivery)"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons in Modal */}
                <div className="flex gap-3 mt-6">
                  {selectedOrder.status === "created" &&
                    !isCashOnDelivery(selectedOrder) && (
                      <Btn
                        variant="primary"
                        onClick={() => handlePayment(selectedOrder)}
                        className="flex-1 py-3 rounded-lg"
                      >
                        <i className="fa-solid fa-credit-card mr-2"></i> Make
                        Payment
                      </Btn>
                    )}

                  {selectedOrder.status === "delivered" &&
                    shouldShowReviewButton(selectedOrder) && (
                      <Btn
                        variant="success"
                        onClick={() => handleWriteReview(selectedOrder)}
                        className="flex-1 py-3 rounded-lg"
                      >
                        <i className="fa-solid fa-star mr-2"></i> Write Review
                      </Btn>
                    )}

                  {selectedOrder.status === "delivered" &&
                    reviewedOrders.has(selectedOrder._id) && (
                      <Btn
                        variant="outline"
                        onClick={() => handleSeeReview(selectedOrder)}
                        className="flex-1 py-3 rounded-lg border-primary text-primary hover:bg-primary/5"
                      >
                        <i className="fa-solid fa-eye mr-2"></i> See Your Review
                      </Btn>
                    )}
                </div>

                {/* Products List */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-box"></i>
                    Products ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedOrder.items.map((item) => (
                      <motion.div
                        key={item._id || item.product._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                      >
                        <img
                          src={
                            item.product?.images?.[0]?.url || "/placeholder.jpg"
                          }
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            Qty: {item.qty} × ৳{item.price.toLocaleString()}
                          </div>
                          {selectedOrder.status === "delivered" && (
                            <div className="mt-2">
                              {reviewedOrders.has(selectedOrder._id) ? (
                                <button
                                  onClick={() => {
                                    const slug =
                                      item.product.slug ||
                                      (item.product.name
                                        ? item.product.name
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")
                                        : "product");
                                    navigate(
                                      `/products/${item.product._id}/${slug}?tab=reviews`,
                                    );
                                  }}
                                  className="text-xs text-primary hover:text-primary/80 underline cursor-pointer"
                                >
                                  <i className="fa-solid fa-eye mr-1"></i> See
                                  Review
                                </button>
                              ) : getDaysRemainingForReview(
                                  selectedOrder.deliveredAt ||
                                    selectedOrder.updatedAt,
                                ) > 0 ? (
                                <button
                                  onClick={() => {
                                    const slug =
                                      item.product.slug ||
                                      (item.product.name
                                        ? item.product.name
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")
                                        : "product");
                                    navigate(
                                      `/products/${item.product._id}/${slug}?tab=reviews`,
                                    );
                                  }}
                                  className="text-xs text-primary hover:text-primary/80 underline cursor-pointer"
                                >
                                  <i className="fa-solid fa-star mr-1"></i>{" "}
                                  Write Review
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  <i className="fa-solid fa-clock mr-1"></i>{" "}
                                  Review closed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="font-semibold text-gray-900">
                          ৳{(item.price * item.qty).toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-location-dot"></i>
                      Shipping Address
                    </h4>
                    <p className="text-sm text-gray-700">
                      {selectedOrder.shippingAddress.fullName}
                      <br />
                      {selectedOrder.shippingAddress.addressLine}
                      <br />
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.postalCode}
                      <br />
                      {selectedOrder.shippingAddress.country}
                      <br />
                      Phone: {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
