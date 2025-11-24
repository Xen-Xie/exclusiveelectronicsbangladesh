import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import DisplayCard from "../../components/Common/DisplayCard";
import SearchBar from "../../components/Common/SearchBar";

export default function ProductsAdmin() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 25;

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

  const handleSearch = (results) => {
    setFilteredProducts(results);
    setCurrentPage(1); // Reset to first page after search
  };

  const categories = [...new Set(filteredProducts.map((p) => p.category))];

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const authToken = token || localStorage.getItem("token");

      await axios.delete(`${apiUrl}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setProducts((prev) => prev.filter((p) => p._id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p._id !== id));

      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product");
    }
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6 font-urbanist">
      {/* Search */}
      <div className="mb-6">
        <SearchBar products={products} onSearch={handleSearch} />
      </div>

      {/* Products */}
      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Loading...</h2>
              <div className="grid gap-3 xs:gap-11 md:gap-20 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <DisplayCard key={j} loading={true} />
                ))}
              </div>
            </div>
          ))
        : categories.map((cat) => {
            const catProducts = currentProducts.filter(
              (p) => p.category === cat
            );

            if (catProducts.length === 0) return null;

            return (
              <div key={cat} className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-info uppercase">
                  {cat}
                </h2>

                <div className="grid gap-3 xs:gap-11 md:gap-20 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center font-inter">
                  {catProducts.map((p) => (
                    <div key={p._id} className="relative group">
                      <DisplayCard product={p} admin />

                      {/* Delete Button */}
                      <div
                        className="
                          absolute top-2 right-2 flex flex-col gap-2
                          md:opacity-0 md:group-hover:opacity-100 
                          transition-all duration-200
                        "
                      >
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="bg-white shadow px-2 py-1 rounded-full hover:scale-110 transition"
                        >
                          <i className="fa-solid fa-trash-can text-danger text-sm"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
