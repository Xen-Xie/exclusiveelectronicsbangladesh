import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/useCart";
import { useLocation, useNavigate } from "react-router";
import Btn from "../components/Common/Btn";

function CheckOut() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { user, token } = useAuth();
  const { cart, removeItem, clearCart, updateQty } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're processing an existing order payment
  const { existingOrder, isExistingOrderPayment } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(existingOrder?._id || null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
  });
  const [paymentMethod, setPaymentMethod] = useState("ssl");

  // Calculate totals based on whether it's an existing order or new cart
  const subtotal = isExistingOrderPayment
    ? existingOrder.subtotal
    : cart.reduce(
        (sum, item) =>
          sum + (item.salePrice ? item.salePrice : item.price) * item.quantity,
        0
      );

  const shipping = isExistingOrderPayment ? existingOrder.shippingFee : 0;
  const total = isExistingOrderPayment
    ? existingOrder.total
    : subtotal + shipping;

  // Load user profile and existing order data
  useEffect(() => {
    if (isExistingOrderPayment && existingOrder) {
      // For existing orders, use the order's shipping address
      setForm({
        fullName: existingOrder.shippingAddress?.fullName || "",
        phone: existingOrder.shippingAddress?.phone || "",
        address: existingOrder.shippingAddress?.address || "",
        city: existingOrder.shippingAddress?.city || "",
        postalCode: existingOrder.shippingAddress?.postalCode || "",
        country: existingOrder.shippingAddress?.country || "Bangladesh",
      });
      setPaymentMethod(existingOrder.payment?.method || "ssl");
      setLoading(false);
    } else if (!token) {
      // Changed from !user?._id to !token
      // If no token, user is not authenticated
      setLoading(false);
      return;
    } else {
      // For new orders, load user data as before
      const loadUserData = async () => {
        try {
          const res = await axios.get(`${apiUrl}/api/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const u = res.data.data || res.data;
          setForm({
            fullName: u.fullName || "",
            phone: u.phoneNumber || "",
            address: u.address || "",
            city: u.city || "",
            postalCode: u.postalCode || "",
            country: "Bangladesh",
          });
        } catch (e) {
          console.error("Failed to fetch user:", e);
        } finally {
          setLoading(false);
        }
      };

      loadUserData();
    }
  }, [user, token, apiUrl, isExistingOrderPayment, existingOrder]);

  // Create order (only for new orders)
  const createOrder = async () => {
    // Fix: Check for token instead of user._id since token is more reliable for auth
    if (!token) {
      alert("You must login first to create an order!");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (cart.length === 0) return alert("Cart is empty!");

    try {
      // Update user profile
      await axios.put(
        `${apiUrl}/api/user/update`,
        {
          phoneNumber: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Create new order
      const orderRes = await axios.post(
        `${apiUrl}/api/order`,
        {
          items: cart.map((i) => ({
            product: i._id,
            name: i.name,
            price: i.price || i.salePrice,
            qty: i.quantity,
            image: i.image,
          })),
          shippingAddress: form,
          subtotal,
          shippingFee: shipping,
          total,
          payment: {
            method: paymentMethod, // Send the selected method
            status: "pending",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrderId(orderRes.data.data._id);
    } catch (e) {
      console.error("Create order failed:", e);
      if (e.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login", { state: { from: "/checkout" } });
      } else {
        alert("Failed to create order!");
      }
    }
  };

  // Checkout works for both new and existing orders
  const handleCheckout = async () => {
    if (!orderId) return alert("No order found!");
    try {
      if (paymentMethod === "ssl") {
        const payRes = await axios.post(
          `${apiUrl}/api/payment/init/${orderId}`
        );
        window.location.href = payRes.data.url;
        return;
      }
      window.location.href = `/payment-success?order=${orderId}`;
    } catch (e) {
      console.error("Checkout failed:", e);
      alert("Checkout failed!");
    }
  };

  if (loading) return <p className="p-5 text-center">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-10 font-urbanist">
      {/* Order Items */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isExistingOrderPayment ? "Order Items" : "Your Cart"}
          </h2>
          {!isExistingOrderPayment && (
            <Btn
              onClick={clearCart}
              disabled={!!orderId}
              className={`text-danger font-medium hover:underline px-1.5 py-1 ${
                orderId ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Clear Cart
            </Btn>
          )}
        </div>

        {isExistingOrderPayment ? (
          // Display existing order items
          existingOrder.items.map((item) => (
            <div
              key={item._id || item.product._id}
              className="flex flex-col xs:flex-row gap-4 border p-3 rounded-lg items-start xs:items-center"
            >
              <img
                src={
                  item.product?.images?.[0]?.url ||
                  item.image?.url ||
                  "/placeholder.jpg"
                }
                alt={item.name}
                className="w-full xs:w-20 h-40 xs:h-20 object-cover rounded"
              />

              <div className="flex-1 w-full">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2.5 py-0.5 border rounded-xl bg-secondary/10 text-classic">
                    Qty: {item.qty}
                  </span>
                </div>
              </div>

              <div className="w-full xs:w-auto text-right mt-3 xs:mt-0">
                <p className="font-semibold text-secondary/85">
                  {item.salePrice ? (
                    <>
                      <span className="text-danger text-xs sm:text-base md:text-md">
                        ৳{item.salePrice * item.qty}
                      </span>
                    </>
                  ) : (
                    <>৳ {item.price * item.qty}</>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : cart.length === 0 ? (
          <p className="text-secondary/55 text-center">Your cart is empty.</p>
        ) : (
          // Display cart items for new orders
          cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-col xs:flex-row gap-4 border p-3 rounded-lg items-start xs:items-center"
            >
              <img
                src={
                  item.image?.url ||
                  item.image ||
                  item.images?.[0]?.url ||
                  item.images?.[0] ||
                  "/placeholder.jpg"
                }
                alt={item.name}
                className="w-full xs:w-20 h-40 xs:h-20 object-cover rounded"
              />

              <div className="flex-1 w-full">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <Btn
                    variant="outline"
                    className="px-2 py-1 border rounded"
                    onClick={() =>
                      updateQty(item._id, Math.max(1, item.quantity - 1))
                    }
                  >
                    -
                  </Btn>
                  <span>{item.quantity}</span>
                  <Btn
                    variant="outline"
                    className={`px-2 py-1 border rounded ${
                      item.quantity >= item.stock
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={item.quantity >= item.stock}
                    onClick={() =>
                      updateQty(
                        item._id,
                        Math.min(item.stock, item.quantity + 1)
                      )
                    }
                  >
                    +
                  </Btn>
                </div>
              </div>

              <div className="w-full xs:w-auto text-right mt-3 xs:mt-0">
                <p className="font-semibold text-secondary/85">
                  {item.salePrice ? (
                    <>
                      <span className="line-through text-secondary/85 text-sm sm:text-base md:text-md lg:text-lg">
                        ৳{item.price * item.quantity}
                      </span>{" "}
                      <span className="text-danger text-xs sm:text-base md:text-md">
                        ৳{item.salePrice * item.quantity}
                      </span>{" "}
                      <span className="bg-danger text-primarybg text-xs px-1 md:px-2 py-0.5 md:py-1 rounded whitespace-nowrap">
                        Save{" "}
                        {Math.round(
                          ((item.price - item.salePrice) / item.price) * 100
                        )}
                        %
                      </span>
                    </>
                  ) : (
                    <>৳ {item.price * item.quantity}</>
                  )}
                </p>
                <Btn
                  variant="outline"
                  onClick={() => removeItem(item._id)}
                  disabled={!!orderId}
                  className={`hover:underline text-sm mt-1 px-2.5 py-1.5 ${
                    orderId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Remove
                </Btn>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Shipping / Order Summary */}
      <div className="border p-5 rounded-lg space-y-4">
        {!orderId && !isExistingOrderPayment ? (
          // New order form
          <>
            <h2 className="text-lg font-semibold">Shipping Information</h2>
            {["fullName", "phone", "address", "city", "postalCode"].map(
              (field) => (
                <input
                  key={field}
                  className="border px-3 py-1.5 rounded-lg outline-none transition w-full"
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  value={form[field]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                />
              )
            )}

            <h2 className="pt-4 font-semibold">Payment Method</h2>
            <div className="space-y-2">
              {["ssl", "cod", "manual"].map((method) => (
                <label key={method} className="flex gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  {method === "ssl"
                    ? "Online Payment (SSLCommerz)"
                    : method === "cod"
                    ? "Cash on Delivery"
                    : "Manual Payment"}
                </label>
              ))}
            </div>

            <Btn
              variant="primary"
              onClick={createOrder}
              disabled={cart.length === 0}
              className="w-full bg-classic text-primarybg py-3 rounded-lg mt-4 disabled:secondary/50"
            >
              Create Order
            </Btn>
          </>
        ) : (
          // Order summary for both new and existing orders
          <>
            <h2 className="text-lg font-semibold">
              {isExistingOrderPayment ? "Order Summary" : "Order Created"}
            </h2>
            <div className="space-y-2">
              {(isExistingOrderPayment ? existingOrder.items : cart).map(
                (item) => (
                  <p key={item._id || item.product._id}>
                    {item.name} ×{" "}
                    {isExistingOrderPayment ? item.qty : item.quantity} ={" "}
                    {item.salePrice
                      ? `৳${
                          item.salePrice *
                          (isExistingOrderPayment ? item.qty : item.quantity)
                        }`
                      : `৳${
                          item.price *
                          (isExistingOrderPayment ? item.qty : item.quantity)
                        }`}
                  </p>
                )
              )}
              <p>Subtotal: ৳ {subtotal}</p>
              <p>Shipping: ৳ {shipping}</p>
              <p className="font-bold">Total: ৳ {total}</p>
              <p>
                Shipping Address:{" "}
                {`${form.fullName}, ${form.address}, ${form.city}, ${form.postalCode}, ${form.country}`}
              </p>
              {isExistingOrderPayment && (
                <p className="text-sm text-warning">
                  You are completing payment for an existing order.
                </p>
              )}
            </div>

            <Btn
              variant="success"
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg mt-4"
            >
              {isExistingOrderPayment ? "Complete Payment" : "Checkout"}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckOut;
