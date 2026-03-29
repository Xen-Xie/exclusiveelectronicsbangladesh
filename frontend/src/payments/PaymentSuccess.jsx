/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Slash } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/useCart";

export const PaymentSuccess = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order");
  const [time, setTime] = useState(5);

  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    if (time === 0) window.location.href = "/";

    return () => clearInterval(timer);
  }, [time]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle className="w-20 h-20 text-green-600 mb-4" />
      </motion.div>

      <h1 className="text-3xl font-semibold text-green-600 mb-4">
        Payment Successful
      </h1>
      <p className="text-lg mb-2">
        Your payment has been completed successfully.
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Redirecting in {time} seconds...
      </p>

      {orderId && (
        <p className="text-sm text-gray-600 mb-6">Order ID: {orderId}</p>
      )}

      <a
        href="/"
        className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
      >
        Go to Home
      </a>
    </div>
  );
};