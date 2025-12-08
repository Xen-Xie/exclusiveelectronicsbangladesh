import Btn from "../../components/Common/Btn";

function ProductActions({
  product,
  quantity,
  setQuantity,
  availableStock,
  handleAddToCart,
  handleBuyNow,
  addingToCart,
}) {
  // Define handleQuantityChange inside the main component
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Quantity Selector */}
      <QuantitySelector
        quantity={quantity}
        handleQuantityChange={handleQuantityChange}
        availableStock={availableStock}
        product={product}
      />

      {/* Action Buttons */}
      <ActionButtons
        handleAddToCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
        availableStock={availableStock}
        addingToCart={addingToCart}
      />

      {/* Additional Info */}
      <AdditionalInfo />
    </div>
  );
}

function QuantitySelector({
  quantity,
  handleQuantityChange,
  availableStock,
  product,
}) {
  // Calculate total price
  const calculateTotal = () => {
    const price =
      product.onSale && product.salePrice ? product.salePrice : product.price;
    return ((price || 0) * quantity).toLocaleString();
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-medium text-secondary text-sm md:text-base">
          Quantity:
        </label>
        <span className="text-xs md:text-sm text-secondary/65">
          Max: {availableStock} units
        </span>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg md:rounded-xl overflow-hidden w-fit">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="px-3 py-2 md:px-4 md:py-3 text-gray-600 disabled:text-gray-300 hover:bg-gray-50 transition-all text-sm md:text-base"
            type="button"
          >
            <i className="fa-solid fa-minus"></i>
          </button>
          <span className="px-4 py-2 md:px-6 md:py-3 border-x border-gray-300 font-bold min-w-[50px] md:min-w-[60px] text-center text-base md:text-lg">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= availableStock}
            className="px-3 py-2 md:px-4 md:py-3 text-gray-600 disabled:text-gray-300 hover:bg-gray-50 transition-all text-sm md:text-base"
            type="button"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
        <div className="text-sm">
          <p className="text-gray-600">
            Total:{" "}
            <span className="font-bold text-primary text-base md:text-lg">
              ৳{calculateTotal()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButtons({
  handleAddToCart,
  handleBuyNow,
  availableStock,
  addingToCart,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
      <Btn
        variant="primary"
        onClick={handleAddToCart}
        disabled={availableStock === 0 || addingToCart}
        className="flex-1 px-4 py-3 md:px-6 md:py-4 rounded-lg md:rounded-xl shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-semibold"
        type="button"
      >
        {addingToCart ? (
          <>
            <i className="fa-solid fa-spinner fa-spin text-sm md:text-base"></i>
            <span className="text-sm md:text-base">Adding...</span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-cart-plus text-sm md:text-base"></i>
            <span className="text-sm md:text-base">Add to Cart</span>
          </>
        )}
      </Btn>

      <Btn
        variant="success"
        onClick={handleBuyNow}
        disabled={availableStock === 0 || addingToCart}
        className="flex-1 px-4 py-3 md:px-6 md:py-4 rounded-lg md:rounded-xl shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-semibold bg-linear-to-r from-green-500 to-emerald-600"
        type="button"
      >
        <i className="fa-solid fa-bolt text-sm md:text-base"></i>
        <span className="text-sm md:text-base">Buy Now</span>
      </Btn>
    </div>
  );
}

function AdditionalInfo() {
  return (
    <div className="p-3 md:p-4 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl">
      <div className="flex items-center gap-2 md:gap-3">
        <i className="fa-solid fa-info-circle text-primary text-base md:text-lg"></i>
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-700">
            Need help with this product?
          </p>
          <p className="text-xs text-gray-500">
            Contact our support team for any questions or assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductActions;
