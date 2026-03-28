/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import Btn from "../Common/Btn";

export default function Wishlist() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [token]);

  const fetchWishlist = async () => {
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
  };

  const removeFromWishlist = async (productId) => {
    setRemovingId(productId);
    try {
      await axios.delete(`${apiUrl}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(wishlist.filter(item => item.product._id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingId(null);
    }
  };

  const clearWishlist = async () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      try {
        await axios.delete(`${apiUrl}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist([]);
        toast.success("Wishlist cleared");
      } catch (error) {
        console.error("Error clearing wishlist:", error);
        toast.error("Failed to clear wishlist");
      }
    }
  };

  const navigateToProduct = (product) => {
    const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, "-");
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <i className="fa-regular fa-heart text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save your favorite items here!</p>
          <Btn onClick={() => navigate("/")} variant="primary">
            Start Shopping
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
          <p className="text-gray-500 mt-1">{wishlist.length} items</p>
        </div>
        <Btn onClick={clearWishlist} variant="outline" className="text-danger border-danger hover:bg-danger/10">
          <i className="fa-regular fa-trash-alt mr-2"></i>
          Clear All
        </Btn>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {wishlist.map((item) => {
            const product = item.product;
            const isRemoving = removingId === product._id;
            
            return (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
              >
                <div className="relative cursor-pointer" onClick={() => navigateToProduct(product)}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {product.onSale && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product._id);
                    }}
                    disabled={isRemoving}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors"
                  >
                    {isRemoving ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="fa-solid fa-heart text-red-500 text-sm"></i>
                    )}
                  </button>
                </div>

                <div className="p-3" onClick={() => navigateToProduct(product)}>
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <div className="mt-2 flex items-center gap-2">
                    {product.onSale && product.salePrice ? (
                      <>
                        <span className="text-red-600 font-bold text-sm">
                          ৳{product.salePrice}
                        </span>
                        <span className="text-gray-400 text-xs line-through">
                          ৳{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-800 font-bold text-sm">
                        ৳{product.price}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProduct(product);
                    }}
                    className="mt-3 w-full bg-gray-100 hover:bg-primary hover:text-white text-gray-700 text-xs py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}