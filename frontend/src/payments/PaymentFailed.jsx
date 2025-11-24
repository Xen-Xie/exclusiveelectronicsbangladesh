/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";
export const PaymentFailed = () => {
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("order");
const error = urlParams.get("error");
const [time, setTime] = useState(6);


useEffect(() => {
const timer = setInterval(() => {
setTime((t) => (t > 0 ? t - 1 : 0));
}, 1000);


if (time === 0) window.location.href = "/checkout";


return () => clearInterval(timer);
}, [time]);


return (
<div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
<XCircle className="w-20 h-20 text-red-600 mb-4" />
</motion.div>


<h1 className="text-3xl font-semibold text-red-600 mb-4">Payment Failed</h1>
<p className="text-lg mb-2">Your payment could not be processed.</p>


{error && (
<p className="text-sm text-gray-600 mb-2">Reason: {error}</p>
)}


{orderId && (
<p className="text-sm text-gray-600 mb-4">Order ID: {orderId}</p>
)}


<p className="text-sm text-gray-600 mb-6">Redirecting in {time} seconds...</p>


<a
href="/checkout"
className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
>
Try Again
</a>
</div>
);
};