import React, { useState } from "react";
import StarRating from "./StarRating";

function ProductInfo({
  product,
  reviewSummary,
  availableStock,
  reservedInCart,
}) {
  const [showQuickInfo, setShowQuickInfo] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl xs:text-3xl md:text-4xl font-bold text-classic mb-2">
          {product.name}
        </h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-linear-to-r from-primary/10 to-primary/5 text-primary rounded-full text-sm font-medium">
            {product.category || "Uncategorized"}
          </span>
          <div className="flex items-center gap-2">
            <StarRating rating={reviewSummary?.averageRating || 0} size="sm" />
            <span className="text-secondary/85 text-sm">
              ({reviewSummary?.totalReviews || 0} reviews)
            </span>
          </div>
        </div>

        {/* Price */}
        <PriceDisplay product={product} />

        {/* Stock Information */}
        <StockInfo
          product={product}
          availableStock={availableStock}
          reservedInCart={reservedInCart}
        />
      </div>

      {/* Dynamic Quick Info with Toggle */}
      <div className="border-t border-gray-200 pt-4">
        {/* Toggle Button */}
        <button
          onClick={() => setShowQuickInfo(!showQuickInfo)}
          className="w-full flex items-center justify-between group mb-3"
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bolt text-primary text-sm"></i>
            <span className="text-sm font-medium text-gray-700">
              Quick Info
            </span>
          </div>
          <div
            className={`transform transition-transform duration-300 ${
              showQuickInfo ? "rotate-180" : ""
            }`}
          >
            <i className="fa-solid fa-chevron-down text-gray-400 text-xs group-hover:text-primary transition-colors"></i>
          </div>
        </button>

        {/* Quick Info Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showQuickInfo ? "max-h-96" : "max-h-0"
          }`}
        >
          <QuickInfoContent product={product} />
        </div>
      </div>
    </div>
  );
}

/* Price */
function PriceDisplay({ product }) {
  return (
    <div className="flex items-baseline gap-4 mb-6">
      {product.onSale && product.salePrice ? (
        <>
          <span className="text-2xl xs:text-3xl sm:text-4xl font-bold text-danger">
            ৳{(product.salePrice || 0).toLocaleString()}
          </span>
          <span className="text-lg xs:text-xl sm:text-2xl line-through text-classic/60">
            ৳{(product.price || 0).toLocaleString()}
          </span>
          {product.price && product.salePrice && (
            <span className="px-2 py-0.5 xs:px-3 xs:py-2 bg-danger/10 text-danger rounded-full text-xs xs:text-sm font-bold whitespace-nowrap">
              Save{" "}
              {(
                (((product.price || 0) - (product.salePrice || 0)) /
                  (product.price || 1)) *
                100
              ).toFixed(0)}
              %
            </span>
          )}
        </>
      ) : (
        <span className="text-4xl font-bold text-gray-900">
          ৳{(product.price || 0).toLocaleString()}
        </span>
      )}
    </div>
  );
}

/* Stock Information */
function StockInfo({ product, availableStock, reservedInCart }) {
  return (
    <div className="mb-6 p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {availableStock > 0 ? (
              <>
                <i className="fa-solid fa-check-circle text-success"></i>
                <span className="font-semibold text-success">In Stock</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-times-circle text-danger"></i>
                <span className="font-semibold text-danger">Out of Stock</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {availableStock} units available
            {reservedInCart > 0 && (
              <span className="text-warning ml-2">
                ({reservedInCart} in your cart)
              </span>
            )}
          </p>
        </div>
        {product.sku && (
          <div className="text-right">
            <p className="text-sm text-secondary">SKU</p>
            <p className="font-mono font-bold text-classic">{product.sku}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Quick Info Content - Separated component */
function QuickInfoContent({ product }) {
  const quickInfo = product.quickInfo || {};

  // Helper functions to get display text
  const getReturnPolicyLabel = (policy) => {
    const policies = {
      "30-day": "30-Day Returns",
      "14-day": "14-Day Returns",
      "7-day": "7-Day Returns",
      "non-returnable": "Non-Returnable",
    };
    return policies[policy] || "30-Day Returns";
  };

  const getSupportLabel = (support) => {
    const supports = {
      "24/7": "24/7 Support",
      "business-hours": "Business Hours",
      "email-only": "Email Only",
    };
    return supports[support] || "24/7 Support";
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Main 3-column quick info */}
      <div className="grid grid-cols-3 gap-3">
        {/* Free Shipping / Shipping Info */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center">
          <i className="fa-solid fa-truck text-primary text-lg mb-1"></i>
          <p className="text-xs text-primary font-medium">
            {quickInfo.freeShipping !== false
              ? "Free Shipping"
              : "Paid Shipping"}
          </p>
        </div>

        {/* Return Policy */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center">
          <i className="fa-solid fa-undo-alt text-purple-600 text-lg mb-1"></i>
          <p className="text-xs text-purple-700 font-medium">
            {getReturnPolicyLabel(quickInfo.returnPolicy)}
          </p>
        </div>

        {/* Customer Support */}
        <div className="bg-linear-to-br from-amber-50 to-amber-100 p-3 rounded-xl text-center">
          <i className="fa-solid fa-headset text-warning text-lg mb-1"></i>
          <p className="text-xs text-warning font-medium">
            {getSupportLabel(quickInfo.support)}
          </p>
        </div>
      </div>

      {/* Additional info row (optional) */}
      {(quickInfo.deliveryTime || quickInfo.warranty) && (
        <div className="grid grid-cols-2 gap-3">
          {quickInfo.deliveryTime && (
            <div className="bg-linear-to-br from-green-50 to-green-100 p-2 rounded-lg text-center">
              <i className="fa-solid fa-clock text-green-600 text-sm mb-0.5"></i>
              <p className="text-[10px] text-green-700 font-medium truncate">
                {quickInfo.deliveryTime}
              </p>
            </div>
          )}
          {quickInfo.warranty && (
            <div className="bg-linear-to-br from-red-50 to-red-100 p-2 rounded-lg text-center">
              <i className="fa-solid fa-shield-alt text-red-600 text-sm mb-0.5"></i>
              <p className="text-[10px] text-red-700 font-medium truncate">
                {quickInfo.warranty}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductInfo;
