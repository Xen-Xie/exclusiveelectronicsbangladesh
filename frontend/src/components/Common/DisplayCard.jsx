/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function DisplayCard({ product, loading = false }) {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [heartBeat, setHeartBeat] = useState(false);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (token && product?._id) {
      checkWishlistStatus();
    }
  }, [token, product?._id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/wishlist/check/${product._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsInWishlist(response.data.data.isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const showAnimatedPopup = (message, type) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const addToWishlist = async (e) => {
    e.stopPropagation();
    if (!token) {
      navigate("/login");
      showAnimatedPopup("Please login to add to wishlist", "error");
      toast.error("Please login to add to wishlist", {
        icon: "🔒",
        duration: 3000,
      });
      return;
    }

    setAddingToWishlist(true);
    try {
      await axios.post(
        `${apiUrl}/api/wishlist/add`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsInWishlist(true);
      setHeartBeat(true);
      setTimeout(() => setHeartBeat(false), 500);
      showAnimatedPopup("Added to wishlist! ❤️", "success");
      toast.success("Added to wishlist", {
        icon: "❤️",
        duration: 2000,
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });
    } catch (error) {
      if (error.response?.data?.message === "Product already in wishlist") {
        setIsInWishlist(true);
        setHeartBeat(true);
        setTimeout(() => setHeartBeat(false), 500);
        showAnimatedPopup("Already in wishlist! 📚", "info");
        toast("Already in wishlist", {
          icon: "📚",
          duration: 2000,
          style: {
            background: "#3B82F6",
            color: "#fff",
          },
        });
      } else {
        showAnimatedPopup("Failed to add to wishlist", "error");
        toast.error("Failed to add to wishlist", {
          icon: "❌",
          duration: 3000,
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  const removeFromWishlist = async (e) => {
    e.stopPropagation();
    setAddingToWishlist(true);
    try {
      await axios.delete(`${apiUrl}/api/wishlist/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsInWishlist(false);
      showAnimatedPopup("Removed from wishlist! 💔", "remove");
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
      showAnimatedPopup("Failed to remove from wishlist", "error");
      toast.error("Failed to remove from wishlist", {
        icon: "❌",
        duration: 3000,
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(e);
    } else {
      addToWishlist(e);
    }
  };

  // First, check if product exists to prevent errors
  if (!product && !loading) {
    console.error("DisplayCard: product prop is undefined or null");
    return (
      <div className="rounded-lg shadow-sm bg-container overflow-hidden w-full">
        <div className="relative w-full pt-[100%] bg-gray-200"></div>
        <div className="p-2 sm:p-3">
          <div className="h-4 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 w-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl =
    product?.images?.[0]?.url || product?.images?.[0] || "/placeholder.jpg";

  // Calculate average rating
  const averageRating =
    product?.ratingSummary?.averageRating || product?.averageRating || 0;

  const totalReviews =
    product?.ratingSummary?.totalReviews || product?.totalReviews || 0;
  const soldCount = product?.sold || 0;

  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i
          key={`full-${i}`}
          className="fa-solid fa-star text-warning text-xs"
        ></i>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <i
          key="half"
          className="fa-solid fa-star-half-alt text-warning text-xs"
        ></i>,
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i
          key={`empty-${i}`}
          className="fa-regular fa-star text-warning text-xs"
        ></i>,
      );
    }

    return stars;
  };

  const handleClick = () => {
    if (!loading && product?._id) {
      const slug =
        product.slug || product.name.replace(/\s+/g, "-").toLowerCase();
      navigate(`/products/${product._id}/${slug}`);
    }
  };

  // Show skeleton/loading state if loading prop is true
  if (loading) {
    return (
      <div className="rounded-lg shadow-sm bg-container overflow-hidden w-full">
        <div className="relative w-full pt-[100%] bg-gray-200 animate-pulse"></div>
        <div className="p-2 sm:p-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="flex items-center gap-1 mb-2">
            <div className="h-3 w-12 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div className="h-3 w-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // product card display
  return (
    <>
      <div
        onClick={handleClick}
        className="cursor-pointer rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-container overflow-hidden w-full relative group"
      >
        {/* Product image container with fixed aspect ratio */}
        <div className="relative w-full pt-[100%] bg-container overflow-hidden">
          <img
            src={imageUrl}
            alt={product?.name || "Product image"}
            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => (e.target.src = "/placeholder.jpg")}
          />
          {product?.onSale && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
              SALE
            </span>
          )}

          {/* Wishlist Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            onClick={handleWishlistClick}
            disabled={addingToWishlist}
            className="absolute top-2 right-2 rounded-full p-1 transition-all z-20 bg-transparent"
          >
            {addingToWishlist ? (
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <motion.div
                animate={heartBeat ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <motion.i
                  initial={false}
                  animate={
                    isInWishlist
                      ? {
                          scale: [1, 1.2, 1],
                        }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                  className={`${
                    isInWishlist
                      ? "fa-solid fa-heart text-red-500 drop-shadow-lg"
                      : "fa-regular fa-heart text-red-400 hover:text-red-500"
                  } text-lg sm:text-xl transition-all duration-300 ${
                    !isInWishlist && "hover:scale-110"
                  }`}
                  style={{
                    filter: isInWishlist
                      ? "drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))"
                      : "none",
                  }}
                ></motion.i>
              </motion.div>
            )}
          </motion.button>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 pointer-events-none"></div>
        </div>

        {/* Product details */}
        <div className="p-2 sm:p-3">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
            {product?.name || "Unnamed Product"}
          </h2>

          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {product?.category || "No category"}
          </p>

          {/* Review count */}
          <div className="flex items-center gap-1 mt-1.5 mb-1.5">
            <div className="flex items-center gap-0.5">{renderStars()}</div>
            {totalReviews > 0 && (
              <span className="text-xs text-gray-500">({totalReviews})</span>
            )}
          </div>

          {/* Price and sold count */}
          <div className="mt-1 flex justify-between items-center">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product?.onSale && product?.salePrice ? (
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
                  ৳{product?.price?.toLocaleString() || "Price not set"}
                </span>
              )}
            </div>

            {/* Sold count */}
            {soldCount > 0 && (
              <span className="text-xs text-gray-500 font-medium flex-shrink-0">
                🔥 {soldCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Animated Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm ${
                popupType === "success"
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : popupType === "error"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : popupType === "remove"
                  ? "bg-gradient-to-r from-gray-600 to-gray-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              } text-white border border-white/20`}
            >
              {popupType === "success" && (
                <motion.i
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="fa-solid fa-heart text-white text-lg"
                ></motion.i>
              )}
              {popupType === "remove" && (
                <motion.i
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="fa-solid fa-trash-alt text-white text-lg"
                ></motion.i>
              )}
              {popupType === "error" && (
                <motion.i
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="fa-solid fa-exclamation-circle text-white text-lg"
                ></motion.i>
              )}
              {popupType === "info" && (
                <motion.i
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="fa-solid fa-info-circle text-white text-lg"
                ></motion.i>
              )}
              <span className="font-medium text-sm">{popupMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default DisplayCard;