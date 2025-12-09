import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import axios from "axios";
import { useAuth } from "../../src/auth/useAuth";
import { useCart } from "../context/useCart";
import DisplayCard from "../components/Common/DisplayCard";
import { AuthContext } from "../auth/AuthContext";

import ProductGallery from "./ProductDetails/ProductGallery";
import ProductInfo from "./ProductDetails/ProductInfo";
import ProductTabsContent from "./ProductDetails/ProductTabsContent";
import ProductActions from "./ProductDetails/ProductActions";
import RecentlyViewedProducts from "./ProductDetails/RecentlyViewedProducts";
import LoadingSkeleton from "./ProductDetails/LoadingSkeleton";
import ErrorState from "./ProductDetails/ErrorState";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const { token } = useContext(AuthContext) || {};
  const apiUrl = import.meta.env.VITE_API_URL;
  const { cart, addToCart } = useCart();
  const location = useLocation();

  // State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const reviewSectionRef = useRef(null);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  // Parse query parameter for tab on component mount and when location changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");

    // Set active tab based on URL parameter if valid
    if (tabParam && ["description", "specs", "reviews"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  // Automatically jump into review form when reviews tab is active and user can review
  useEffect(() => {
    if (activeTab === "reviews" && canReview?.canReview && !userReview) {
      setShowReviewForm(true);
    }
  }, [activeTab, canReview, userReview]);
  // Parse query parameter for tab on component mount and when location changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");

    // Set active tab based on URL parameter if valid
    if (tabParam && ["description", "specs", "reviews"].includes(tabParam)) {
      setActiveTab(tabParam);

      // If reviews tab, scroll to it after a short delay
      if (tabParam === "reviews") {
        setTimeout(() => {
          if (reviewSectionRef.current) {
            reviewSectionRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 400);
      }
    }
  }, [location.search]);
  // Helper functions
  const getDefaultReviewSummary = useCallback(
    () => ({
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }),
    []
  );

  const fetchProductData = useCallback(async () => {
    const res = await axios.get(`${apiUrl}/api/products/${id}`);
    return res.data.data || res.data;
  }, [apiUrl, id]);

  const fetchProductReviews = useCallback(
    async (productId) => {
      try {
        setLoadingReviews(true);
        const res = await axios.get(
          `${apiUrl}/api/reviews/product/${productId}`
        );
        setReviews(res.data.reviews || []);
        setReviewSummary(res.data.summary || getDefaultReviewSummary());
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    },
    [apiUrl, getDefaultReviewSummary]
  );

  const fetchRelatedProducts = useCallback(
    async (productData) => {
      if (!productData.category) return;

      try {
        const res = await axios.get(
          `${apiUrl}/api/products/category/${productData.category}`
        );
        const allProducts = res.data.data || [];
        const filtered = allProducts.filter((p) => p._id !== id).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    },
    [apiUrl, id]
  );

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const productData = await fetchProductData();
      if (!productData) return;

      setProduct(productData);
      fetchProductReviews(productData._id);
      fetchRelatedProducts(productData);
    } catch (err) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [fetchProductData, fetchProductReviews, fetchRelatedProducts]);

  const checkCanReview = useCallback(async () => {
    if (!user || !token || !product?._id) return;

    try {
      const res = await axios.get(
        `${apiUrl}/api/reviews/can-review/${product._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCanReview(res.data);
      if (res.data.hasReviewed && res.data.existingReview) {
        setUserReview(res.data.existingReview);
        setReviewRating(res.data.existingReview.rating);
        setReviewComment(res.data.existingReview.comment);
      }
    } catch (err) {
      console.error("Failed to check review eligibility:", err);
    }
  }, [user, token, product?._id, apiUrl]);

  // Fetch product
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Check review eligibility
  useEffect(() => {
    if (product && product._id) {
      checkCanReview();
    }
  }, [product, user, token, checkCanReview]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      const existingInCart = cart.find((item) => item._id === product._id);
      const existingQty = existingInCart ? existingInCart.quantity : 0;
      const totalQty = existingQty + quantity;

      if (totalQty > (product.stock || 0)) {
        alert(
          `You can only add ${product.stock || 0} ${product.name} in total`
        );
        return;
      }

      addToCart({
        ...product,
        quantity,
        selectedImage: product.images?.[0]?.url || "/placeholder.jpg",
        salePrice:
          product.onSale && product.salePrice ? product.salePrice : null,
      });

      // Show success feedback
      const event = new CustomEvent("cart:add", { detail: product });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      addToCart({
        ...product,
        quantity: Math.min(quantity, product.stock || 0),
        selectedImage: product.images?.[0]?.url || "/placeholder.jpg",
        salePrice:
          product.onSale && product.salePrice ? product.salePrice : null,
      });
      navigate("/checkout");
    } catch (err) {
      console.error("Error in buy now:", err);
      alert("Failed to process buy now");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      alert("Please write a review of at least 10 characters");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (!product || !product._id) {
      alert("Product information is missing");
      return;
    }

    try {
      setSubmittingReview(true);
      const formData = new FormData();
      formData.append("rating", reviewRating);
      formData.append("comment", reviewComment);

      reviewImages.forEach((file) => {
        formData.append("reviewImages", file);
      });

      const res = await axios.post(
        `${apiUrl}/api/reviews/product/${product._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert(res.data.message);
        setShowReviewForm(false);
        setReviewComment("");
        setReviewImages([]);
        fetchProductReviews(product._id);
        checkCanReview();
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setReviewImages(files);
  };

  const shareProduct = () => {
    if (!product) return;

    const url = window.location.href;
    const price =
      product.onSale && product.salePrice ? product.salePrice : product.price;
    const text = `Check out ${product.name} - ৳${price || "0"}`;

    if (navigator.share) {
      navigator.share({ title: product.name, text, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    const cartItem = cart.find((item) => item._id === product._id);
    const reservedInCart = cartItem ? cartItem.quantity : 0;
    return Math.max(0, (product.stock || 0) - reservedInCart);
  };

  // Loading and error states
  if (loading) return <LoadingSkeleton />;
  if (error || !product)
    return <ErrorState error={error} navigate={navigate} />;

  const availableStock = getAvailableStock();
  const cartItem = cart.find((item) => item._id === product._id);
  const reservedInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-urbanist">
      {/* Breadcrumb */}
      <Breadcrumb product={product} navigate={navigate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column - Gallery */}
        <div className="lg:col-span-2">
          <ProductGallery
            product={product}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
            shareProduct={shareProduct}
            navigate={navigate}
          />
        </div>

        {/* Right Column - Product Info & Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Product Basic Info */}
            <ProductInfo
              product={product}
              reviewSummary={reviewSummary}
              availableStock={availableStock}
              reservedInCart={reservedInCart}
            />

            {/* Product Actions */}
            <ProductActions
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              availableStock={availableStock}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
              addingToCart={addingToCart}
            />
          </div>
        </div>

        {/* Full Width Content Below - Tabs */}
        <div className="lg:col-span-3">
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="mt-6">
            <ProductTabsContent
              activeTab={activeTab}
              product={product}
              availableStock={availableStock}
              reviews={reviews}
              reviewSummary={reviewSummary}
              loadingReviews={loadingReviews}
              user={user}
              canReview={canReview}
              userReview={userReview}
              showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
              navigate={navigate}
              handleSubmitReview={handleSubmitReview}
              reviewRating={reviewRating}
              setReviewRating={setReviewRating}
              reviewComment={reviewComment}
              setReviewComment={setReviewComment}
              reviewImages={reviewImages}
              handleReviewImageUpload={handleReviewImageUpload}
              submittingReview={submittingReview}
              setReviewImages={setReviewImages}
              reviewSectionRef={reviewSectionRef}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts
          relatedProducts={relatedProducts}
          product={product}
          navigate={navigate}
        />
      )}

      {/* Recently Viewed Products */}
      {user && token && (
        <RecentlyViewedProducts userId={user._id} token={token} />
      )}
    </div>
  );
}

// Small helper components
function Breadcrumb({ product, navigate }) {
  return (
    <nav className="flex items-center text-sm text-gray-600 mb-8">
      <button
        onClick={() => navigate("/")}
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <i className="fa-solid fa-home text-xs"></i> Home
      </button>
      <i className="fa-solid fa-chevron-right text-xs mx-2 text-gray-400"></i>
      <button
        onClick={() =>
          navigate(
            `/category/${(product.category || "")
              .toLowerCase()
              .replace(/\s+/g, "-")}`
          )
        }
        className="hover:text-primary transition-colors"
      >
        {product.category || "Uncategorized"}
      </button>
      <i className="fa-solid fa-chevron-right text-xs mx-2 text-gray-400"></i>
      <span className="text-primary font-medium truncate max-w-[200px]">
        {product.name}
      </span>
    </nav>
  );
}

function TabsNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "description", label: "Description", icon: "file-alt" },
    { id: "specs", label: "Specifications", icon: "list-check" },
    { id: "reviews", label: "Reviews", icon: "star" },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-medium transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className={`fa-solid fa-${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RelatedProducts({ relatedProducts, product, navigate }) {
  return (
    <div className="mt-16 pt-8 border-t">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Related Products</h3>
          <p className="text-gray-600 mt-1">
            Other products you might like in {product.category}
          </p>
        </div>
        <button
          onClick={() =>
            navigate(
              `/category/${(product.category || "")
                .toLowerCase()
                .replace(/\s+/g, "-")}`
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          View All <i className="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct) => (
          <DisplayCard
            key={relatedProduct._id}
            product={relatedProduct}
            onClick={() =>
              navigate(`/products/${relatedProduct._id}/${relatedProduct.slug}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default ProductDetails;
