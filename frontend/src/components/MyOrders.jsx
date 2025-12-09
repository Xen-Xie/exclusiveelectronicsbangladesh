import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router";
import Btn from "./Common/Btn";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
                (review) => review.product?._id === item.product?._id
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
    [token, apiUrl]
  );

  // Mark an order as reviewed
  const markOrderAsReviewed = (orderId) => {
    setReviewedOrders((prev) => new Set(prev).add(orderId));
    // Save to localStorage
    const updated = new Set(reviewedOrders).add(orderId);
    localStorage.setItem("reviewedOrders", JSON.stringify(Array.from(updated)));
  };

  // Load reviewed orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reviewedOrders");
    if (saved) {
      try {
        setReviewedOrders(new Set(JSON.parse(saved)));
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
          "Notifications enabled! You'll get alerts for order updates."
        );
        // Show a test notification
        if (Notification.permission === "granted") {
          new Notification("Notifications Enabled!", {
            body: "You'll now receive notifications for your orders.",
            icon: "/favicon.ico",
          });
        }
      } else if (permission === "denied") {
        toast.warn(
          "Notifications blocked. You can enable them in your browser settings."
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
        order.status === "delivered" && !notifiedDeliveries.has(order._id)
    );

    newlyDeliveredOrders.forEach((order) => {
      toast.success(
        `🎉 Order #${order._id.slice(
          -6
        )} delivered! You can now review the products.`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `order-delivered-${order._id}`,
        }
      );

      // Show system notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notification = new Notification("🎉 Order Delivered!", {
            body: `Order #${order._id.slice(
              -6
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
        JSON.stringify(Array.from(notifiedDeliveries))
      );
    }
  }, [notifiedDeliveries]);

  // Load notified deliveries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notifiedDeliveries");
    if (saved) {
      try {
        setNotifiedDeliveries(new Set(JSON.parse(saved)));
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
      (sevenDaysInMs - timePassed) / (24 * 60 * 60 * 1000)
    );

    return Math.max(0, daysRemaining);
  };

  // Loading state
  if (loading)
    return (
      <>
        <ToastContainer />
        <div className="text-center py-10">Loading orders...</div>
      </>
    );

  // Empty orders state
  if (!orders.length)
    return (
      <>
        <ToastContainer />
        <div className="text-center py-10">No orders found</div>
      </>
    );

  return (
    <>
      <ToastContainer />
      {/* Show notification button only if permission is not granted */}
      {notificationPermission !== "granted" && (
        <Btn
          variant="primary"
          onClick={requestNotificationPermission}
          className="text-sm"
        >
          <i className="fa-solid fa-bell"></i>
          Enable Notifications
        </Btn>
      )}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold text-secondary/55">
            My Orders
          </h2>
        </div>

        {/* Orders grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {orders.map((order) => {
            const showReviewBtn = shouldShowReviewButton(order);
            const isReviewed = reviewedOrders.has(order._id);
            const deliveryDate =
              order.deliveredAt || order.updatedAt || order.createdAt;
            const daysRemaining = getDaysRemainingForReview(deliveryDate);

            return (
              <div
                key={order._id}
                className="bg-container rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition relative"
                onClick={() => setSelectedOrder(order)}
              >
                <h1 className="text-center font-semibold leading-tight text-secondary/25 p-2 mb-1">
                  Click Here to see more details
                </h1>
                <div className="flex justify-between items-center">
                  <div className="font-medium text-clasic font-inter">
                    {order.items[0]?.name || "Unnamed Order"}
                    {order.items.length > 1 &&
                      ` +${order.items.length - 1} more`}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </div>
                </div>
                <div className="text-secondary text-sm mt-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="text-secondary text-sm">
                  Total: ৳{order.total}
                </div>

                {/* Review period info */}
                {order.status === "delivered" && !isReviewed && (
                  <div className="mt-2 text-xs text-gray-500">
                    {daysRemaining > 0 ? (
                      <span className="text-warning">
                        <i className="fa-solid fa-clock mr-1"></i>
                        {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                        remaining to review
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        <i className="fa-solid fa-clock mr-1"></i>
                        Review period expired
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  {order.status === "created" && (
                    <Btn
                      variant="primary"
                      onClick={(e) => handlePayment(order, e)}
                      className="text-xs py-1 px-3 rounded"
                      size="sm"
                    >
                      Make Payment
                    </Btn>
                  )}

                  {showReviewBtn && (
                    <Btn
                      variant="success"
                      onClick={(e) => handleWriteReview(order, e)}
                      className="text-xs py-1 px-3 rounded"
                      size="sm"
                    >
                      <i className="fa-solid fa-star mr-1"></i> Write Review
                    </Btn>
                  )}

                  {order.status === "delivered" && isReviewed && (
                    <Btn
                      variant="outline"
                      onClick={(e) => handleSeeReview(order, e)}
                      className="text-xs py-1 px-3 rounded"
                      size="sm"
                    >
                      <i className="fa-solid fa-eye mr-1"></i> See Review
                    </Btn>
                  )}

                  {order.status === "delivered" &&
                    !showReviewBtn &&
                    !isReviewed && (
                      <div className="text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded border border-gray-200">
                        {daysRemaining <= 0 && (
                          <span className="text-gray-400">
                            <i className="fa-solid fa-clock mr-1"></i>Review
                            closed
                          </span>
                        )}
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details Modal/Popup */}
      {selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/40 flex justify-center items-center z-50 p-2 sm:p-4">
          <div className="bg-primarybg rounded-2xl shadow-xl w-full max-w-lg sm:max-w-2xl p-4 sm:p-6 relative overflow-y-auto max-h-[92vh]">
            <button
              className="absolute top-3 right-3 text-danger hover:text-secondary transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedOrder(null)}
            >
              <i className="fa-solid fa-x"></i>
            </button>

            <h3 className="text-xl font-semibold mb-4 text-info">
              Order Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 mb-4">
              <div>
                <span className="font-medium">Order ID:</span>{" "}
                {selectedOrder._id}
              </div>

              <div>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                    statusColors[selectedOrder.status] ||
                    "bg-secondary/45 text-gray-800"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div>
                <span className="font-medium">Order Date:</span>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>

              <div>
                <span className="font-medium">Total:</span> ৳
                {selectedOrder.total}
              </div>

              <div className="sm:col-span-2">
                <span className="font-medium">Payment:</span>{" "}
                {selectedOrder.payment?.method || "N/A"}
              </div>

              {/* Show delivery date and review period info if delivered */}
              {selectedOrder.status === "delivered" && (
                <>
                  <div>
                    <span className="font-medium">Delivered:</span>{" "}
                    {new Date(
                      selectedOrder.deliveredAt || selectedOrder.updatedAt
                    ).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Review Status:</span>{" "}
                    {reviewedOrders.has(selectedOrder._id) ? (
                      <span className="text-green-600 font-medium">
                        <i className="fa-solid fa-check mr-1"></i>Reviewed
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        {getDaysRemainingForReview(
                          selectedOrder.deliveredAt || selectedOrder.updatedAt
                        ) > 0
                          ? `${getDaysRemainingForReview(
                              selectedOrder.deliveredAt ||
                                selectedOrder.updatedAt
                            )} days remaining`
                          : "Review period expired"}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Make Payment Button in Modal */}
            {selectedOrder.status === "created" && (
              <Btn
                variant="primary"
                onClick={() => handlePayment(selectedOrder)}
                className="mb-4 w-full py-2 rounded"
              >
                Make Payment
              </Btn>
            )}

            {/* Write Review Button in Modal */}
            {selectedOrder.status === "delivered" &&
              shouldShowReviewButton(selectedOrder) && (
                <Btn
                  variant="success"
                  onClick={() => handleWriteReview(selectedOrder)}
                  className="mb-4 w-full py-2 rounded"
                >
                  <i className="fa-solid fa-star mr-2"></i> Write Review for
                  Products
                </Btn>
              )}

            {/* See Review Button in Modal */}
            {selectedOrder.status === "delivered" &&
              reviewedOrders.has(selectedOrder._id) && (
                <Btn
                  variant="outline"
                  onClick={() => handleSeeReview(selectedOrder)}
                  className="mb-4 w-full py-2 rounded border-primary text-primary hover:bg-primary/5"
                >
                  <i className="fa-solid fa-eye mr-2"></i> See Your Review
                </Btn>
              )}

            <h4 className="font-medium text-info mb-2">Products</h4>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedOrder.items.map((item) => (
                <div
                  key={item._id || item.product._id}
                  className="flex items-center gap-4 p-3 bg-secondary/10 rounded-lg"
                >
                  <img
                    src={item.product?.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-secondary">
                      {item.name}
                    </div>
                    <div className="text-gray-500 text-sm">Qty: {item.qty}</div>
                    {/* Show if product has been reviewed */}
                    {selectedOrder.status === "delivered" && (
                      <div className="text-xs mt-1">
                        {reviewedOrders.has(selectedOrder._id) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const slug =
                                item.product.slug ||
                                (item.product.name
                                  ? item.product.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                  : "product");
                              navigate(
                                `/products/${item.product._id}/${slug}?tab=reviews`
                              );
                            }}
                            className="text-primary hover:text-primary/80 underline cursor-pointer"
                          >
                            See Your Review
                          </button>
                        ) : getDaysRemainingForReview(
                            selectedOrder.deliveredAt || selectedOrder.updatedAt
                          ) > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const slug =
                                item.product.slug ||
                                (item.product.name
                                  ? item.product.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                  : "product");
                              navigate(
                                `/products/${item.product._id}/${slug}?tab=reviews`
                              );
                            }}
                            className="text-primary hover:text-primary/80 underline cursor-pointer"
                          >
                            Write Review
                          </button>
                        ) : (
                          <span className="text-gray-500">Review closed</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="font-medium text-gray-900">৳{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
