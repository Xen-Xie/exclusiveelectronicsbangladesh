/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/useCart";
import { useLocation, useNavigate } from "react-router";
import Btn from "../components/Common/Btn";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import LocationSelector from "../components/Common/LocationSelector";

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
    division: "",
    district: "",
    upazila: "",
    postalCode: "",
    country: "Bangladesh",
  });
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    phone: "",
    address: "",
    division: "",
    district: "",
    upazila: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("ssl");

  // Location states
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");

  // Shipping calculation state
  const [calculatedShipping, setCalculatedShipping] = useState(0);
  const [shippingBreakdown, setShippingBreakdown] = useState([]);
  const [isInsideDhaka, setIsInsideDhaka] = useState(false);

  // Calculate subtotal
  const subtotal = isExistingOrderPayment
    ? existingOrder.subtotal
    : cart.reduce(
        (sum, item) =>
          sum + (item.salePrice ? item.salePrice : item.price) * item.quantity,
        0,
      );

  // Calculate shipping based on products and selected division
  const calculateShipping = useCallback(() => {
    if (isExistingOrderPayment) {
      setCalculatedShipping(existingOrder.shippingFee || 0);
      return;
    }

    if (!cart.length || !selectedDivision) {
      setCalculatedShipping(0);
      setShippingBreakdown([]);
      return;
    }

    // Check if selected division is Dhaka
    const isDhaka = selectedDivision === "dhaka";
    setIsInsideDhaka(isDhaka);

    let totalShipping = 0;
    const breakdown = [];

    cart.forEach((item) => {
      let itemShipping = 0;
      const quantity = item.quantity;

      // Check if product has free shipping from quickInfo
      if (item.quickInfo?.freeShipping === true) {
        itemShipping = 0;
      }
      // Check if product has custom shipping fees
      else if (
        isDhaka &&
        item.shippingInsideDhaka !== undefined &&
        item.shippingInsideDhaka !== null
      ) {
        itemShipping = item.shippingInsideDhaka * quantity;
      } else if (
        !isDhaka &&
        item.shippingOutsideDhaka !== undefined &&
        item.shippingOutsideDhaka !== null
      ) {
        itemShipping = item.shippingOutsideDhaka * quantity;
      }
      // Default fallback shipping
      else {
        itemShipping = isDhaka ? 0 : 60 * quantity;
      }

      totalShipping += itemShipping;

      breakdown.push({
        name: item.name,
        quantity: quantity,
        shippingPerUnit: isDhaka
          ? item.shippingInsideDhaka || 0
          : item.shippingOutsideDhaka || 60,
        totalShipping: itemShipping,
        freeShipping: item.quickInfo?.freeShipping === true,
      });
    });

    setCalculatedShipping(totalShipping);
    setShippingBreakdown(breakdown);
  }, [cart, selectedDivision, isExistingOrderPayment, existingOrder]);

  // Recalculate shipping when division or cart changes
  useEffect(() => {
    calculateShipping();
  }, [selectedDivision, cart, calculateShipping]);

  const total = isExistingOrderPayment
    ? existingOrder.total
    : subtotal + calculatedShipping;

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^(?:\+88|01)?\d{11}$/.test(form.phone)) {
      errors.phone =
        "Please enter a valid Bangladesh phone number (e.g., 017xxxxxxxx)";
    }

    if (!form.address.trim()) {
      errors.address = "Address is required";
    }

    if (!form.division) {
      errors.division = "Division is required";
    }

    if (!form.district) {
      errors.district = "District is required";
    }

    if (!form.upazila) {
      errors.upazila = "Upazila/Thana is required";
    }

    if (!form.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    } else if (!/^\d{4}$/.test(form.postalCode)) {
      errors.postalCode = "Please enter a valid 4-digit postal code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update form when location selectors change
  const clearLocationErrors = useCallback(() => {
    if (selectedDivision && formErrors.division) {
      setFormErrors((prev) => ({ ...prev, division: "" }));
    }
    if (selectedDistrict && formErrors.district) {
      setFormErrors((prev) => ({ ...prev, district: "" }));
    }
    if (selectedUpazila && formErrors.upazila) {
      setFormErrors((prev) => ({ ...prev, upazila: "" }));
    }
  }, [
    selectedDivision,
    selectedDistrict,
    selectedUpazila,
    formErrors.division,
    formErrors.district,
    formErrors.upazila,
  ]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
    }));
    clearLocationErrors();
  }, [
    selectedDivision,
    selectedDistrict,
    selectedUpazila,
    clearLocationErrors,
  ]);

  // Load user profile and existing order data
  useEffect(() => {
    const loadData = async () => {
      if (isExistingOrderPayment && existingOrder) {
        const address = existingOrder.shippingAddress || {};
        setForm({
          fullName: address.fullName || "",
          phone: address.phone || "",
          address: address.address || "",
          division: address.division || "",
          district: address.district || "",
          upazila: address.upazila || "",
          postalCode: address.postalCode || "",
          country: address.country || "Bangladesh",
        });
        setSelectedDivision(address.division || "");
        setSelectedDistrict(address.district || "");
        setSelectedUpazila(address.upazila || "");
        setPaymentMethod(existingOrder.payment?.method || "ssl");
        setLoading(false);
      } else if (!token) {
        setLoading(false);
        return;
      } else {
        try {
          // Fetch user profile from backend
          const res = await axios.get(`${apiUrl}/api/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const u = res.data.data || res.data;

          // Auto-fill form with user data from backend
          setForm({
            fullName: u.name || u.fullName || "",
            phone: u.phoneNumber || "",
            address: u.address || "",
            division: u.division || "",
            district: u.district || "",
            upazila: u.upazila || "",
            postalCode: u.postalCode || "",
            country: "Bangladesh",
          });
          setSelectedDivision(u.division || "");
          setSelectedDistrict(u.district || "");
          setSelectedUpazila(u.upazila || "");
        } catch (e) {
          console.error("Failed to fetch user:", e);
          toast.error("Could not load user data. Please fill manually.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user, token, apiUrl, isExistingOrderPayment, existingOrder]);

  const createOrder = async () => {
    if (!token) {
      toast.error("You must login first to create an order!");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    // Validate form before creating order
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly!");
      return;
    }

    try {
      // Update user profile with latest info including location
      await axios.put(
        `${apiUrl}/api/user/update`,
        {
          phoneNumber: form.phone,
          address: form.address,
          postalCode: form.postalCode,
          division: form.division,
          district: form.district,
          upazila: form.upazila,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const orderRes = await axios.post(
        `${apiUrl}/api/order`,
        {
          items: cart.map((i) => ({
            product: i._id,
            name: i.name,
            price: i.salePrice || i.price,
            qty: i.quantity,
            image: i.image,
          })),
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            postalCode: form.postalCode,
            country: form.country,
          },
          subtotal,
          shippingFee: calculatedShipping,
          total,
          payment: {
            method: paymentMethod,
            status: "pending",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newOrderId = orderRes.data.data._id;
      setOrderId(newOrderId);

      if (paymentMethod === "cod") {
        clearCart();
        toast.success("Order created successfully! You will pay on delivery.");
        navigate(`/payment-success?order=${newOrderId}`);
      }
    } catch (e) {
      console.error("Create order failed:", e);
      if (e.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login", { state: { from: "/checkout" } });
      } else {
        toast.error(e.response?.data?.message || "Failed to create order!");
      }
    }
  };

  const handleCheckout = async () => {
    if (!orderId) {
      toast.error("No order found!");
      return;
    }

    try {
      if (paymentMethod === "ssl") {
        const payRes = await axios.post(
          `${apiUrl}/api/payment/init/${orderId}`,
        );
        sessionStorage.setItem("pendingOrderId", orderId);
        window.location.href = payRes.data.url;
        return;
      } else if (paymentMethod === "manual") {
        navigate(`/payment-success?order=${orderId}`);
      }
    } catch (e) {
      console.error("Checkout failed:", e);
      toast.error("Checkout failed!");
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Checkout
        </h1>
        <p className="text-gray-500 mt-1">Complete your order securely</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Order Items */}
        <div className="lg:flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {isExistingOrderPayment ? "Order Items" : "Your Cart"}
                  <span className="text-sm text-gray-500 ml-2">
                    (
                    {isExistingOrderPayment
                      ? existingOrder.items.length
                      : cart.length}{" "}
                    items)
                  </span>
                </h2>
                {!isExistingOrderPayment && cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    disabled={!!orderId}
                    className="text-danger hover:text-danger/80 text-sm font-medium transition-colors"
                  >
                    <i className="fa-regular fa-trash-alt mr-1"></i> Clear Cart
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {isExistingOrderPayment ? (
                existingOrder.items.map((item, idx) => (
                  <motion.div
                    key={item._id || item.product._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 sm:p-5 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={
                          item.product?.images?.[0]?.url ||
                          item.image?.url ||
                          "/placeholder.jpg"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          Qty: {item.qty}
                        </span>
                      </div>
                      <p className="text-danger font-semibold mt-2">
                        ৳{(item.salePrice || item.price) * item.qty}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : cart.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fa-regular fa-cart-shopping text-5xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">Your cart is empty</p>
                  <Btn
                    onClick={() => navigate("/")}
                    variant="primary"
                    className="mt-4"
                  >
                    Continue Shopping
                  </Btn>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 sm:p-5 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={
                          item.image?.url ||
                          item.images?.[0]?.url ||
                          "/placeholder.jpg"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQty(item._id, Math.max(1, item.quantity - 1))
                          }
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(
                              item._id,
                              Math.min(item.stock, item.quantity + 1),
                            )
                          }
                          disabled={item.quantity >= item.stock}
                          className={`w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${
                            item.quantity >= item.stock
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-semibold text-gray-800">
                          {item.salePrice ? (
                            <>
                              <span className="text-gray-400 line-through text-xs mr-1">
                                ৳{item.price}
                              </span>
                              ৳{item.salePrice}
                            </>
                          ) : (
                            <>৳{item.price}</>
                          )}
                        </p>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-danger hover:text-danger/80 text-xs"
                        >
                          <i className="fa-regular fa-trash-alt mr-1"></i>{" "}
                          Remove
                        </button>
                      </div>
                      {/* Show shipping info per product */}
                      {!isExistingOrderPayment && selectedDivision && (
                        <div className="mt-2 text-xs text-gray-500">
                          <i className="fa-solid fa-truck mr-1"></i>
                          Shipping: ৳
                          {selectedDivision === "dhaka"
                            ? (item.shippingInsideDhaka || 0) * item.quantity
                            : (item.shippingOutsideDhaka || 60) * item.quantity}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Order Summary & Shipping */}
        <div className="lg:w-96">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>

              {/* Shipping Section */}
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-semibold text-gray-800">
                    {calculatedShipping > 0
                      ? `৳${calculatedShipping.toLocaleString()}`
                      : "Free"}
                  </span>
                </div>

                {/* Shipping Breakdown */}
                {!isExistingOrderPayment &&
                  selectedDivision &&
                  shippingBreakdown.length > 0 &&
                  calculatedShipping > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Shipping Breakdown:
                      </p>
                      <div className="space-y-1">
                        {shippingBreakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-600">
                              {item.name} (x{item.quantity})
                              {item.freeShipping && (
                                <span className="text-green-600 ml-1">
                                  (Free)
                                </span>
                              )}
                            </span>
                            <span className="font-medium text-gray-800">
                              {item.freeShipping
                                ? "Free"
                                : `৳${item.totalShipping}`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-xs font-medium">
                        <span>Total Shipping</span>
                        <span className="text-primary">
                          ৳{calculatedShipping}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Shipping location info */}
                {selectedDivision && (
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fa-solid fa-location-dot mr-1"></i>
                    Shipping to:{" "}
                    {selectedDivision === "dhaka"
                      ? "Inside Dhaka"
                      : "Outside Dhaka"}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Total</span>
                  <span className="text-xl text-primary">
                    ৳{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {!orderId && !isExistingOrderPayment ? (
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">
                  Shipping Information
                </h3>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={form.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.fullName
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                      required
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={form.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.phone ? "border-red-500" : "border-gray-200"
                      }`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Location Selector */}
                  <LocationSelector
                    selectedDivision={selectedDivision}
                    selectedDistrict={selectedDistrict}
                    selectedUpazila={selectedUpazila}
                    onDivisionChange={setSelectedDivision}
                    onDistrictChange={setSelectedDistrict}
                    onUpazilaChange={setSelectedUpazila}
                  />

                  {/* Display location errors */}
                  {formErrors.division && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.division}
                    </p>
                  )}
                  {formErrors.district && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.district}
                    </p>
                  )}
                  {formErrors.upazila && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.upazila}
                    </p>
                  )}

                  {/* Postal Code */}
                  <div>
                    <input
                      type="text"
                      placeholder="Postal Code *"
                      value={form.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.postalCode
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {formErrors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.postalCode}
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div>
                    <input
                      type="text"
                      placeholder="Street Address / House No *"
                      value={form.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        formErrors.address
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                      required
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Methods */}
                <h3 className="font-medium text-gray-800 mt-6 mb-3">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "ssl"}
                      onChange={() => setPaymentMethod("ssl")}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-credit-card text-primary"></i>
                        <span className="font-medium">Online Payment</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        SSLCommerz - Credit card, Mobile banking, Internet
                        banking
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-truck text-primary"></i>
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay when you receive the order
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "manual"}
                      onChange={() => setPaymentMethod("manual")}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-building-columns text-primary"></i>
                        <span className="font-medium">Manual Payment</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Bank transfer or other methods
                      </p>
                    </div>
                  </label>
                </div>

                <Btn
                  variant="primary"
                  onClick={createOrder}
                  disabled={cart.length === 0}
                  className="w-full mt-6"
                >
                  Create Order
                </Btn>
              </div>
            ) : (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Shipping to:</p>
                  <p className="font-medium text-gray-800">{form.fullName}</p>
                  <p className="text-sm text-gray-600">{form.address}</p>
                  <p className="text-sm text-gray-600">
                    {form.division && `${form.division}, `}
                    {form.district && `${form.district}, `}
                    {form.upazila && form.upazila}
                  </p>
                  <p className="text-sm text-gray-600">{form.postalCode}</p>
                  <p className="text-sm text-gray-600">📞 {form.phone}</p>
                </div>

                {isExistingOrderPayment && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <i className="fa-solid fa-circle-info mr-1"></i>
                      You are completing payment for an existing order.
                    </p>
                  </div>
                )}

                <Btn
                  variant="success"
                  onClick={handleCheckout}
                  className="w-full"
                >
                  {isExistingOrderPayment
                    ? "Complete Payment"
                    : "Proceed to Checkout"}
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
