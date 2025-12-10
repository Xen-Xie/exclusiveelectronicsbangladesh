import React from "react";
import { useNavigate } from "react-router";

function DisplayCard({ product, loading = false }) {
  const navigate = useNavigate();

  // First, check if product exists to prevent errors
  if (!product && !loading) {
    console.error("DisplayCard: product prop is undefined or null");
    return (
      <div className="rounded-lg shadow-sm bg-container overflow-hidden w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72">
        <div className="relative w-full h-32 sm:h-36 md:h-48 lg:h-52 xl:h-56 bg-gray-200"></div>
        <div className="p-1 sm:p-1 md:p-2">
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

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i
          key={`full-${i}`}
          className="fa-solid fa-star text-warning text-xs"
        ></i>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <i
          key="half"
          className="fa-solid fa-star-half-alt text-warning text-xs"
        ></i>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i
          key={`empty-${i}`}
          className="fa-regular fa-star text-warning text-xs"
        ></i>
      );
    }

    return stars;
  };

  const handleClick = () => {
    if (!loading && product?._id) {
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

          {/* Stars skeleton */}
          <div className="flex items-center gap-1 mb-2">
            <div className="h-3 w-12 bg-gray-200 animate-pulse rounded"></div>
          </div>

          {/* Price and sold skeleton */}
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
          alt={product?.name || "Product image"}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/placeholder.jpg")}
        />
        {product?.onSale && (
          <span className="absolute top-1 left-1 sm:top-1 sm:left-1 md:top-2 md:left-2 bg-danger text-primarybg text-xs font-bold px-1 py-0.5 sm:px-1 sm:py-0.5 md:px-2 md:py-1 rounded">
            SALE
          </span>
        )}
      </div>

      {/* Product details */}
      <div className="p-1 sm:p-1 md:p-2">
        <h2 className="text-xs sm:text-xs md:text-sm font-semibold line-clamp-1">
          {product?.name || "Unnamed Product"}
        </h2>

        <p className="text-xs text-gray-500 mt-0.5 sm:mt-0.5 md:mt-1 line-clamp-1">
          {product?.category || "No category"}
        </p>

        {/*  review count */}
        <div className="flex items-center gap-1 mt-1 mb-1">
          <div className="flex items-center gap-0.5">{renderStars()}</div>
          {/* Only show review count if there are reviews */}
          {totalReviews > 0 && (
            <span className="text-xs text-gray-600">({totalReviews})</span>
          )}
        </div>

        {/* Price and sold count */}
        <div className="mt-1 sm:mt-1 md:mt-2 flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-1 md:gap-2">
            {product?.onSale && product?.salePrice ? (
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
                {product?.price ? `${product.price}৳` : "Price not set"}
              </span>
            )}
          </div>

          {/* Sold count */}
          {soldCount > 0 && (
            <span className="text-xs text-secondary/55 font-medium">
              {soldCount} sold
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayCard;
