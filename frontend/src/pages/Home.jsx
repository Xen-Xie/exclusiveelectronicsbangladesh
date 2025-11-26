import React, { useEffect, useState } from "react";
import axios from "axios";
import DisplayCard from "../components/Common/DisplayCard";
import SearchBar from "../components/Common/SearchBar";
import { useNavigate } from "react-router";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch products and categories when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await axios.get(`${apiUrl}/api/products`);
        let productsData = [];
        if (Array.isArray(productsRes.data)) productsData = productsRes.data;
        else if (productsRes.data && Array.isArray(productsRes.data.data))
          productsData = productsRes.data.data;
        else if (productsRes.data && Array.isArray(productsRes.data.products))
          productsData = productsRes.data.products;

        setProducts(productsData);
        const featured = productsData.filter((p) => p.featured);
        setFilteredProducts(featured);

        // Extract unique categories from products with their images
        const categoryMap = new Map();

        productsData.forEach((product) => {
          if (product.category && product.category.trim() !== "") {
            if (!categoryMap.has(product.category)) {
              categoryMap.set(product.category, []);
            }
            // Add product image if available - handle different image formats
            let imageUrl = "";
            if (product.images && product.images.length > 0) {
              // Handle both {url: string} format and direct string format
              imageUrl =
                typeof product.images[0] === "string"
                  ? product.images[0]
                  : product.images[0]?.url;
            }
            if (imageUrl && imageUrl.trim() !== "") {
              categoryMap.get(product.category).push(imageUrl);
            }
          }
        });

        // Convert to array of category objects with images
        const categoriesWithImages = Array.from(categoryMap.entries()).map(
          ([categoryName, images]) => ({
            name: categoryName,
            images: images,
            productCount: productsData.filter(
              (p) => p.category === categoryName
            ).length,
          })
        );

        setCategories(categoriesWithImages);
        console.log("Categories with images:", categoriesWithImages); // Debug log
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Get random image from category images array
  const getRandomCategoryImage = (images) => {
    if (!images || images.length === 0) {
      return "/placeholder.jpg";
    }
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName.toLowerCase().replace(/\s+/g, "-")}`);
  };

  // If still loading, render a skeleton loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 font-urbanist">
        {/* Include SearchBar even during loading for consistency */}
        <SearchBar products={products} onSearch={setFilteredProducts} />

        {/* Categories Skeleton */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-urbanist">Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="shrink-0 w-32 h-40 bg-gray-200 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center my-6 font-urbanist">
          Featured Products
        </h1>
        {/* Grid container for skeleton cards */}
        <div
          className="
            grid gap-3 xs:gap-11 md:gap-18 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4
          "
        >
          {/* Render 6 skeleton cards to simulate loading */}
          {Array.from({ length: 6 }).map((_, index) => (
            <DisplayCard key={index} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  // Main render when not loading
  return (
    <div className="max-w-7xl mx-auto p-6 font-urbanist">
      {/* SearchBar */}
      <SearchBar products={products} onSearch={setFilteredProducts} />

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 font-urbanist">Categories</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found</p>
          ) : (
            categories.map((category, index) => {
              const randomImage = getRandomCategoryImage(category.images);

              return (
                <div
                  key={index}
                  onClick={() => handleCategoryClick(category.name)}
                  className="
                    shrink-0 w-32 h-40 bg-white rounded-lg shadow-sm
                    cursor-pointer hover:shadow-md hover:-translate-y-1
                    transition-all duration-300 border border-gray-200
                    overflow-hidden group relative flex flex-col
                  "
                >
                  {/* Category Image */}
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                    <img
                      src={randomImage}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Image failed to load:", randomImage);
                        e.target.src = "/placeholder.jpg";
                        e.target.className =
                          "w-12 h-12 object-contain opacity-50";
                      }}
                    />
                  </div>

                  {/* Category Info */}
                  <div className="p-3 flex-1 flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-center line-clamp-2 text-gray-800 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {category.productCount}{" "}
                      {category.productCount === 1 ? "product" : "products"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      <h1 className="text-2xl font-bold my-6 font-urbanist">
        Featured Products
      </h1>

      {filteredProducts.length === 0 ? (
        <p className="text-center p-4 text-gray-500">
          No featured products found
        </p>
      ) : (
        <div
          className="
            grid gap-3 xs:gap-11 md:gap-18 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4
            justify-items-center px-4
          "
        >
          {/* Map over filtered products and render a DisplayCard for each */}
          {filteredProducts.map((product) => (
            <DisplayCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
