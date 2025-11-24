/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Slash } from "lucide-react";
import { motion } from "framer-motion";
export const PaymentCancelled = () => {
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("order");
const [time, setTime] = useState(5);


useEffect(() => {
const timer = setInterval(() => {
setTime((t) => (t > 0 ? t - 1 : 0));
}, 1000);


if (time === 0) window.location.href = "/";


return () => clearInterval(timer);
}, [time]);


return (
<div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
<Slash className="w-20 h-20 text-yellow-600 mb-4" />
</motion.div>


<h1 className="text-3xl font-semibold text-yellow-600 mb-4">Payment Cancelled</h1>
<p className="text-lg mb-4">You cancelled your payment.</p>


{orderId && (
<p className="text-sm text-gray-600 mb-4">Order ID: {orderId}</p>
)}


<p className="text-sm text-gray-600 mb-6">Redirecting in {time} seconds...</p>


<a
href="/"
className="px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition"
>
Back to Home
</a>
</div>
);
};