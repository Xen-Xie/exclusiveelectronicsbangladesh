import React, { useEffect, useState } from "react";
import axios from "axios";
import DisplayCard from "../components/Common/DisplayCard";
import SearchBar from "../components/Common/SearchBar";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;
  // fetch products when the component mounts or apiUrl changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/products`);
        // Handle different possible response structures for the products data
        let productsData = [];
        if (Array.isArray(res.data)) productsData = res.data;
        else if (res.data && Array.isArray(res.data.data))
          productsData = res.data.data;
        else if (res.data && Array.isArray(res.data.products))
          productsData = res.data.products;
        // Update the products state with the fetched data
        setProducts(productsData);
        const featured = productsData.filter((p) => p.featured);
        setFilteredProducts(featured);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl]);
  // If still loading, render a skeleton loading state
  if (loading) {
    return (
      <div className="px-4 max-w-[1400px] mx-auto">
        {/* Include SearchBar even during loading for consistency */}
        <SearchBar products={products} onSearch={setFilteredProducts} />

        <h1 className="text-2xl font-bold text-center my-6 font-urbanist">
          Featured Products
        </h1>
        {/* Grid container for skeleton cards */}
        <div
          className="
            grid gap-3 md:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center mb-8 font-inter
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
    <div className="px-4 max-w-[1400px] mx-auto">
      {/* searchbar */}
      <SearchBar products={products} onSearch={setFilteredProducts} />

      <h1 className="text-2xl font-bold text-center my-6 font-urbanist">
        Featured Products
      </h1>

      {filteredProducts.length === 0 ? (
        <p className="text-center p-4">No products found</p>
      ) : (
        <div
          className="
            grid gap-3 md:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center mb-8 font-inter
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
