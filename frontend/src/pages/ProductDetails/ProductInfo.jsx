// components/ProductInfo.jsx
import React from "react";
import StarRating from "./StarRating";

function ProductInfo({
  product,
  reviewSummary,
  availableStock,
  reservedInCart,
}) {
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

      {/* Quick Info */}
      <QuickInfo />
    </div>
  );
}
{
  /* Price */
}
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
{
  /* Stock Information */
}
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
{
  /* Quick Info */
}
function QuickInfo() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-linear-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center">
        <i className="fa-solid fa-truck text-primary text-lg mb-1"></i>
        <p className="text-xs text-primary font-medium">Free Shipping</p>
      </div>
      <div className="bg-linear-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center">
        <i className="fa-solid fa-undo-alt text-purple-600 text-lg mb-1"></i>
        <p className="text-xs text-purple-700 font-medium">30-Day Returns</p>
      </div>
      <div className="bg-linear-to-br from-amber-50 to-amber-100 p-3 rounded-xl text-center">
        <i className="fa-solid fa-headset text-warning text-lg mb-1"></i>
        <p className="text-xs text-warning font-medium">24/7 Support</p>
      </div>
    </div>
  );
}

export default ProductInfo;
