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
    setOpenMenu(false);
  };

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 font-urbanist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Section */}
          <Link to="/" className="shrink-0">
            <img
              src="/DropOre.svg"
              alt="Dropore"
              className="h-25 sm:h-30 md:h-35 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {/* Cart Icon */}
            <Link to="/checkout" className="relative">
              <i className="fa-solid fa-cart-shopping text-xl text-gray-700 hover:text-primary transition-colors"></i>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Section */}
            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative group cursor-pointer">
                <button className="flex items-center gap-2 focus:outline-none">
                  <div className="w-8 h-8 bg-linear-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <i className="fa-solid fa-chevron-down text-xs text-gray-500 group-hover:rotate-180 transition-transform"></i>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 cursor-pointer">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
                  >
                    <i className="fa-solid fa-user text-gray-400"></i>
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/profile/orders"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-box text-gray-400"></i>
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/profile/wishlist"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-heart text-gray-400"></i>
                    <span>Wishlist</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full rounded-b-lg border-t border-gray-100"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            {/* Mobile Cart */}
            <Link to="/checkout" className="relative">
              <i className="fa-solid fa-cart-shopping text-xl text-gray-700"></i>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={() => setOpenMenu(true)}
              className="text-gray-700 hover:text-primary"
            >
              <i className="fa-solid fa-bars text-2xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {openMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMenu(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Sliding Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header with Logo and Close Button */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => setOpenMenu(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                </div>

                {/* User Info (if logged in) */}
                {user && (
                  <div className="p-4 bg-linear-to-r from-primary/5 to-primary/10 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}

                  {/* Profile Links for Logged In Users */}
                  {user && (
                    <>
                      <div className="h-px bg-gray-100 my-2 mx-5"></div>
                      <Link
                        to="/profile"
                        onClick={() => setOpenMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <i className="fa-solid fa-user w-5 text-gray-400"></i>
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/profile/orders"
                        onClick={() => setOpenMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <i className="fa-solid fa-box w-5 text-gray-400"></i>
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/profile/wishlist"
                        onClick={() => setOpenMenu(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <i className="fa-solid fa-heart w-5 text-gray-400"></i>
                        <span>Wishlist</span>
                      </Link>
                    </>
                  )}

                  {/* Logout Button - Now inside the scrollable area */}
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-5 py-3 text-red-600 hover:bg-red-50 transition-colors mt-2"
                    >
                      <i className="fa-solid fa-right-from-bracket w-5"></i>
                      <span>Logout</span>
                    </button>
                  )}
                  {!user && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      <Link
                        to="/login"
                        onClick={() => setOpenMenu(false)}
                        className="block w-full text-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/sign-up"
                        onClick={() => setOpenMenu(false)}
                        className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navigation;
