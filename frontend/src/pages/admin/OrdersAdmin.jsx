/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import Btn from "../../components/Common/Btn";
import Select from "react-select";

export default function OrdersAdmin() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const { token } = useAuth() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Status options for dropdown
  const statusOptions = [
    { value: "created", label: "Created", color: "bg-gray-500" },
    { value: "paid", label: "Paid", color: "bg-blue-500" },
    { value: "processing", label: "Processing", color: "bg-yellow-500" },
    { value: "shipped", label: "Shipped", color: "bg-purple-500" },
    { value: "delivered", label: "Delivered", color: "bg-green-500" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
    { value: "returned", label: "Returned", color: "bg-orange-500" },
  ];

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/api/order`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const ordersData = res.data.data || res.data.orders || res.data || [];
      setOrders(ordersData);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      alert(
        "Failed to load orders: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Group orders by date (createdAt)
  const groupOrdersByDate = (orders) => {
    const grouped = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    });

    return grouped;
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const authToken = token || localStorage.getItem("token");

      const res = await axios.put(
        `${apiUrl}/api/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      await fetchOrders(); // Refresh orders
      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert(
        "Failed to update order status: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setUpdatingOrder(orderId);
      const authToken = token || localStorage.getItem("token");

      await axios.put(
        `${apiUrl}/api/order/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      await fetchOrders(); // Refresh orders
      alert("Order cancelled successfully!");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert(
        "Failed to cancel order: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    )
      return;

    try {
      setUpdatingOrder(orderId);
      const authToken = token || localStorage.getItem("token");

      await axios.delete(`${apiUrl}/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      await fetchOrders(); // Refresh orders
      alert("Order deleted successfully!");
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert(
        "Failed to delete order: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Mark order as paid
  const markAsPaid = async (orderId) => {
    if (!window.confirm("Mark this order as paid?")) return;

    try {
      setUpdatingOrder(orderId);
      const authToken = token || localStorage.getItem("token");

      await axios.put(
        `${apiUrl}/api/order/${orderId}/pay`,
        { method: "manual" },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      await fetchOrders(); // Refresh orders
      alert("Order marked as paid successfully!");
    } catch (err) {
      console.error("Failed to mark order as paid:", err);
      alert(
        "Failed to mark order as paid: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "bg-gray-500";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedOrders = groupOrdersByDate(orders);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 font-urbanist">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-urbanist">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary mb-2">
          Orders Management
        </h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Total Orders: {orders.length}
          </div>
          <Btn
            variant="primary"
            onClick={fetchOrders}
            className="px-4 py-2 rounded"
          >
            <i className="fa-solid fa-refresh mr-2"></i>
            Refresh
          </Btn>
        </div>
      </div>

      {/* Orders by Date */}
      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center py-12">
          <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-500">
            No orders found
          </h3>
          <p className="text-gray-400">There are no orders to display.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedOrders).map(([date, dateOrders]) => (
            <div key={date} className="border rounded-lg overflow-hidden">
              {/* Date Header */}
              <div className="bg-secondary text-white px-6 py-3">
                <h2 className="text-xl font-semibold">{date}</h2>
                <p className="text-secondary/80 text-sm">
                  {dateOrders.length} order{dateOrders.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Orders List */}
              <div className="divide-y">
                {dateOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                      {/* Order Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          ></span>
                          <span className="font-semibold capitalize">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Order ID: {order._id?.slice(-8) || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.user?.fullName || "Customer"} •{" "}
                          {order.user?.email || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {/* Items Summary */}
                      <div>
                        <p className="font-medium mb-1">
                          {order.items?.length || 0} item
                          {order.items?.length !== 1 ? "s" : ""}
                        </p>
                        <div className="text-sm text-gray-600 space-y-1">
                          {(order.items || [])
                            .slice(0, 2)
                            .map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="truncate max-w-[120px]">
                                  {item.name}
                                </span>
                                <span>×{item.qty}</span>
                              </div>
                            ))}
                          {(order.items || []).length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{(order.items || []).length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment & Total */}
                      <div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span>{formatCurrency(order.shippingFee)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Total:</span>
                            <span className="text-lg">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          Payment: {order.payment?.status || "pending"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {/* Status Dropdown */}
                          <Select
                            options={statusOptions}
                            value={statusOptions.find(
                              (opt) => opt.value === order.status
                            )}
                            onChange={(selected) =>
                              updateOrderStatus(order._id, selected.value)
                            }
                            className="flex-1 min-w-[140px]"
                            styles={{
                              control: (base) => ({
                                ...base,
                                border: "1px solid #d1d5db",
                                borderRadius: "0.375rem",
                                fontSize: "0.875rem",
                                minHeight: "32px",
                              }),
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                            menuPortalTarget={document.body}
                            isDisabled={updatingOrder === order._id}
                          />

                          {/* Action Buttons */}
                          <div className="flex gap-1">
                            <Btn
                              variant="primary"
                              onClick={() => viewOrderDetails(order)}
                              className="px-3 py-1 text-sm"
                              title="View Details"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </Btn>

                            {order.payment?.status !== "paid" &&
                              order.status !== "cancelled" && (
                                <Btn
                                  variant="success"
                                  onClick={() => markAsPaid(order._id)}
                                  className="px-3 py-1 text-sm"
                                  disabled={updatingOrder === order._id}
                                  title="Mark as Paid"
                                >
                                  <i className="fa-solid fa-check"></i>
                                </Btn>
                              )}

                            {order.status !== "cancelled" && (
                              <Btn
                                variant="warning"
                                onClick={() => cancelOrder(order._id)}
                                className="px-3 py-1 text-sm"
                                disabled={updatingOrder === order._id}
                                title="Cancel Order"
                              >
                                <i className="fa-solid fa-ban"></i>
                              </Btn>
                            )}

                            <Btn
                              variant="danger"
                              onClick={() => deleteOrder(order._id)}
                              className="px-3 py-1 text-sm"
                              disabled={updatingOrder === order._id}
                              title="Delete Order"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </Btn>
                          </div>
                        </div>

                        {updatingOrder === order._id && (
                          <div className="text-xs text-blue-600 flex items-center gap-1">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Updating...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primarybg rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-secondary">Order ID: {selectedOrder._id}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-secondary hover:text-danger text-xl transition-all duration-200 cursor-pointer"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status & Payment */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded p-4">
                      <h3 className="font-semibold mb-2">Order Status</h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        ></span>
                        <span className="capitalize">
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                    <div className="border rounded p-4">
                      <h3 className="font-semibold mb-2">Payment Status</h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            selectedOrder.payment?.status === "paid"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        ></span>
                        <span className="capitalize">
                          {selectedOrder.payment?.status || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {(selectedOrder.items || []).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-secondary">
                              SKU: {item.sku}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.price)} × {item.qty}
                            </p>
                            <p className="text-sm text-secondary">
                              Total: {formatCurrency(item.price * item.qty)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="border rounded p-4">
                      <h3 className="font-semibold mb-4">Shipping Address</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Name:</strong>{" "}
                          {selectedOrder.shippingAddress.fullName}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {selectedOrder.shippingAddress.phone}
                        </p>
                        <p>
                          <strong>Address:</strong>{" "}
                          {selectedOrder.shippingAddress.addressLine}
                        </p>
                        <p>
                          <strong>City:</strong>{" "}
                          {selectedOrder.shippingAddress.city}
                        </p>
                        <p>
                          <strong>Postal Code:</strong>{" "}
                          {selectedOrder.shippingAddress.postalCode}
                        </p>
                        <p>
                          <strong>Country:</strong>{" "}
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Totals & Actions */}
                <div className="space-y-6">
                  {/* Totals */}
                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Fee:</span>
                        <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-4">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Created:</strong>{" "}
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                      <p>
                        <strong>Updated:</strong>{" "}
                        {formatDate(selectedOrder.updatedAt)}
                      </p>
                      {selectedOrder.payment?.paidAt && (
                        <p>
                          <strong>Paid At:</strong>{" "}
                          {formatDate(selectedOrder.payment.paidAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border rounded p-4">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Select
                        options={statusOptions}
                        value={statusOptions.find(
                          (opt) => opt.value === selectedOrder.status
                        )}
                        onChange={(selected) => {
                          updateOrderStatus(selectedOrder._id, selected.value);
                          setShowOrderModal(false);
                        }}
                        styles={{
                              control: (base) => ({
                                ...base,
                                border: "1px solid #d1d5db",
                                borderRadius: "0.375rem",
                                fontSize: "0.875rem",
                                minHeight: "32px",
                              }),
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                            menuPortalTarget={document.body}
                        placeholder="Update Status"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {selectedOrder.payment?.status !== "paid" &&
                          selectedOrder.status !== "cancelled" && (
                            <Btn
                              variant="success"
                              onClick={() => {
                                markAsPaid(selectedOrder._id);
                                setShowOrderModal(false);
                              }}
                              className="text-sm px-3 py-2 w-full"
                            >
                              Mark Paid
                            </Btn>
                          )}
                        {selectedOrder.status !== "cancelled" && (
                          <Btn
                            variant="warning"
                            onClick={() => {
                              cancelOrder(selectedOrder._id);
                              setShowOrderModal(false);
                            }}
                            className="text-sm px-3 py-2 w-full"
                          >
                            Cancel
                          </Btn>
                        )}
                        <Btn
                          variant="danger"
                          onClick={() => {
                            deleteOrder(selectedOrder._id);
                            setShowOrderModal(false);
                          }}
                          className="text-sm px-3 py-2 w-full col-span-2"
                        >
                          Delete Order
                        </Btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
