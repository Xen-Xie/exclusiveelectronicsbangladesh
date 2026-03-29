/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const phoneNumber = "+8801929986172";
  const message = "Hello! I want to know more about your products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;

  // Hide button when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Show tooltip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="
              fixed 
              bottom-[90px] 
              right-5
              group
              z-50
            "
          >
            {/* Ripple Effect Background */}
            <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-75"></div>

            {/* Main Button */}
            <motion.div
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 360 : 0,
              }}
              transition={{
                scale: { type: "spring", stiffness: 400, damping: 10 },
                rotate: { duration: 0.5, ease: "easeInOut" },
              }}
              className="
                relative
                w-14 
                h-14 
                bg-linear-to-br from-green-500 to-green-600
                text-primarybg 
                rounded-full 
                flex 
                justify-center 
                items-center 
                shadow-2xl 
                cursor-pointer
                hover:shadow-green-500/50
                transition-shadow
                duration-300
              "
            >
              {/* WhatsApp Icon */}
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.86L2.4 20.44c-.22.55.27 1.07.82.86l2.57-.99c1.64 1.15 3.6 1.86 5.72 1.86 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 2c4.42 0 8 3.58 8 8s-3.58 8-8 8c-1.51 0-2.93-.42-4.15-1.15l-.3-.17-2.51.96.96-2.51-.17-.3C7.42 14.93 7 13.51 7 12c0-4.42 3.58-8 8-8z"
                  clipRule="evenodd"
                />
                <path d="M11.5 8h1v3h-1zM14 9.5h-2v-1h2v1zM10 9.5h-2v-1h2v1z" />
                <path d="M16 12.5c0 .28-.22.5-.5.5h-5c-.28 0-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5h5c.28 0 .5.22.5.5v3z" />
              </motion.svg>

              {/* Notification Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  !
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {(showTooltip || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
                >
                  <div className="bg-gray-900 text-white text-xs font-medium py-2 px-3 rounded-lg shadow-lg">
                    Chat with us on WhatsApp!
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}
