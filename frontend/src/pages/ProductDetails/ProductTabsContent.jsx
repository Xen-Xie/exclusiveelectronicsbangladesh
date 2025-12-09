// components/ProductTabsContent.jsx
import React, { useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";
import Btn from "../../components/Common/Btn";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";

/**
 * Main component that renders different tab content based on the active tab selection.
 * Manages product description, specifications, and customer reviews.
 */

function ProductTabsContent({
  activeTab,
  product,
  availableStock,
  reviews,
  reviewSummary,
  loadingReviews,
  user,
  canReview,
  userReview,
  showReviewForm,
  setShowReviewForm,
  navigate,
  handleSubmitReview,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewImages,
  handleReviewImageUpload,
  submittingReview,
  setReviewImages,
  token = null,
  reviewSectionRef,
}) {
  // Get authentication context for user and token if not provided as props
  const authContext = useContext(AuthContext);
  const actualToken = token || authContext?.token;
  const actualUser = user || authContext?.user;

  const normalizedUser = actualUser
    ? {
        ...actualUser,
        _id: actualUser._id || actualUser.id,
      }
    : null;
  // Render product description tab
  if (activeTab === "description") {
    return <DescriptionTab product={product} />;
  }
  // Render product specifications tab
  if (activeTab === "specs") {
    return <SpecsTab product={product} availableStock={availableStock} />;
  }
  // Render customer reviews tab
  if (activeTab === "reviews") {
    return (
      <ReviewsTab
        reviews={reviews}
        reviewSummary={reviewSummary}
        loadingReviews={loadingReviews}
        user={normalizedUser}
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
        token={actualToken}
        reviewSectionRef={reviewSectionRef}
      />
    );
  }

  return null;
}
/**
 * Component for displaying product description and tags
 */
function DescriptionTab({ product }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 leading-relaxed">
        {product.description || "No description available."}
      </p>
      {product.tags?.length > 0 && (
        <div>
          <p className="font-medium text-gray-700 mb-2">Tags:</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * Component for displaying product specifications and attributes
 */
function SpecsTab({ product, availableStock }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-medium">{product.category || "Uncategorized"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">SKU</p>
          <p className="font-medium">{product.sku || "Not specified"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Stock Status</p>
          <p className="font-medium">
            {availableStock > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium capitalize">{product.status || "Active"}</p>
        </div>
      </div>
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div className="mt-4">
          <p className="font-medium text-gray-700 mb-2">
            Additional Specifications:
          </p>
          <div className="space-y-2">
            {Object.entries(product.attributes).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between py-2 border-b border-gray-100"
              >
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * Main reviews tab component that combines summary, header, form, and reviews list
 */
function ReviewsTab({
  reviews,
  reviewSummary,
  loadingReviews,
  user,
  canReview,
  userReview,
  showReviewForm,
  setShowReviewForm,
  navigate,
  handleSubmitReview,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewImages,
  handleReviewImageUpload,
  submittingReview,
  setReviewImages,
  token,
  reviewSectionRef,
}) {
  return (
    <div className="space-y-6" ref={reviewSectionRef}>
      {reviewSummary && <ReviewSummary reviewSummary={reviewSummary} />}

      <ReviewHeader
        reviews={reviews}
        user={user}
        canReview={canReview}
        userReview={userReview}
        showReviewForm={showReviewForm}
        setShowReviewForm={setShowReviewForm}
        navigate={navigate}
      />

      {showReviewForm && (
        <ReviewForm
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          reviewImages={reviewImages}
          handleReviewImageUpload={handleReviewImageUpload}
          handleSubmitReview={handleSubmitReview}
          submittingReview={submittingReview}
          setShowReviewForm={setShowReviewForm}
          setReviewImages={setReviewImages}
          userReview={userReview}
        />
      )}

      <ReviewsList
        reviews={reviews}
        loadingReviews={loadingReviews}
        user={user}
        canReview={canReview}
        setShowReviewForm={setShowReviewForm}
        token={token}
      />
    </div>
  );
}
/**
 * Component showing review statistics including average rating and distribution
 */
function ReviewSummary({ reviewSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-xl text-center">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {reviewSummary.averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          <StarRating
            rating={Math.round(reviewSummary.averageRating)}
            size="md"
          />
        </div>
        <p className="text-gray-600">
          {reviewSummary.totalReviews} review
          {reviewSummary.totalReviews !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="md:col-span-2 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewSummary.ratingDistribution[rating] || 0;
          const percentage =
            reviewSummary.totalReviews > 0
              ? ((count / reviewSummary.totalReviews) * 100).toFixed(0)
              : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm">{rating}</span>
                <i className="fa-solid fa-star text-amber-500 text-xs"></i>
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-10 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
/**
 * Header section for reviews with action buttons (write review/sign in)
 */
function ReviewHeader({
  reviews,
  user,
  canReview,
  userReview,
  showReviewForm,
  setShowReviewForm,
  navigate,
}) {
  return (
    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3 xs:gap-4">
      <h4 className="text-lg font-semibold text-gray-800">
        Customer Reviews{" "}
        <span className="text-primary">({reviews.length})</span>
      </h4>
      <div className="flex items-center gap-2">
        {user ? (
          canReview?.canReview ? (
            <Btn
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-2 py-1 xs:px-3 xs:py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm xs:text-base whitespace-nowrap"
            >
              {userReview ? "Edit Review" : "Write Review"}
            </Btn>
          ) : (
            <div className="text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              {canReview?.reason || "Cannot review this product"}
            </div>
          )
        ) : (
          <Btn
            variant="outline"
            onClick={() => navigate("/login")}
            className="px-3 py-2 xs:px-4 xs:py-2 rounded-lg text-sm xs:text-base whitespace-nowrap"
          >
            Sign in to Review
          </Btn>
        )}
      </div>
    </div>
  );
}
/**
 * Form component for writing or editing a product review
 */
function ReviewForm({
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewImages,
  handleReviewImageUpload,
  handleSubmitReview,
  submittingReview,
  setShowReviewForm,
  setReviewImages,
  userReview,
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        {userReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setReviewRating(star)}
              className="text-2xl"
            >
              <i
                className={`fa-solid ${
                  star <= reviewRating
                    ? "fa-star text-amber-500"
                    : "fa-star text-gray-300"
                } hover:text-amber-400`}
              ></i>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Your Review</label>
        <textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none min-h-[100px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          Minimum 10 characters required
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Add Photos (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleReviewImageUpload}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
        {reviewImages.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">
              Selected images ({reviewImages.length}/5):
            </p>
            <div className="flex gap-2 flex-wrap">
              {reviewImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setReviewImages(
                        reviewImages.filter((_, i) => i !== index)
                      );
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Btn
          onClick={handleSubmitReview}
          disabled={submittingReview || reviewComment.trim().length < 10}
          variant="primary"
          className="px-6 py-2 rounded-lg"
        >
          {submittingReview ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              Submitting...
            </>
          ) : userReview ? (
            "Update Review"
          ) : (
            "Submit Review"
          )}
        </Btn>
        <Btn
          onClick={() => {
            setShowReviewForm(false);
            setReviewComment("");
            setReviewImages([]);
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </Btn>
      </div>
    </div>
  );
}
/**
 * Component that displays the list of reviews or loading/empty states
 */
function ReviewsList({
  reviews,
  loadingReviews,
  user,
  canReview,
  setShowReviewForm,
  token,
}) {
  if (loadingReviews) {
    return (
      <div className="text-center py-8">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-primary mb-4"></i>
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length > 0) {
    return (
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem
            key={review._id}
            review={review}
            user={user}
            token={token}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl">
      <i className="fa-solid fa-star text-4xl text-gray-300 mb-4"></i>
      <h4 className="text-lg font-semibold text-gray-700 mb-2">
        No Reviews Yet
      </h4>
      <p className="text-gray-500 mb-4">
        Be the first to share your thoughts about this product!
      </p>
      {user && canReview?.canReview && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Write the First Review
        </button>
      )}
    </div>
  );
}
/**
 * Individual review item component with helpful voting functionality
 */
function ReviewItem({ review, user, token }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [userHasMarked, setUserHasMarked] = useState(
    review.userHasMarked || false
  );
  const [isLoading, setIsLoading] = useState(false);
  /**
   * Handles marking a review as helpful/unhelpful
   * Prevents users from voting on their own reviews
   */
  const handleMarkHelpful = async () => {
    const userId = user?._id || user?.id;

    if (!userId || !token || isLoading) {
      return;
    }
    // Check if this is the user's own review
    const isOwnReview = userId === review.user?._id;

    if (isOwnReview) {
      alert("You cannot mark your own review as helpful");
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await axios.put(
        `${apiUrl}/api/reviews/helpful/${review._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setHelpfulCount(response.data.helpfulCount);
        setUserHasMarked(response.data.userHasMarked);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userId = user?._id || user?.id;
  const isOwnReview = userId === review.user?._id;

  return (
    <div className="border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <span className="font-semibold text-gray-900 truncate">
              {review.user?.name || "Anonymous"}
            </span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full shrink-0">
                <i className="fa-solid fa-check-circle text-xs"></i>
                <span className="hidden xs:inline">Verified</span>
                <span className="xs:hidden">✓</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
            <div className="flex items-center">
              <StarRating rating={review.rating} size="xs" />
            </div>
            <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
              {review.isEdited
                ? `Edited ${review.formattedLastEditDate}`
                : review.formattedDate}
            </span>
            {review.isEdited && (
              <span className="text-xs text-gray-500">
                (Edited {review.editCount} time{review.editCount > 1 ? "s" : ""}
                )
              </span>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 ml-2 shrink-0">
          <i className="fa-solid fa-ellipsis-vertical text-sm md:text-base"></i>
        </button>
      </div>

      <p className="text-gray-700 text-sm md:text-base mb-3 leading-relaxed">
        {review.comment}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {review.images.map((img, idx) => (
            <div key={idx} className="relative shrink-0">
              <img
                src={img.url}
                alt={`Review image ${idx + 1}`}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                onClick={() => window.open(img.url, "_blank")}
                loading="lazy"
              />
              <div className="absolute inset-0 border border-gray-200 rounded-lg pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2">
        <span className="text-xs md:text-sm text-gray-500">
          Was this review helpful?
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkHelpful}
            disabled={isLoading || isOwnReview}
            className={`text-xs md:text-sm flex items-center justify-center gap-1 px-3 py-1.5 md:py-2 rounded-lg transition-colors whitespace-nowrap ${
              userHasMarked
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            } ${isOwnReview ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin text-xs md:text-sm"></i>
            ) : (
              <>
                <i
                  className={`fa-solid fa-thumbs-up text-xs md:text-sm ${
                    userHasMarked ? "text-white" : ""
                  }`}
                ></i>
                <span>
                  {userHasMarked ? "Helpful" : "Helpful"} ({helpfulCount})
                </span>
              </>
            )}
          </button>

          {isOwnReview && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              (Your review)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductTabsContent;
