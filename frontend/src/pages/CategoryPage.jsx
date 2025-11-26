import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import DisplayCard from "../components/Common/DisplayCard";

function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Convert URL parameter back to readable category name
  const formattedCategoryName = categoryName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/products`);
        let productsData = [];

        if (Array.isArray(res.data)) productsData = res.data;
        else if (res.data && Array.isArray(res.data.data))
          productsData = res.data.data;
        else if (res.data && Array.isArray(res.data.products))
          productsData = res.data.products;

        // Filter products by category (case insensitive)
        const categoryProducts = productsData.filter(
          (product) =>
            product.category &&
            product.category.toLowerCase() ===
              formattedCategoryName.toLowerCase()
        );

        setProducts(categoryProducts);
      } catch (error) {
        console.error("Failed to load category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [apiUrl, categoryName, formattedCategoryName]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-urbanist">
        <h1 className="text-2xl font-bold mb-6 font-urbanist">
          Loading {formattedCategoryName}...
        </h1>
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <DisplayCard key={index} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-urbanist">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-2">
          {formattedCategoryName}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {products.length} {products.length === 1 ? "product" : "products"}{" "}
          found
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <i className="fa-solid fa-box-open text-5xl sm:text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg sm:text-xl mb-4">
            No products found in this category
          </p>
          <p className="text-gray-400 text-sm">
            Try browsing other categories or check back later
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-start sm:justify-items-center">
          {products.map((product) => (
            <DisplayCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
