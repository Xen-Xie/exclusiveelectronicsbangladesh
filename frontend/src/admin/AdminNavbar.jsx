/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Btn from "../components/Common/Btn";

const adminLinks = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Products", path: "/admin/products" },
  { name: "Add Product", path: "/admin/add-product" },
  { name: "Orders", path: "/admin/orders" },
  { name: "Users", path: "/admin/users" },
];

function AdminNavbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-secondary text-primarybg shadow-md relative z-50 font-urbanist">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">Admin Panel</div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-4 items-center">
          {adminLinks.map((link) => (
            <li
              key={link.path}
              className="relative after:block after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 hover:after:w-full hover:text-primarybg/65 transition-all duration-300 text-base md:text-lg lg:text-xl"
            >
              <NavLink to={link.path}>{link.name}</NavLink>
            </li>
          ))}
          <li>
            <Btn
              variant="danger"
              onClick={handleLogout}
              className="px-3 py-2 rounded"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </Btn>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={() => setOpenMenu((prev) => !prev)}>
            <i className="fa-solid fa-bars text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {openMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpenMenu(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sliding Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[75%] sm:w-[60%] bg-gray-800 shadow-xl z-50 p-6 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setOpenMenu(false)}
                className="self-end text-2xl mb-6"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <ul className="flex flex-col gap-4">
                {adminLinks.map((link) => (
                  <li key={link.path}>
                    <NavLink
                      to={link.path}
                      onClick={() => setOpenMenu(false)}
                      
                    >
                      {link.name}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <Btn
                    variant="danger"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-sm"
                  >
                    Logout <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </Btn>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default AdminNavbar;
