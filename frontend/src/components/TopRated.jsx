import React, { useEffect, useState } from "react";
import DisplayCard from "./Common/DisplayCard";
import axios from "axios";
import { useNavigate } from "react-router";

function TopRated({ limit = 8 }) {
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setLoading(true);

        // Fetch all products first
        const res = await axios.get(`${apiUrl}/api/products`);

        // Handle different API response structures
        let products = [];
        if (Array.isArray(res.data)) {
          products = res.data;
        } else if (res.data?.data) {
          products = res.data.data;
        } else if (res.data?.products) {
          products = res.data.products;
        } else {
          products = res.data || [];
        }

        // Filter out products without rating summary
        const productsWithRating = products.filter(
          (product) =>
            product.ratingSummary && product.ratingSummary.totalReviews > 0
        );

        // Sort by average rating (highest first)
        const sortedProducts = [...productsWithRating].sort((a, b) => {
          const ratingA = a.ratingSummary?.averageRating || 0;
          const ratingB = b.ratingSummary?.averageRating || 0;
          return ratingB - ratingA;
        });

        // Take top N products
        const topProducts = sortedProducts.slice(0, limit);

        setTopRatedProducts(topProducts);
      } catch (err) {
        console.error("Failed to fetch top rated products:", err);
        setError("Failed to load top rated products");
        setTopRatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRated();
  }, [apiUrl, limit]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-star text-warning text-xl"></i>
            <h2 className="text-2xl font-bold font-urbanist">
              Top Rated Products
            </h2>
          </div>
        </div>
        <div className="grid gap-3 xs:gap-11 md:gap-18 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DisplayCard key={index} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  if (error && topRatedProducts.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-star text-warning text-xl"></i>
            <h2 className="text-2xl font-bold font-urbanist">
              Top Rated Products
            </h2>
          </div>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <i className="fa-solid fa-exclamation-triangle text-3xl text-warning mb-3"></i>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-star text-warning text-xl"></i>
          <h2 className="text-2xl font-bold font-urbanist">
            Top Rated Products
          </h2>
        </div>
        <button
          onClick={() => navigate("/products?sort=rating")}
          className="text-primary hover:text-primary/80 text-sm flex items-center gap-2 transition-colors"
        >
          View All
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>

      {topRatedProducts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <i className="fa-solid fa-star text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500 mb-2">No top rated products yet</p>
          <p className="text-gray-400 text-sm">
            Products with highest ratings will appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-3 xs:gap-11 md:gap-18 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center px-4">
          {topRatedProducts.map((product) => (
            <DisplayCard
              key={product._id}
              product={product}
              badge={{
                text: `${
                  product.ratingSummary?.averageRating?.toFixed(1) || "4.5"
                }★`,
                color: "bg-yellow-500",
                icon: "fa-solid fa-star",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TopRated;
