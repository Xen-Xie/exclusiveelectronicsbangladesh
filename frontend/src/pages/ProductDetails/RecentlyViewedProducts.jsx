import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
/**
 * Component for displaying products recently viewed by the user
 * Fetches and shows personalized product recommendations based on viewing history
 */
function RecentlyViewedProducts({ userId, token }) {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/behavior/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 4 },
        });

        if (res.data.status === "success") {
          setRecentlyViewed(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch recently viewed:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchRecentlyViewed();
    }
  }, [userId, token, apiUrl]);

  if (loading) {
    return (
      <div className="mt-12 p-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Recently Viewed
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-40 rounded-lg mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-3/4 mb-1"></div>
              <div className="bg-gray-300 h-3 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recentlyViewed.map((product) => (
          <div
            key={product._id}
            className="group cursor-pointer"
            onClick={() => navigate(`/products/${product._id}/${product.slug}`)}
          >
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-gray-50 to-gray-100 mb-3">
              <img
                src={product.images?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.onSale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  SALE
                </div>
              )}
            </div>
            <h4 className="font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="font-bold text-red-600">
                    ৳{(product.salePrice || 0).toLocaleString()}
                  </span>
                  <span className="text-sm line-through text-gray-400">
                    ৳{(product.price || 0).toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="font-bold text-gray-900">
                  ৳{(product.price || 0).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyViewedProducts;
