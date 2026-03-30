/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import DisplayCard from "../../components/Common/DisplayCard";
import SearchBar from "../../components/Common/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function ProductsAdmin() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiUrl]);

  const handleSearch = (results) => {
    setFilteredProducts(results);
    setCurrentPage(1);
  };

  const categories = [
    ...new Set(filteredProducts.map((p) => p.category)),
  ].sort();

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setDeletingId(productToDelete._id);
    try {
      const authToken = token || localStorage.getItem("token");

      await axios.delete(`${apiUrl}/api/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      setFilteredProducts((prev) =>
        prev.filter((p) => p._id !== productToDelete._id),
      );

      toast.success(`"${productToDelete.name}" deleted successfully`);
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 font-urbanist">
        <div className="mb-6">
          <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-full max-w-md"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <DisplayCard key={i} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-urbanist">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Product Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="w-full sm:w-96">
          <SearchBar products={products} onSearch={handleSearch} />
        </div>
      </div>

      {/* Products by Category */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <i className="fa-solid fa-box-open text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        categories.map((cat) => {
          const catProducts = currentProducts.filter((p) => p.category === cat);
          if (catProducts.length === 0) return null;

          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize">
                  {cat}
                </h2>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {catProducts.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {catProducts.map((p) => (
                  <div key={p._id} className="relative group">
                    <DisplayCard product={p} />

                    {/* Delete Button - Mobile Friendly */}
                    <div className="absolute top-2 right-2 z-20">
                      <button
                        onClick={() => confirmDelete(p)}
                        disabled={deletingId === p._id}
                        className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all active:scale-95 md:hover:scale-110 focus:scale-95"
                        title="Delete product"
                      >
                        {deletingId === p._id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <i className="fa-solid fa-trash-can text-red-500 text-sm"></i>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold text-gray-800">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span>
            </span>
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-trash-can text-red-500 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Delete Product
                  </h3>
                </div>

                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-800">
                    {productToDelete.name}
                  </strong>
                  ?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone. This product will be permanently
                  removed from your store.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deletingId === productToDelete._id}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    {deletingId === productToDelete._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-trash-can text-sm"></i>
                        <span>Delete Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
