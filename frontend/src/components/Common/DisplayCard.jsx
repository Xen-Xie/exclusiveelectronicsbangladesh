import React from "react";
import { useNavigate } from "react-router";

function DisplayCard({ product, loading = false }) {
  const navigate = useNavigate();
  const imageUrl =
    product?.images?.[0]?.url || product?.images?.[0] || "/placeholder.jpg";

  const handleClick = () => {
    if (!loading) {
      // Construct a SEO-friendly URL using product ID and name
      navigate(
        `/products/${product._id}/${product.name
          .replace(/\s+/g, "-")
          .toLowerCase()}`
      );
    }
  };
  // Show skeleton/loading state if loading prop is true
  if (loading) {
    return (
      <div
        className="
          rounded-lg shadow-sm bg-container overflow-hidden
          w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72
        "
      >
        {/* Image placeholder */}
        <div className="relative w-full h-32 sm:h-36 md:h-48 lg:h-52 xl:h-56 bg-gray-200 animate-pulse"></div>
        <div className="p-1 sm:p-1 md:p-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  // product card display
  return (
    <div
      onClick={handleClick}
      className="
        cursor-pointer rounded-lg shadow-sm 
        hover:shadow-md hover:-translate-y-1 
        transition-all duration-300 bg-container overflow-hidden
        w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72
      "
    >
      {/* Product image container */}
      <div className="relative w-full h-32 sm:h-36 md:h-48 lg:h-52 xl:h-56 bg-container">
        <img
          src={imageUrl}
          alt={product.name || "Product image"}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/placeholder.jpg")}
        />
        {product.onSale && (
          <span className="absolute top-1 left-1 sm:top-1 sm:left-1 md:top-2 md:left-2 bg-danger text-primarybg text-xs font-bold px-1 py-0.5 sm:px-1 sm:py-0.5 md:px-2 md:py-1 rounded">
            SALE
          </span>
        )}
      </div>
      {/* Product details */}
      <div className="p-1 sm:p-1 md:p-2">
        <h2 className="text-xs sm:text-xs md:text-sm font-semibold line-clamp-1">
          {product.name || "Unnamed Product"}
        </h2>

        <p className="text-xs text-gray-500 mt-0.5 sm:mt-0.5 md:mt-1 line-clamp-1">
          {product.category || "No category"}
        </p>

        <div className="mt-1 sm:mt-1 md:mt-2 flex items-center gap-1 sm:gap-1 md:gap-2">
          {product.onSale && product.salePrice ? (
            <>
              <span className="text-danger font-bold text-xs sm:text-xs md:text-sm">
                {product.salePrice}৳
              </span>
              <span className="text-secondary text-xs line-through">
                {product.price}৳
              </span>
            </>
          ) : (
            <span className="text-secondary font-semibold text-xs sm:text-xs md:text-sm">
              {product.price ? `${product.price}৳` : "Price not set"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayCard;
