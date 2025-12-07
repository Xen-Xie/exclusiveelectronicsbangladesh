/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../auth/AuthContext";
import { useCart } from "../context/useCart";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

function Navigation() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const { cartCount } = useCart();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="w-full border-b border-bordered bg-primarybg px-4 sm:px-6 font-inter py-3 md:py-4">
      <div className="flex justify-between items-center gap-3 max-w-[1400px] mx-auto h-16">
        {/* Logo Section */}
        <Link to="/">
          <img
            src="/mainLogo.png"
            alt="Logo"
            className="h-30 xs:h-35 md:h-40 lg:h-45 object-contain"
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

        {/* Desktop Cart & Button / Profile */}
        <div className="hidden md:flex gap-4 items-center relative">
          {/* Cart */}
          <div className="relative">
            <Link to="/checkout">
              <i className="fa-solid fa-cart-arrow-down text-2xl hover:text-secondary/85 transition-all duration-300"></i>
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

          {/* Sign Up or Profile */}
          {!user ? (
            <Link to="/sign-up" className="text-lg lg:text-xl">
              Sign Up
            </Link>
          ) : (
            <Link to="/profile">
              <i className="fa-solid fa-user-circle text-3xl hover:text-secondary/85 transition-all duration-300 mb-2"></i>
            </Link>
          )}
        </div>

        {/* Mobile Cart & Hamburger */}
        <div className="flex md:hidden gap-4 items-center relative">
          {/* Mobile Cart */}
          <div className="relative">
            <Link to="/checkout">
              <i className="fa-solid fa-cart-arrow-down text-2xl"></i>
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
            </Link>
          </div>

          {/* Mobile User Icon only when logged out */}
          {!user && (
            <Link to="/sign-up">
              <i className="fa-solid fa-user text-2xl"></i>
            </Link>
          )}

          {/* Hamburger Icon */}
          <button onClick={() => setOpenMenu((prev) => !prev)}>
            <i className="fa-solid fa-bars text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {openMenu && (
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

                {/* Mobile Sign Up or Profile */}
                <li className="pt-2">
                  {!user ? (
                    <Link to="/sign-up" onClick={() => setOpenMenu(false)}>
                      Sign Up
                    </Link>
                  ) : (
                    <Link to="/profile" onClick={() => setOpenMenu(false)}>
                      <i className="fa-solid fa-user-circle text-2xl"></i>{" "}
                      Account
                    </Link>
                  )}
                </li>
              </ul>
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setOpenMenu(false);
                  }}
                  className="flex items-center gap-4 w-full rounded-lg text-left mt-auto pt-4"
                >
                  <div className="w-8 flex items-center justify-center">
                    <i className="fa-solid fa-right-from-bracket text-lg"></i>
                  </div>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navigation;
