import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../../src/auth/useAuth";
import Btn from "../components/Common/Btn";
import { useCart } from "../context/useCart";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const apiUrl = import.meta.env.VITE_API_URL;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, apiUrl]);

  const { cart, addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);

      // Find if product is already in cart
      const existingInCart = cart.find((item) => item._id === product._id);
      const existingQty = existingInCart ? existingInCart.quantity : 0;

      // Total quantity after adding
      const totalQty = existingQty + quantity;

      if (totalQty > product.stock) {
        alert(`You can only add ${product.stock} ${product.name} in total`);
        return;
      }

      // Add to cart
      addToCart({
        ...product,
        quantity,
        selectedImageIndex: product.images?.[0]?.url || "/placeholder.jpg",
        salePrice:
          product.onSale && product.salePrice ? product.salePrice : null,
      });

      // Update local product state to reflect real-time stock
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              stock: prev.stock, // Stock will be decremented when order is paid
            }
          : null
      );
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy Now Function
  const handleBuyNow = async () => {
    if (!product) return;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);

      // Add product to cart first
      addToCart({
        ...product,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
        selectedImageIndex: product.images?.[0]?.url || "/placeholder.jpg",
        salePrice:
          product.onSale && product.salePrice ? product.salePrice : null,
      });

      // Navigate to checkout
      navigate("/checkout");
    } catch (err) {
      console.error("Error in buy now:", err);
      alert("Failed to process buy now");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-gray-300 h-112 rounded-lg"></div>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-300 h-20 w-20 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-300 h-8 rounded w-3/4"></div>
            <div className="bg-gray-300 h-6 rounded w-1/2"></div>
            <div className="bg-gray-300 h-4 rounded w-full"></div>
            <div className="bg-gray-300 h-4 rounded w-full"></div>
            <div className="bg-gray-300 h-4 rounded w-2/3"></div>
            <div className="bg-gray-300 h-12 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );

  if (error || !product)
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error || "Product not found"}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          Back to Home
        </button>
      </div>
    );

  const images = product.images || [];
  const mainImage = images[selectedImageIndex]?.url || "/placeholder.jpg";

  // Calculate available stock considering cart items
  const cartItem = cart.find((item) => item._id === product._id);
  const reservedInCart = cartItem ? cartItem.quantity : 0;
  const availableStock = Math.max(0, product.stock - reservedInCart);

  return (
    <div className="max-w-7xl mx-auto p-6 font-urbanist">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex flex-wrap gap-2">
        <button onClick={() => navigate("/")} className="hover:text-primary">
          Home
        </button>
        <span>/</span>
        <span className="text-gray-700">{product.category}</span>
        <span>/</span>
        <span className="text-secondary font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* IMAGE GALLERY */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full max-h-112 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                    selectedImageIndex === idx
                      ? "border-primary scale-105"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={img.url || img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover hover:opacity-80 transition"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT DETAILS */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-secondary mb-1">
              {product.name}
            </h1>
            <p className="text-secondary/45 mb-4 text-sm">{product.category}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-danger">
                    ৳{product.salePrice}
                  </span>
                  <span className="text-lg line-through text-secondary/85">
                    ৳{product.price}
                  </span>
                  <span className="bg-danger text-primarybg text-xs font-bold px-2 py-1 rounded">
                    Save ৳{product.price - product.salePrice}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-secondary">
                  ৳{product.price}
                </span>
              )}
            </div>

            {/* Stock Information */}
            <div className="mb-4 space-y-1">
              {product.stock > 0 ? (
                <>
                  <span className="text-success font-medium">
                    In Stock ({availableStock} available)
                  </span>
                  {reservedInCart > 0 && (
                    <p className="text-xs text-warning">
                      {reservedInCart} item(s) in your cart
                    </p>
                  )}
                </>
              ) : (
                <span className="text-danger font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-secondary/55 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {/* SKU & Tags */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            {product.sku && (
              <div>
                <span className="font-semibold">SKU:</span> {product.sku}
              </div>
            )}
            {product.tags?.length > 0 && (
              <div>
                <span className="font-semibold">Tags:</span>{" "}
                {product.tags.join(", ")}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">Quantity:</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="px-3 py-2 text-gray-600 disabled:text-gray-300 hover:bg-gray-100 transition"
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= availableStock}
                className="px-3 py-2 text-gray-600 disabled:text-gray-300 hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>
            <span className="text-sm text-info font-inter">
              Max: {availableStock}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Btn
              variant="outline"
              onClick={handleAddToCart}
              disabled={
                product.stock === 0 || availableStock === 0 || addingToCart
              }
              className="flex-1 py-3 px-6 rounded-xl hover:bg-primary-dark disabled:bg-secondary/25 transition font-semibold flex items-center justify-center gap-2"
            >
              {addingToCart ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Adding...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cart-plus"></i> Add to Cart
                </>
              )}
            </Btn>

            <Btn
              variant="success"
              onClick={handleBuyNow}
              disabled={
                product.stock === 0 || availableStock === 0 || addingToCart
              }
              className="flex-1 bg-success text-white py-3 px-6 rounded-xl hover:bg-success-dark disabled:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
            >
              {addingToCart ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt"></i> Buy Now
                </>
              )}
            </Btn>
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="border-t pt-8 mt-12">
        <h3 className="text-2xl font-bold mb-6">You May Also Like</h3>
        <div className="text-center text-gray-500">
          <p>Related products will be displayed here</p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
