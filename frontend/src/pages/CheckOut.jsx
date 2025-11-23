import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/useCart";
import Btn from "../components/Common/Btn";

function CheckOut() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { user, token } = useAuth();
  const { cart, removeItem, clearCart, updateQty } = useCart();

  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
  });
  const [paymentMethod, setPaymentMethod] = useState("ssl");

  // Subtotal uses salePrice if available
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + (item.salePrice ? item.salePrice : item.price) * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  // Load user profile
  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/user/${user._id}`, {
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
  }, [user, token, apiUrl]);

  // Create order
  const createOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    try {
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

      const orderRes = await axios.post(
        `${apiUrl}/api/order`,
        {
          items: cart.map((i) => ({
            product: i._id,
            name: i.name,
            price: i.price,
            salePrice: i.salePrice || null,
            qty: i.quantity,
            image: i.image,
          })),
          shippingAddress: form,
          subtotal,
          shippingFee: shipping,
          total,
          payment: { method: paymentMethod, status: "pending" },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrderId(orderRes.data.data._id);
    } catch (e) {
      console.error("Create order failed:", e);
      alert("Failed to create order!");
    }
  };

  // Checkout
  const handleCheckout = async () => {
    if (!orderId) return alert("No order created!");
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
      {/* Cart */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <Btn
            onClick={clearCart}
            disabled={!!orderId}
            className={`text-danger font-medium hover:underline px-1.5 py-1 ${
              orderId ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Clear Cart
          </Btn>
        </div>

        {cart.length === 0 ? (
          <p className="text-secondary/55 text-center">Your cart is empty.</p>
        ) : (
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
                    className="px-2 py-1 border rounded"
                    onClick={() => updateQty(item._id, item.quantity + 1)}
                  >
                    +
                  </Btn>
                </div>
              </div>

              <div className="w-full xs:w-auto text-right mt-3 xs:mt-0">
                <p className="font-semibold text-secondary/85">
                  {item.salePrice ? (
                    <>
                      <span className="line-through text-secondary/85">
                        ৳{item.price * item.quantity}
                      </span>{" "}
                      <span className="text-danger">
                        ৳{item.salePrice * item.quantity}
                      </span>{" "}
                      <span className="bg-danger text-primarybg text-xs px-2 py-1 rounded">
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

      {/* Shipping / Order */}
      <div className="border p-5 rounded-lg space-y-4">
        {!orderId ? (
          <>
            <h2 className="text-lg font-semibold">Shipping Information</h2>
            {["fullName", "phone", "address", "city", "postalCode"].map(
              (field) => (
                <input
                  key={field}
                  className="border px-3 py-1.5 rounded-lg outline-none transition"
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
              className="w-full bg-[#0A0A0A] text-primarybg py-3 rounded-lg mt-4 disabled:secondary/50"
            >
              Create Order
            </Btn>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="space-y-2">
              {cart.map((item) => (
                <p key={item._id}>
                  {item.name} × {item.quantity} ={" "}
                  {item.salePrice
                    ? `৳${item.salePrice * item.quantity}`
                    : `৳${item.price * item.quantity}`}
                </p>
              ))}
              <p>Subtotal: ৳ {subtotal}</p>
              <p>Shipping: ৳ {shipping}</p>
              <p className="font-bold">Total: ৳ {total}</p>
              <p>
                Shipping Address:{" "}
                {`${form.fullName}, ${form.address}, ${form.city}, ${form.postalCode}, ${form.country}`}
              </p>
            </div>

            <Btn
              variant="success"
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg mt-4"
            >
              Checkout
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckOut;
