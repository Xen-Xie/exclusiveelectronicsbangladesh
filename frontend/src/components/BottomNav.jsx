/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";

// Nav Items
const navItems = [
  {
    id: "shop",
    label: "Shop",
    icon: "fa-solid fa-store",
    path: "/",
    exact: true,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: "fa-solid fa-heart",
    path: "/profile/wishlist",
    exact: false,
  },
  {
    id: "orders",
    label: "Orders",
    icon: "fa-solid fa-box",
    path: "/profile/orders",
    exact: false,
  },
  {
    id: "profile",
    label: "Profile",
    icon: "fa-solid fa-user",
    path: "/profile",
    exact: false,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // Derived active tab (NO state, NO effect)
  const activeTab =
    navItems.find((item) =>
      item.exact
        ? currentPath === item.path
        : currentPath.startsWith(item.path),
    )?.id || "shop";

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  return (
    <>
      {/* Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-classic text-primarybg shadow-2xl z-50 border-t border-white/10 backdrop-blur-lg">
        <div className="relative flex items-center justify-around px-2 py-1">

          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavigation(item)}
                className="relative z-10 flex flex-col items-center justify-center py-2 px-3 rounded-xl flex-1"
              >
                {/* Icon */}
                <motion.i
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className={`${item.icon} text-xl ${
                    isActive ? "text-primarybg" : "text-primarybg/50"
                  }`}
                />

                {/* Label */}
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    y: isActive ? 0 : 2,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`text-[10px] mt-1 ${
                    isActive ? "text-primarybg" : "text-primarybg/50"
                  }`}
                >
                  {item.label}
                </motion.span>

                {/*  Top micro indicator  */}
                {isActive && (
                  <motion.div
                    layoutId="top-indicator"
                    className="absolute -top-1 w-5 h-0.5 bg-primarybg rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Safe area */}
        <div className="h-safe-bottom bg-classic"></div>
      </div>
    </>
  );
}
