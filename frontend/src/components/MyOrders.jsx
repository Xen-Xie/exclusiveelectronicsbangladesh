import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router";
import Btn from "./Common/Btn";

export default function MyOrders() {
  const { token } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status colors mapping
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
  // Get User Orders
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/order/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.data || []);
      } catch (error) {
        console.error(
          "Error fetching orders:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, apiUrl]);

  if (loading)
    return <div className="text-center py-10">Loading orders...</div>;
  if (!orders.length)
    return <div className="text-center py-10">No orders found</div>;

  const handlePayment = (order) => {
    navigate("/checkout", {
      state: {
        existingOrder: order,
        isExistingOrderPayment: true,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6 text-secondary/55">
        My Orders
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-container rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex justify-between items-center">
              <div className="font-medium text-[#0A0A0A] font-inter">
                {order.items[0]?.name || "Unnamed Order"}
                {order.items.length > 1 && ` +${order.items.length - 1} more`}
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
            <div className="text-secondary text-sm">Total: ৳{order.total}</div>
          </div>
        ))}
      </div>

      {/* Popup */}
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
            </div>

            {/* Make Payment Button */}
            {selectedOrder.status === "created" && (
              <Btn
                variant="primary"
                onClick={() => handlePayment(selectedOrder)}
                className="mb-4 w-full py-2 rounded"
              >
                Make Payment
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
                  </div>
                  <div className="font-medium text-gray-900">৳{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
