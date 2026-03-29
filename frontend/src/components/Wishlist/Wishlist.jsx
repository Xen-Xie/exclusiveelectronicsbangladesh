/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import Btn from "../Common/Btn";

export default function Wishlist() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Wrap fetchWishlist in useCallback to prevent infinite re-renders
  const fetchWishlist = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(response.data.data.wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl]);

  // Check if user is logged in on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [token, navigate, fetchWishlist]);

  const removeFromWishlist = async (productId) => {
    setRemovingId(productId);
    try {
      await axios.delete(`${apiUrl}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(wishlist.filter((item) => item.product._id !== productId));
      toast.success("Removed from wishlist", {
        icon: "💔",
        duration: 2000,
        style: {
          background: "#6B7280",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingId(null);
    }
  };


  const navigateToProduct = (product) => {
    const slug =
      product.slug || product.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/products/${product._id}/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8">
        <div className="text-center py-12">
          <i className="fa-regular fa-heart text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-6">Save your favorite items here!</p>
          <Btn onClick={() => navigate("/")} variant="primary">
            Start Shopping
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">My Wishlist</h1>
          <p className="text-secondary/55 mt-1">{wishlist.length} items</p>
        </div>
        
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <AnimatePresence>
          {wishlist.map((item) => {
            const product = item.product;
            const isRemoving = removingId === product._id;
            const averageRating = product?.ratingSummary?.averageRating || 0;
            const totalReviews = product?.ratingSummary?.totalReviews || 0;
            const soldCount = product?.sold || 0;

            return (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden w-full relative group"
                onClick={() => navigateToProduct(product)}
              >
                {/* Product image container */}
                <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.target.src = "/placeholder.jpg")}
                  />
                  {product.onSale && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                      SALE
                    </span>
                  )}

                  {/* Remove from Wishlist Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.15 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product._id);
                    }}
                    disabled={isRemoving}
                    className="absolute top-2 right-2 rounded-full p-1 transition-all z-20 bg-transparent cursor-pointer"
                  >
                    {isRemoving ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <motion.i
                        initial={false}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                        className="fa-solid fa-heart text-red-500 drop-shadow-lg text-lg sm:text-xl"
                        style={{
                          filter: "drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))",
                        }}
                      ></motion.i>
                    )}
                  </motion.button>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 pointer-events-none"></div>
                </div>

                {/* Product details */}
                <div className="p-2 sm:p-3">
                  <h2 className="text-xs sm:text-sm font-semibold text-secondary line-clamp-2 group-hover:text-primary transition-colors min-h-10 sm:min-h-12">
                    {product.name}
                  </h2>
                  {/* Price and sold count */}
                  <div className="mt-1 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.onSale && product.salePrice ? (
                        <>
                          <span className="text-red-600 font-bold text-sm">
                            ৳{product.salePrice.toLocaleString()}
                          </span>
                          <span className="text-gray-400 text-xs line-through">
                            ৳{product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-800 font-semibold text-sm">
                          ৳{product.price?.toLocaleString() || "Price not set"}
                        </span>
                      )}
                    </div>

                    {/* Sold count */}
                    {soldCount > 0 && (
                      <span className="text-xs text-gray-500 font-medium shrink-0">
                        🔥 {soldCount}
                      </span>
                    )}
                  </div>

                  <Btn
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProduct(product);
                    }}
                    className="mt-3 w-full text-xs py-2 px-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    View Details
                  </Btn>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
