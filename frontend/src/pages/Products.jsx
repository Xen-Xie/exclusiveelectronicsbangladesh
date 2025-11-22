import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../components/Common/SearchBar";
import DisplayCard from "../components/Common/DisplayCard";

function Products() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/products`);
        const data = res.data.data || [];
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiUrl]);

  // Handle search (and sort via SearchBar)
  const handleSearch = (results) => {
    setFilteredProducts(results);
  };

  const categories = [...new Set(filteredProducts.map((p) => p.category))];

  return (
    <div className="max-w-7xl mx-auto p-6 font-urbanist">
      {/* SearchBar with integrated filter */}
      <div className="mb-6">
        <SearchBar products={products} onSearch={handleSearch} />
      </div>

      {/* Products by Category */}
      {loading
        ? Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Loading...</h2>
              <div className="grid gap-3 md:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center mb-8 font-inter">
                {Array.from({ length: 5 }).map((_, i) => (
                  <DisplayCard key={i} loading={true} />
                ))}
              </div>
            </div>
          ))
        : categories.map((cat) => {
            const catProducts = filteredProducts.filter(
              (p) => p.category === cat
            );
            return (
              <div key={cat} className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-secondary/55">
                  {cat}
                </h2>
                <div className="grid gap-3 md:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center mb-8 font-inter">
                  {catProducts.map((p) => (
                    <DisplayCard key={p._id} product={p} />
                  ))}
                </div>
              </div>
            );
          })}
    </div>
  );
}

export default Products;
