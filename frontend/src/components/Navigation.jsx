/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

function Navigation() {
  const [oepnMenu, setOpenMenu] = useState(false);
  const [cartCount, setCartCount] = useState(2); // demo value (change when hooking backend)

  return (
    <nav className="w-full border-b border-bordered bg-primarybg px-4 sm:px-6 py-3 font-inter">
      <div className="flex justify-between items-center gap-3 max-w-[1400px] mx-auto">
        {/* Logo Section */}
        <Link to="/">
          <img
            src="/exlogo.jpg"
            alt=""
            className="w-13 md:w-18 lg:w-22 rounded-full"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:block">
          <ul className="flex gap-6 items-center">
            {navItems.map((i, index) => (
              <li
                key={index}
                className="relative after:block after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 hover:after:w-full hover:text-primary transition-all duration-300 text-base md:text-lg lg:text-xl"
              >
                <Link to={i.path}>{i.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop Cart & Button */}
        <div className="hidden md:flex gap-4 items-center relative">
          <div className="relative">
            <Link to="/checkout">
              <i className="fa-solid fa-cart-arrow-down text-2xl hover:text-secondary/85 transition-all duration-300"></i>

              {/* Cart Badge */}
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    key={cartCount}
                    className="absolute -top-2 -right-2 bg-danger text-primarybg text-xs px-1.5 py-0.5 rounded-full"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          <Link to="/sign-up" className="text-lg lg:text-xl">
            Sign Up
          </Link>
        </div>

        {/* Mobile Cart & Hamburger */}
        <div className="flex md:hidden gap-4 items-center relative">
          {/* Mobile Cart */}
          <div className="relative">
            <i className="fa-solid fa-cart-arrow-down text-2xl"></i>

            {/* Cart Badge */}
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  key={cartCount}
                  className="absolute -top-2 -right-2 bg-danger text-white text-xs px-1.5 py-0.5 rounded-full"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger Icon */}
          <button onClick={() => setOpenMenu((prev) => !prev)}>
            <i className="fa-solid fa-bars text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {oepnMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpenMenu(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-lg z-40"
            />

            {/* Sliding Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden fixed top-0 right-0 h-full w-[75%] xs:w-[70%] sm:w-[50%] bg-primarybg shadow-xl border-l border-bordered p-6 z-50 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setOpenMenu(false)}
                className="text-2xl mb-6 self-end"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <ul className="space-y-4 font-inter text-lg">
                {navItems.map((i, index) => (
                  <li
                    key={index}
                    className="border-b border-bordered pb-2 last:border-0"
                  >
                    <Link to={i.path} onClick={() => setOpenMenu(false)}>
                      {i.name}
                    </Link>
                  </li>
                ))}

                <li className="pt-2">
                  <Link to="/sign-up" onClick={() => setOpenMenu(false)}>
                    Sign Up
                  </Link>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navigation;
